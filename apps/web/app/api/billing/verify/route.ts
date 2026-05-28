/**
 * POST /api/billing/verify
 *
 * Called by the client immediately after the Razorpay checkout handler fires.
 * Verifies the HMAC signature, then marks the restaurant's plan as active.
 * The Razorpay webhook also does this — verify is the fast path for UX.
 *
 * NOTE: Uses $queryRaw / $executeRaw to avoid stale Prisma client issues.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
    await req.json() as {
      razorpay_payment_id: string
      razorpay_subscription_id: string
      razorpay_signature: string
    }

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Razorpay signature for subscriptions = HMAC-SHA256(payment_id + '|' + subscription_id, key_secret)
  const body = `${razorpay_payment_id}|${razorpay_subscription_id}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const rid = session.user!.id as string

  // Confirm this subscription belongs to this restaurant — raw SQL to bypass stale client
  const rows = await prisma.$queryRaw<Array<{ razorpaySubscriptionId: string | null }>>`
    SELECT "razorpaySubscriptionId" FROM "Restaurant" WHERE id = ${rid} LIMIT 1
  `
  const current = rows[0]

  if (!current || current.razorpaySubscriptionId !== razorpay_subscription_id) {
    return NextResponse.json({ error: 'Subscription mismatch' }, { status: 403 })
  }

  // Fetch the subscription from Razorpay to read the plan key from notes
  const { default: Razorpay } = await import('razorpay')
  const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const subscription = await (rzp.subscriptions.fetch as Function)(razorpay_subscription_id)
  const notes = (subscription.notes ?? {}) as Record<string, string>
  const planKey = notes.planKey as 'GROWTH' | 'PRO' | undefined

  if (!planKey || !['GROWTH', 'PRO'].includes(planKey)) {
    return NextResponse.json({ error: 'Could not determine plan from subscription notes' }, { status: 500 })
  }

  // current_end is a Unix timestamp from Razorpay
  const currentEnd: number | undefined = subscription.current_end
  const renewsAt = currentEnd ? new Date(currentEnd * 1000) : null

  // Update plan — raw SQL to bypass stale Prisma client
  if (renewsAt) {
    await prisma.$executeRaw`
      UPDATE "Restaurant"
      SET plan = ${planKey}::"Plan",
          "subscriptionStatus" = 'active',
          "planRenewsAt" = ${renewsAt}
      WHERE id = ${rid}
    `
  } else {
    await prisma.$executeRaw`
      UPDATE "Restaurant"
      SET plan = ${planKey}::"Plan",
          "subscriptionStatus" = 'active'
      WHERE id = ${rid}
    `
  }

  return NextResponse.json({ ok: true, plan: planKey })
}
