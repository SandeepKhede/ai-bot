/**
 * GET  /api/billing  — current plan + subscription info
 * POST /api/billing  — create a Razorpay subscription (returns subscriptionId + key for checkout)
 *
 * NOTE: All reads/writes of the new billing columns (razorpaySubscriptionId,
 * subscriptionStatus, planRenewsAt) use $queryRaw / $executeRaw so this works
 * even before the Prisma client is regenerated after the migration.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import Razorpay from 'razorpay'

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
}

/** Maps our plan enum → Razorpay plan IDs (set via env) */
const RAZORPAY_PLAN_IDS: Record<string, string | undefined> = {
  GROWTH: process.env.RAZORPAY_PLAN_GROWTH,
  PRO:    process.env.RAZORPAY_PLAN_PRO,
}

type BillingRow = {
  plan: string
  subscriptionStatus: string | null
  planRenewsAt: Date | null
  razorpaySubscriptionId: string | null
  monthlyAiCalls: number
  name: string
  adminEmail: string | null
}

async function getBillingRow(rid: string): Promise<BillingRow | null> {
  const rows = await prisma.$queryRaw<BillingRow[]>`
    SELECT plan, "subscriptionStatus", "planRenewsAt", "razorpaySubscriptionId",
           "monthlyAiCalls", name, "adminEmail"
    FROM "Restaurant"
    WHERE id = ${rid}
    LIMIT 1
  `
  return rows[0] ?? null
}

// ─── GET /api/billing ────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rid = session.user!.id as string
  const row = await getBillingRow(rid)
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    plan: row.plan,
    subscriptionStatus: row.subscriptionStatus,
    planRenewsAt: row.planRenewsAt,
    razorpaySubscriptionId: row.razorpaySubscriptionId,
    monthlyAiCalls: row.monthlyAiCalls,
  })
}

// ─── POST /api/billing ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planKey } = await req.json() as { planKey: string }

  if (!['GROWTH', 'PRO'].includes(planKey)) {
    return NextResponse.json({ error: 'Invalid plan. Must be GROWTH or PRO.' }, { status: 400 })
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Razorpay not configured on server.' }, { status: 503 })
  }

  const planId = RAZORPAY_PLAN_IDS[planKey]
  if (!planId) {
    return NextResponse.json(
      { error: `Razorpay plan ID for ${planKey} not configured (set RAZORPAY_PLAN_${planKey} env var).` },
      { status: 503 }
    )
  }

  const rid = session.user!.id as string
  const row = await getBillingRow(rid)
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Already on this plan and active — nothing to do
  if (row.plan === planKey && row.subscriptionStatus === 'active') {
    return NextResponse.json({ error: 'Already on this plan.' }, { status: 409 })
  }

  const rzp = getRazorpay()

  // Create Razorpay subscription
  const subscription = await (rzp.subscriptions.create as Function)({
    plan_id: planId,
    customer_notify: 1,
    quantity: 1,
    total_count: 120,   // 10-year maximum; cancel anytime
    notes: {
      restaurantId: rid,
      planKey,
      restaurantName: row.name,
    },
  })

  const subId = subscription.id as string

  // Persist subscription ID — use raw SQL to bypass stale Prisma client
  await prisma.$executeRaw`
    UPDATE "Restaurant"
    SET "razorpaySubscriptionId" = ${subId},
        "subscriptionStatus"     = 'created'
    WHERE id = ${rid}
  `

  return NextResponse.json({
    subscriptionId: subId,
    key: process.env.RAZORPAY_KEY_ID,
    prefillEmail: row.adminEmail ?? '',
    prefillName: row.name,
  })
}
