/**
 * POST /api/billing/webhook
 *
 * Razorpay webhook receiver. Handles subscription lifecycle events:
 *   subscription.activated  — first payment succeeded → mark plan active
 *   subscription.charged    — recurring payment succeeded → extend planRenewsAt
 *   subscription.pending    — payment scheduled (no action needed)
 *   subscription.halted     — payment failed after all retries → downgrade to STARTER
 *   subscription.cancelled  — cancelled → downgrade to STARTER immediately
 *   subscription.completed  — all billing cycles done → downgrade to STARTER
 *   subscription.expired    — expired → downgrade to STARTER
 *
 * Webhook secret is DIFFERENT from key_secret. Set RAZORPAY_WEBHOOK_SECRET in env.
 *
 * NOTE: Uses $executeRaw to bypass stale Prisma client that doesn't yet know
 * about the new billing columns. Safe to swap to prisma.restaurant.updateMany
 * after running `prisma generate`.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

const ACTIVATE_EVENTS  = new Set(['subscription.activated', 'subscription.charged'])
const DOWNGRADE_EVENTS = new Set([
  'subscription.halted',
  'subscription.cancelled',
  'subscription.completed',
  'subscription.expired',
])

export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  // Verify webhook authenticity
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (webhookSecret) {
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')
    if (expected !== signature) {
      console.warn('[billing/webhook] Invalid Razorpay signature — ignoring')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    console.warn('[billing/webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping signature check')
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event: string              = payload?.event ?? ''
  const subscriptionEntity         = payload?.payload?.subscription?.entity
  if (!subscriptionEntity) return NextResponse.json({ ok: true })

  const subscriptionId: string       = subscriptionEntity.id
  const notes: Record<string, string> = subscriptionEntity.notes ?? {}
  const restaurantId: string | undefined = notes.restaurantId
  const planKey: string | undefined       = notes.planKey

  if (!restaurantId) {
    console.warn(`[billing/webhook] No restaurantId in notes for ${subscriptionId}`)
    return NextResponse.json({ ok: true })
  }

  console.log(`[billing/webhook] event=${event} sub=${subscriptionId} restaurant=${restaurantId}`)

  // ── Activate / extend ────────────────────────────────────────────────────────
  if (ACTIVATE_EVENTS.has(event)) {
    if (!planKey || !['GROWTH', 'PRO'].includes(planKey)) {
      console.error(`[billing/webhook] Unknown planKey "${planKey}" for sub ${subscriptionId}`)
      return NextResponse.json({ ok: true })
    }

    const currentEnd: number | undefined = subscriptionEntity.current_end
    const renewsAt = currentEnd ? new Date(currentEnd * 1000) : null

    if (renewsAt) {
      await prisma.$executeRaw`
        UPDATE "Restaurant"
        SET plan                   = ${planKey}::"Plan",
            "subscriptionStatus"   = 'active',
            "planRenewsAt"         = ${renewsAt}
        WHERE id = ${restaurantId}
          AND "razorpaySubscriptionId" = ${subscriptionId}
      `
    } else {
      await prisma.$executeRaw`
        UPDATE "Restaurant"
        SET plan                   = ${planKey}::"Plan",
            "subscriptionStatus"   = 'active'
        WHERE id = ${restaurantId}
          AND "razorpaySubscriptionId" = ${subscriptionId}
      `
    }

    console.log(`[billing/webhook] ✅ Plan → ${planKey} for ${restaurantId}`)
    return NextResponse.json({ ok: true })
  }

  // ── Downgrade to STARTER ─────────────────────────────────────────────────────
  if (DOWNGRADE_EVENTS.has(event)) {
    const newStatus = subscriptionEntity.status ?? event.replace('subscription.', '')

    await prisma.$executeRaw`
      UPDATE "Restaurant"
      SET plan                   = 'STARTER'::"Plan",
          "subscriptionStatus"   = ${newStatus},
          "planRenewsAt"         = NULL
      WHERE id = ${restaurantId}
        AND "razorpaySubscriptionId" = ${subscriptionId}
    `

    console.log(`[billing/webhook] ⬇️ Downgraded to STARTER for ${restaurantId} (${event})`)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
