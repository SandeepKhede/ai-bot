import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import BillingClient from './BillingClient'

export const metadata = { title: 'Billing — WhatsApp Bot' }

const AI_CALL_LIMITS: Record<string, number> = {
  STARTER: 50,
  GROWTH:  150,
  PRO:     500,
}

export default async function BillingPage() {
  const session = await auth()
  const restaurantId = session!.user!.id as string

  // Use raw SQL so the billing page works even before `prisma generate` re-runs.
  // Once the Prisma client is regenerated (stop servers → pnpm prisma generate →
  // restart), you can swap this back to a normal findUnique with select.
  const rows = await prisma.$queryRaw<Array<{
    plan: string
    subscriptionStatus: string | null
    planRenewsAt: Date | null
    razorpaySubscriptionId: string | null
    monthlyAiCalls: number
  }>>`
    SELECT plan, "subscriptionStatus", "planRenewsAt", "razorpaySubscriptionId", "monthlyAiCalls"
    FROM "Restaurant"
    WHERE id = ${restaurantId}
    LIMIT 1
  `
  const restaurant = rows[0] ?? null

  const plan = (restaurant?.plan ?? 'STARTER') as 'STARTER' | 'GROWTH' | 'PRO'
  const usedAi = restaurant?.monthlyAiCalls ?? 0
  const limitAi = AI_CALL_LIMITS[plan] ?? 50

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Billing</h1>
      <p className="text-sm text-gray-500 mb-8">Manage your subscription and plan</p>

      <BillingClient
        currentPlan={plan}
        subscriptionStatus={restaurant?.subscriptionStatus ?? null}
        planRenewsAt={restaurant?.planRenewsAt?.toISOString() ?? null}
        hasSubscription={!!restaurant?.razorpaySubscriptionId}
        usedAiCalls={usedAi}
        aiCallLimit={limitAi}
      />
    </div>
  )
}
