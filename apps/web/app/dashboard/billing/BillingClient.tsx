'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = 'STARTER' | 'GROWTH' | 'PRO'

interface Props {
  currentPlan: Plan
  subscriptionStatus: string | null
  planRenewsAt: string | null
  hasSubscription: boolean
  usedAiCalls: number
  aiCallLimit: number
}

// ─── Plan catalogue ───────────────────────────────────────────────────────────

const PLANS: {
  key: Plan
  name: string
  price: string
  priceNote: string
  aiCalls: number
  features: string[]
  highlight: boolean
}[] = [
  {
    key: 'STARTER',
    name: 'Starter',
    price: 'Free',
    priceNote: 'forever',
    aiCalls: 50,
    features: [
      '50 AI queries / month',
      'WhatsApp bot',
      'Table reservations',
      'Order management',
      'Analytics dashboard',
      'Inbox & conversation viewer',
    ],
    highlight: false,
  },
  {
    key: 'GROWTH',
    name: 'Growth',
    price: '₹999',
    priceNote: '/ month',
    aiCalls: 150,
    features: [
      '150 AI queries / month',
      'Everything in Starter',
      'Broadcast messages (coming soon)',
      'Priority email support',
    ],
    highlight: true,
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: '₹2,499',
    priceNote: '/ month',
    aiCalls: 500,
    features: [
      '500 AI queries / month',
      'Everything in Growth',
      'Multi-branch support (coming soon)',
      'Dedicated support',
    ],
    highlight: false,
  },
]

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string | null }) {
  if (!status || status === 'created') return null
  const map: Record<string, { label: string; cls: string }> = {
    active:        { label: 'Active',     cls: 'bg-green-100 text-green-700' },
    authenticated: { label: 'Activating', cls: 'bg-blue-100 text-blue-700' },
    pending:       { label: 'Pending',    cls: 'bg-yellow-100 text-yellow-700' },
    halted:        { label: 'Halted',     cls: 'bg-red-100 text-red-700' },
    cancelled:     { label: 'Cancelled',  cls: 'bg-gray-100 text-gray-600' },
    completed:     { label: 'Completed',  cls: 'bg-gray-100 text-gray-600' },
    expired:       { label: 'Expired',    cls: 'bg-gray-100 text-gray-600' },
  }
  const meta = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.cls}`}>
      {meta.label}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BillingClient({
  currentPlan,
  subscriptionStatus,
  planRenewsAt,
  hasSubscription,
  usedAiCalls,
  aiCallLimit,
}: Props) {
  const [loading, setLoading] = useState<Plan | 'cancel' | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [plan, setPlan] = useState<Plan>(currentPlan)
  const [subStatus, setSubStatus] = useState(subscriptionStatus)
  const [renewsAt, setRenewsAt] = useState(planRenewsAt)
  const [scriptReady, setScriptReady] = useState(false)

  // Reset message after 6 s
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 6000)
    return () => clearTimeout(t)
  }, [message])

  async function subscribe(planKey: Plan) {
    setLoading(planKey)
    setMessage(null)

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error ?? 'Failed to create subscription' })
        return
      }

      const { subscriptionId, key, prefillEmail, prefillName } = data

      // Open Razorpay checkout
      const rzp = new (window as any).Razorpay({
        key,
        subscription_id: subscriptionId,
        name: 'WhatsApp Bot',
        description: `${planKey.charAt(0) + planKey.slice(1).toLowerCase()} Plan — Monthly`,
        prefill: { name: prefillName, email: prefillEmail },
        theme: { color: '#16a34a' },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_subscription_id: string
          razorpay_signature: string
        }) => {
          // Verify on server
          const verifyRes = await fetch('/api/billing/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })
          const verifyData = await verifyRes.json()

          if (verifyRes.ok) {
            setPlan(verifyData.plan as Plan)
            setSubStatus('active')
            setMessage({ type: 'success', text: `🎉 You're now on the ${verifyData.plan} plan!` })
          } else {
            setMessage({ type: 'error', text: verifyData.error ?? 'Payment verified but plan update failed. Contact support.' })
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the checkout — not an error
            setMessage(null)
          },
        },
      })

      rzp.open()
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(null)
    }
  }

  async function cancelSubscription() {
    if (!confirm('Cancel your subscription? Your plan stays active until the end of the billing period, then downgrades to Starter.')) return
    setLoading('cancel')
    setMessage(null)
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSubStatus('cancelled')
        setMessage({ type: 'success', text: 'Subscription cancelled. Your plan is active until the renewal date.' })
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Failed to cancel subscription' })
      }
    } finally {
      setLoading(null)
    }
  }

  const aiUsagePct = Math.min(100, Math.round((usedAiCalls / aiCallLimit) * 100))

  return (
    <>
      {/* Load Razorpay checkout.js */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
      />

      {/* Flash message */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current plan summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Current plan</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">{plan}</span>
              <StatusBadge status={subStatus} />
            </div>
          </div>
          {renewsAt && subStatus === 'active' && (
            <div className="text-right">
              <div className="text-xs text-gray-400">Renews on</div>
              <div className="text-sm font-medium text-gray-700">
                {new Date(renewsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          )}
          {renewsAt && subStatus === 'cancelled' && (
            <div className="text-right">
              <div className="text-xs text-gray-400">Active until</div>
              <div className="text-sm font-medium text-gray-700">
                {new Date(renewsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>

        {/* AI call usage bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>AI queries this month</span>
            <span>{usedAiCalls} / {aiCallLimit}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                aiUsagePct >= 90 ? 'bg-red-500' : aiUsagePct >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${aiUsagePct}%` }}
            />
          </div>
          {aiUsagePct >= 90 && (
            <p className="text-xs text-red-600 mt-1">⚠️ Nearly at limit — upgrade for more AI queries</p>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {PLANS.map(p => {
          const isCurrent = p.key === plan
          const isDowngrade = PLANS.findIndex(x => x.key === p.key) < PLANS.findIndex(x => x.key === plan)

          return (
            <div
              key={p.key}
              className={`relative bg-white rounded-xl border-2 p-6 flex flex-col ${
                p.highlight && !isCurrent
                  ? 'border-green-400 shadow-md'
                  : isCurrent
                    ? 'border-green-600'
                    : 'border-gray-200'
              }`}
            >
              {p.highlight && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Current plan
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">{p.price}</span>
                  <span className="text-sm text-gray-400">{p.priceNote}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                /* Cancel button for active paid plans */
                p.key !== 'STARTER' && hasSubscription && subStatus === 'active' ? (
                  <button
                    onClick={cancelSubscription}
                    disabled={loading === 'cancel'}
                    className="w-full py-2 rounded-lg text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                  >
                    {loading === 'cancel' ? 'Cancelling…' : 'Cancel subscription'}
                  </button>
                ) : (
                  <div className="w-full py-2 text-center rounded-lg text-sm font-medium bg-gray-100 text-gray-500 cursor-default">
                    {subStatus === 'cancelled' ? 'Cancelling at period end' : 'Your current plan'}
                  </div>
                )
              ) : isDowngrade ? (
                <div className="w-full py-2 text-center rounded-lg text-sm text-gray-400 cursor-default border border-gray-200">
                  Downgrade not available
                </div>
              ) : (
                <button
                  onClick={() => subscribe(p.key)}
                  disabled={!scriptReady || loading === p.key}
                  className={`w-full py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                    p.highlight
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {loading === p.key
                    ? 'Opening checkout…'
                    : !scriptReady
                      ? 'Loading…'
                      : `Upgrade to ${p.name}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* FAQ / notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Billing notes</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>💳 Payments processed securely by Razorpay. All major cards, UPI, and netbanking accepted.</li>
          <li>🔄 Subscriptions renew automatically every month. Cancel anytime before the renewal date.</li>
          <li>📉 Cancelling keeps your plan active until the end of the billing period, then reverts to Starter.</li>
          <li>🧮 AI query count resets on the 1st of each month.</li>
          <li>📧 For billing issues, email <a href="mailto:support@yourapp.com" className="text-green-600 underline">support@yourapp.com</a></li>
        </ul>
      </div>
    </>
  )
}
