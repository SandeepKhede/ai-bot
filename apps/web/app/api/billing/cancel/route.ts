/**
 * POST /api/billing/cancel
 *
 * Cancels the active Razorpay subscription at the end of the current billing cycle.
 * The plan stays active until planRenewsAt; the webhook then downgrades to STARTER.
 *
 * NOTE: Uses $queryRaw / $executeRaw to avoid stale Prisma client issues.
 */
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import Razorpay from 'razorpay'

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rid = session.user!.id as string

  // Raw SQL — bypass stale Prisma client that doesn't know about razorpaySubscriptionId
  const rows = await prisma.$queryRaw<Array<{
    razorpaySubscriptionId: string | null
    subscriptionStatus: string | null
  }>>`
    SELECT "razorpaySubscriptionId", "subscriptionStatus"
    FROM "Restaurant"
    WHERE id = ${rid}
    LIMIT 1
  `
  const row = rows[0]

  if (!row?.razorpaySubscriptionId) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  if (row.subscriptionStatus === 'cancelled') {
    return NextResponse.json({ error: 'Subscription already cancelled' }, { status: 409 })
  }

  const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  // cancel_at_cycle_end: 1 → stays active until current period ends, then cancels
  await (rzp.subscriptions.cancel as Function)(row.razorpaySubscriptionId, 1)

  await prisma.$executeRaw`
    UPDATE "Restaurant"
    SET "subscriptionStatus" = 'cancelled'
    WHERE id = ${rid}
  `

  return NextResponse.json({ ok: true })
}
