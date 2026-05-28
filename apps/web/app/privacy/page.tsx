import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — WhatsMenu',
  description: 'How WhatsMenu collects, uses, and protects your data.',
}

const EFFECTIVE = '1 June 2026'
const COMPANY   = 'WhatsMenu Technologies'
const EMAIL     = 'support@whatsmenu.in'

export default function PrivacyPage() {
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
        <h1>Privacy Policy</h1>
        <p className="lead text-gray-500">
          This Privacy Policy explains how {COMPANY} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, stores, and
          protects information when you use WhatsMenu.
        </p>

        <Section title="1. Who We Are">
          <p>
            {COMPANY} operates the WhatsMenu platform — an AI-powered WhatsApp automation service
            for restaurants, accessible at our website and via API. If you have any privacy-related
            questions, contact us at{' '}
            <a href={`mailto:${EMAIL}`} className="text-green-600 underline">{EMAIL}</a>.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <h3 className="font-semibold text-gray-800 mt-4 mb-2">2a. Restaurant Account Data</h3>
          <ul>
            <li>Business name, admin email address, and bcrypt-hashed password.</li>
            <li>WhatsApp Business phone number ID and Meta access token (stored encrypted).</li>
            <li>Business address, location link, and operating hours.</li>
            <li>Razorpay customer ID and subscription ID (for billing management).</li>
            <li>Menu items, FAQs, and configuration settings you add to the platform.</li>
          </ul>

          <h3 className="font-semibold text-gray-800 mt-4 mb-2">2b. Customer Interaction Data</h3>
          <ul>
            <li>WhatsApp phone numbers of customers who message your restaurant.</li>
            <li>Customer names (when provided during ordering or reservation flows).</li>
            <li>Message logs (inbound and outbound) for the conversation inbox and analytics.</li>
            <li>Order details: items, quantities, total amounts, and order status.</li>
            <li>Reservation details: date, time, party size, and UPI UTR numbers (when applicable).</li>
          </ul>

          <h3 className="font-semibold text-gray-800 mt-4 mb-2">2c. Usage & Technical Data</h3>
          <ul>
            <li>Session data stored in Redis (TTL 30 minutes) for active conversation context.</li>
            <li>Log data including timestamps, message direction, and resolution type (FAQ / AI / session / human).</li>
            <li>Standard web server logs (IP address, browser type) from the admin portal.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <li><strong>Service delivery</strong> — To operate the WhatsApp bot, process orders, manage reservations, and provide the admin dashboard.</li>
            <li><strong>Billing</strong> — To process subscription payments via Razorpay and send invoices.</li>
            <li><strong>AI responses</strong> — Message content is sent to OpenAI&rsquo;s API to generate contextual replies. OpenAI does not use API data to train models (per their enterprise policy).</li>
            <li><strong>Analytics</strong> — Aggregated, anonymised usage metrics to show you trends in your dashboard.</li>
            <li><strong>Product improvements</strong> — Anonymised aggregate data to improve our platform.</li>
            <li><strong>Communications</strong> — Transactional emails (receipts, alerts) and occasional product updates. You can unsubscribe from non-transactional emails at any time.</li>
          </ul>
        </Section>

        <Section title="4. Data Sharing & Third Parties">
          <p>We do not sell personal data. We share data only with the following categories of third-party processors:</p>
          <ul>
            <li><strong>Meta Platforms (WhatsApp Cloud API)</strong> — for message delivery. Governed by Meta&rsquo;s data policy.</li>
            <li><strong>OpenAI</strong> — customer message text is processed to generate AI replies. OpenAI&rsquo;s API data usage policy applies.</li>
            <li><strong>Razorpay</strong> — billing and payment processing. Your card/UPI data is handled directly by Razorpay and never stored on our servers.</li>
            <li><strong>Railway / cloud hosting</strong> — our infrastructure provider for compute and managed database/cache services.</li>
          </ul>
          <p>
            We may disclose data when required by law, court order, or to protect our rights,
            property, or safety.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <ul>
            <li><strong>Active accounts</strong> — data is retained for as long as you maintain an account.</li>
            <li><strong>Deleted accounts</strong> — we retain data for up to 90 days after deletion for legal and audit purposes, then permanently delete it.</li>
            <li><strong>Message logs</strong> — retained for up to 12 months.</li>
            <li><strong>Redis sessions</strong> — automatically expire after 30 minutes of inactivity.</li>
          </ul>
        </Section>

        <Section title="6. Data Security">
          <p>
            We implement appropriate technical and organisational measures including:
          </p>
          <ul>
            <li>Passwords stored using bcrypt (cost factor 10).</li>
            <li>WhatsApp access tokens stored encrypted in the database.</li>
            <li>HTTPS enforced for all web and API traffic.</li>
            <li>Database access restricted to application servers via private network.</li>
            <li>Regular security updates applied to all dependencies.</li>
          </ul>
          <p>
            No method of transmission over the internet is 100% secure. In the event of a data breach
            that poses a risk to your rights, we will notify you as required by applicable law.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>Under applicable Indian data protection law, you have the right to:</p>
          <ul>
            <li><strong>Access</strong> — request a copy of personal data we hold about you.</li>
            <li><strong>Correction</strong> — request correction of inaccurate data.</li>
            <li><strong>Deletion</strong> — request deletion of your account and associated data.</li>
            <li><strong>Portability</strong> — request an export of your restaurant data in a machine-readable format.</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{' '}
            <a href={`mailto:${EMAIL}`} className="text-green-600 underline">{EMAIL}</a>. We will respond within 30 days.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            The WhatsMenu admin portal uses minimal cookies necessary for authentication (session token
            stored in an HttpOnly, Secure cookie via NextAuth). We do not use advertising or tracking cookies.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            The Service is intended for use by businesses and is not directed at children under 18.
            We do not knowingly collect personal data from minors.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. We will notify you of material changes
            via email or an in-app notice at least 7 days before they take effect. The effective
            date at the top of this page will reflect the latest revision.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            For privacy inquiries, data requests, or to report a concern:
          </p>
          <address className="not-italic text-gray-600">
            {COMPANY}<br />
            Mumbai, Maharashtra, India<br />
            <a href={`mailto:${EMAIL}`} className="text-green-600 underline">{EMAIL}</a>
          </address>
        </Section>
      </article>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 flex gap-4 text-sm">
        <Link href="/terms"  className="text-green-600 underline">Terms of Service</Link>
        <Link href="/refund" className="text-green-600 underline">Refund Policy</Link>
        <Link href="/"       className="text-green-600 underline">Home</Link>
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
