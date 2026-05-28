import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — WhatsMenu',
  description: 'Terms and conditions governing the use of WhatsMenu services.',
}

const EFFECTIVE = '1 June 2026'
const COMPANY   = 'WhatsMenu Technologies'
const EMAIL     = 'support@whatsmenu.in'

export default function TermsPage() {
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
        <h1>Terms of Service</h1>
        <p className="lead text-gray-500">
          Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using WhatsMenu. By
          creating an account or using the Service, you agree to be bound by these Terms.
        </p>

        <Section title="1. Definitions">
          <ul>
            <li><strong>&ldquo;Service&rdquo;</strong> means the WhatsMenu web application, API, and any related software provided by {COMPANY}.</li>
            <li><strong>&ldquo;Restaurant&rdquo;</strong> or <strong>&ldquo;you&rdquo;</strong> means the business entity that has registered an account.</li>
            <li><strong>&ldquo;Customer&rdquo;</strong> means the end-users who interact with the restaurant via WhatsApp.</li>
            <li><strong>&ldquo;Subscription&rdquo;</strong> means a paid monthly plan (Growth or Pro) purchased through Razorpay.</li>
          </ul>
        </Section>

        <Section title="2. Description of Service">
          <p>
            WhatsMenu is a Software-as-a-Service (SaaS) platform that enables restaurants to deploy
            an AI-powered WhatsApp chatbot. The bot handles customer inquiries, food orders, table
            reservations, and payment collection on the restaurant&rsquo;s behalf. The Service is
            delivered entirely online; no physical product is delivered.
          </p>
        </Section>

        <Section title="3. Eligibility & Account Registration">
          <ul>
            <li>You must be at least 18 years old and legally authorised to enter contracts on behalf of your business.</li>
            <li>You must provide accurate, current, and complete information during registration and keep it updated.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>Accounts are non-transferable. You may not share access with third parties.</li>
          </ul>
        </Section>

        <Section title="4. Subscription Plans & Billing">
          <p>We offer three plans:</p>
          <ul>
            <li><strong>Starter (Free)</strong> — 50 AI replies per month, core features.</li>
            <li><strong>Growth (₹999 / month)</strong> — 150 AI replies, analytics, UTR payments, inbox.</li>
            <li><strong>Pro (₹2,499 / month)</strong> — 500 AI replies, all features including broadcasts and multi-branch.</li>
          </ul>
          <p>
            Paid subscriptions are processed monthly via Razorpay. Your designated payment method
            will be charged automatically on the renewal date. All amounts are in Indian Rupees (INR)
            and are inclusive of applicable taxes unless stated otherwise.
          </p>
          <p>
            If a payment fails, Razorpay may retry the charge. Persistent failures will result in
            downgrade to the Starter plan until payment is resolved.
          </p>
        </Section>

        <Section title="5. Free Trial">
          <p>
            New paid subscriptions include a 7-day free trial period. You will not be charged
            until the trial ends. You may cancel before the trial ends to avoid any charge.
          </p>
        </Section>

        <Section title="6. Cancellation">
          <p>
            You may cancel your subscription at any time from your dashboard under <em>Billing</em>.
            Cancellation is effective at the end of the current billing cycle. You retain full access
            to paid features until the cycle ends. No further charges will be made after cancellation.
          </p>
        </Section>

        <Section title="7. Refunds">
          <p>
            Please see our separate <Link href="/refund" className="text-green-600 underline">Refund &amp; Cancellation Policy</Link> for
            full details. In summary: refunds are available within 7 days of your first paid subscription.
            After 7 days, charges for the current billing cycle are non-refundable.
          </p>
        </Section>

        <Section title="8. Acceptable Use">
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Send spam, unsolicited messages, or engage in deceptive marketing.</li>
            <li>Violate Meta&rsquo;s WhatsApp Business Policy or Terms of Service.</li>
            <li>Transmit illegal, harmful, or offensive content.</li>
            <li>Attempt to reverse-engineer, hack, or disrupt the platform.</li>
            <li>Impersonate any person or entity.</li>
          </ul>
          <p>
            Violation of these terms may result in immediate suspension or termination of your
            account without refund.
          </p>
        </Section>

        <Section title="9. Intellectual Property">
          <p>
            All software, design, trademarks, and content comprising the Service are owned by
            {' '}{COMPANY} or its licensors. You are granted a limited, non-exclusive, non-transferable
            licence to access and use the Service for your restaurant business.
          </p>
          <p>
            You retain ownership of your restaurant data (menus, FAQs, customer conversations).
            By using the Service, you grant us a limited licence to process that data to provide
            and improve the Service.
          </p>
        </Section>

        <Section title="10. Third-Party Services">
          <p>The Service integrates with third-party platforms including:</p>
          <ul>
            <li><strong>Meta / WhatsApp Cloud API</strong> — for message delivery.</li>
            <li><strong>OpenAI</strong> — for AI-powered query responses.</li>
            <li><strong>Razorpay</strong> — for subscription billing and payment processing.</li>
          </ul>
          <p>
            Your use of these services is additionally subject to their respective terms and policies.
            We are not responsible for outages or policy changes by these third parties.
          </p>
        </Section>

        <Section title="11. Service Availability & SLA">
          <p>
            We aim for 99% uptime but do not guarantee uninterrupted access. Planned maintenance
            will be communicated in advance where possible. We are not liable for losses arising
            from downtime caused by third-party services (Meta, OpenAI, Razorpay, hosting providers).
          </p>
        </Section>

        <Section title="12. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, {COMPANY} shall not be liable for
            indirect, incidental, special, or consequential damages — including lost profits, loss of
            data, or loss of goodwill — arising from your use of or inability to use the Service.
          </p>
          <p>
            Our total liability to you for any claim arising from these Terms or the Service shall
            not exceed the amount you paid us in the three (3) months preceding the claim.
          </p>
        </Section>

        <Section title="13. Modifications to Terms">
          <p>
            We may update these Terms from time to time. We will notify you by email or an in-app
            notice at least 7 days before material changes take effect. Continued use of the Service
            after the effective date constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="14. Governing Law & Disputes">
          <p>
            These Terms are governed by the laws of India. Any disputes shall first be attempted to
            be resolved amicably. Unresolved disputes shall be subject to the exclusive jurisdiction
            of the courts of Mumbai, Maharashtra, India.
          </p>
        </Section>

        <Section title="15. Contact">
          <p>
            For questions regarding these Terms, please contact us at{' '}
            <a href={`mailto:${EMAIL}`} className="text-green-600 underline">{EMAIL}</a>.
          </p>
          <address className="not-italic text-gray-600 mt-2">
            {COMPANY}<br />
            Mumbai, Maharashtra, India
          </address>
        </Section>
      </article>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 flex gap-4 text-sm">
        <Link href="/privacy" className="text-green-600 underline">Privacy Policy</Link>
        <Link href="/refund"  className="text-green-600 underline">Refund Policy</Link>
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
