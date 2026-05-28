import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — WhatsMenu',
  description: 'WhatsMenu refund and cancellation terms for subscription plans.',
}

const EFFECTIVE = '1 June 2026'
const COMPANY   = 'WhatsMenu Technologies'
const EMAIL     = 'support@whatsmenu.in'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-green-600 font-bold text-lg">← WhatsMenu</Link>
          <span className="text-xs text-gray-400">Effective: {EFFECTIVE}</span>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-gray prose-sm sm:prose-base">
        <h1>Refund &amp; Cancellation Policy</h1>
        <p className="lead text-gray-500">
          This policy explains how cancellations and refunds work for WhatsMenu subscriptions.
          We aim to be fair and transparent about our billing practices.
        </p>

        {/* Summary box */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 not-prose mb-8">
          <div className="font-bold text-green-800 mb-3">Quick Summary</div>
          <ul className="space-y-2 text-sm text-green-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>Cancel anytime — no long-term contracts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>Full refund within 7 days of your first paid subscription.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>Access continues until end of billing cycle after cancellation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">✗</span>
              <span>No pro-rata refunds for unused days in current cycle (after 7-day window).</span>
            </li>
          </ul>
        </div>

        <Section title="1. Subscription Model">
          <p>
            WhatsMenu offers monthly recurring subscriptions billed in Indian Rupees (INR) via
            Razorpay. The three plans are:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-4 py-2 font-semibold text-gray-700 border border-gray-200">Plan</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700 border border-gray-200">Monthly Price</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700 border border-gray-200">Billed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border border-gray-200 text-gray-600">Starter</td>
                  <td className="px-4 py-2 border border-gray-200 text-gray-600">Free</td>
                  <td className="px-4 py-2 border border-gray-200 text-gray-600">No charge</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-4 py-2 border border-gray-200 font-semibold text-gray-800">Growth</td>
                  <td className="px-4 py-2 border border-gray-200 font-semibold text-gray-800">₹999</td>
                  <td className="px-4 py-2 border border-gray-200 text-gray-600">Monthly via Razorpay</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-200 font-semibold text-gray-800">Pro</td>
                  <td className="px-4 py-2 border border-gray-200 font-semibold text-gray-800">₹2,499</td>
                  <td className="px-4 py-2 border border-gray-200 text-gray-600">Monthly via Razorpay</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Subscriptions automatically renew on the same calendar date each month unless cancelled.
          </p>
        </Section>

        <Section title="2. Free Trial">
          <p>
            New subscriptions to Growth or Pro include a <strong>7-day free trial</strong>. Your
            payment method is authorised but not charged during the trial. If you cancel before the
            trial ends, you will not be charged at all.
          </p>
        </Section>

        <Section title="3. Cancellation">
          <p>
            You may cancel your subscription at any time:
          </p>
          <ol>
            <li>Log in to your WhatsMenu dashboard.</li>
            <li>Navigate to <strong>Billing</strong> in the sidebar.</li>
            <li>Click <strong>Cancel Subscription</strong> and confirm.</li>
          </ol>
          <p>
            Cancellation is processed immediately. Your account is downgraded to the free Starter
            plan at the end of the current billing cycle. You will continue to have access to all
            paid features until that date.
          </p>
          <p>
            Alternatively, email <a href={`mailto:${EMAIL}`} className="text-green-600 underline">{EMAIL}</a> with
            the subject line <em>Cancel Subscription</em> and we will process it within one business day.
          </p>
        </Section>

        <Section title="4. Refund Eligibility">
          <h3 className="font-semibold text-gray-800 mt-4 mb-2">4a. First Subscription — 7-Day Window</h3>
          <p>
            If you subscribe to Growth or Pro for the <strong>first time</strong> and are unsatisfied,
            you may request a <strong>full refund within 7 days</strong> of the initial charge.
          </p>
          <p>
            To request a refund under this policy, email{' '}
            <a href={`mailto:${EMAIL}`} className="text-green-600 underline">{EMAIL}</a> with:
          </p>
          <ul>
            <li>Your registered email address.</li>
            <li>The Razorpay payment ID or receipt number.</li>
            <li>A brief reason for the refund request (optional but helps us improve).</li>
          </ul>
          <p>
            Approved refunds are processed within <strong>5–7 business days</strong> back to the
            original payment method. Razorpay processing times may vary.
          </p>

          <h3 className="font-semibold text-gray-800 mt-4 mb-2">4b. Renewal Charges</h3>
          <p>
            Monthly renewal charges are <strong>non-refundable</strong> once processed, as the full
            month of service is available from the renewal date. We recommend cancelling before your
            renewal date if you no longer wish to continue.
          </p>

          <h3 className="font-semibold text-gray-800 mt-4 mb-2">4c. Service Disruption</h3>
          <p>
            If WhatsMenu experiences a verified outage exceeding <strong>72 consecutive hours</strong>{' '}
            due to a fault on our end, we will provide a pro-rata credit for the affected days.
            Credits are applied to your next billing cycle; cash refunds are at our discretion.
          </p>
        </Section>

        <Section title="5. Non-Refundable Situations">
          <p>Refunds will not be issued in the following cases:</p>
          <ul>
            <li>The 7-day first-subscription window has passed.</li>
            <li>Account suspended due to violation of our Terms of Service.</li>
            <li>Outages or errors caused by Meta (WhatsApp), OpenAI, or Razorpay.</li>
            <li>You no longer use the service but did not cancel before the renewal date.</li>
            <li>Partial-month usage after upgrading mid-cycle.</li>
          </ul>
        </Section>

        <Section title="6. Plan Downgrades">
          <p>
            When you cancel a paid subscription, your account downgrades to the free Starter plan
            at the end of the billing cycle. You do not lose your data — menus, FAQs, and historical
            orders/reservations are preserved. Features exclusive to Growth/Pro become unavailable.
          </p>
          <p>
            You may resubscribe to a paid plan at any time.
          </p>
        </Section>

        <Section title="7. Dispute Resolution">
          <p>
            If you believe you have been charged in error, contact us at{' '}
            <a href={`mailto:${EMAIL}`} className="text-green-600 underline">{EMAIL}</a> within 30 days of the charge.
            We will investigate and respond within 5 business days.
          </p>
          <p>
            For payment disputes through Razorpay, you may also raise a dispute directly through
            your bank or card issuer. However, we encourage contacting us first as we can resolve
            most issues faster directly.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>For refund requests or billing questions:</p>
          <address className="not-italic text-gray-600">
            {COMPANY}<br />
            Mumbai, Maharashtra, India<br />
            <a href={`mailto:${EMAIL}`} className="text-green-600 underline">{EMAIL}</a><br />
            Response time: within 1 business day
          </address>
        </Section>
      </article>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 flex gap-4 text-sm">
        <Link href="/terms"   className="text-green-600 underline">Terms of Service</Link>
        <Link href="/privacy" className="text-green-600 underline">Privacy Policy</Link>
        <Link href="/"        className="text-green-600 underline">Home</Link>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-gray-600 space-y-3">{children}</div>
    </section>
  )
}
