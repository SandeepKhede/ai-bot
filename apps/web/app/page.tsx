import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WhatsMenu — AI WhatsApp Assistant for Restaurants',
  description:
    'Automate orders, reservations & customer support on WhatsApp. Save time, increase sales, and delight every customer. Starts free.',
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function WAIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.119 1.526 5.845L0 24l6.348-1.498A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.007-1.372l-.359-.214-3.724.879.894-3.638-.233-.374A9.818 9.818 0 1 1 12 21.818z" />
    </svg>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <WAIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">WhatsMenu</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features"    className="hover:text-green-600 transition">Features</a>
            <a href="#how-it-works" className="hover:text-green-600 transition">How It Works</a>
            <a href="#pricing"     className="hover:text-green-600 transition">Pricing</a>
            <a href="#faq"         className="hover:text-green-600 transition">FAQ</a>
            <a href="#contact"     className="hover:text-green-600 transition">Contact</a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/login"  className="hidden sm:block text-sm font-medium text-gray-600 hover:text-green-700 px-3 py-2 rounded-lg transition">
              Log In
            </Link>
            <Link href="/signup" className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ─── Phone mockup ─────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[248px] select-none">
      {/* Outer frame */}
      <div className="bg-gray-900 rounded-[2.5rem] p-[10px] shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
        {/* Screen */}
        <div className="bg-white rounded-[2rem] overflow-hidden">
          {/* WA header */}
          <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-400 flex items-center justify-center text-white text-xs font-bold shadow">TB</div>
            <div className="flex-1">
              <div className="text-white text-xs font-semibold leading-tight">Taste Bistro</div>
              <div className="text-green-300 text-[10px] leading-tight">AI Assistant • Online</div>
            </div>
            <WAIcon className="w-4 h-4 text-green-300" />
          </div>

          {/* Chat body */}
          <div className="bg-[#ece5dd] px-3 py-3 space-y-2.5 min-h-[360px]">
            {/* Bot welcome */}
            <div className="flex">
              <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 max-w-[88%] shadow-sm">
                <p className="text-[11px] text-gray-800 leading-relaxed">👋 Welcome to <strong>Taste Bistro!</strong> I'm your AI assistant. How can I help you today?</p>
              </div>
            </div>
            {/* Quick options */}
            <div className="flex flex-col gap-1.5 items-start">
              {['📋 View Menu', '📅 Reserve a Table', '🛵 Order Food'].map(opt => (
                <div key={opt} className="bg-white border border-green-200 text-green-700 text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  {opt}
                </div>
              ))}
            </div>
            {/* User */}
            <div className="flex justify-end">
              <div className="bg-[#d9fdd3] rounded-xl rounded-tr-none px-3 py-2 max-w-[75%] shadow-sm">
                <p className="text-[11px] text-gray-800">📅 Reserve a Table</p>
              </div>
            </div>
            {/* Bot */}
            <div className="flex">
              <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 max-w-[88%] shadow-sm">
                <p className="text-[11px] text-gray-800 leading-relaxed">Sure! What date would you like to visit us?</p>
              </div>
            </div>
            {/* User */}
            <div className="flex justify-end">
              <div className="bg-[#d9fdd3] rounded-xl rounded-tr-none px-3 py-2 max-w-[75%] shadow-sm">
                <p className="text-[11px] text-gray-800">Tomorrow, 7 PM — 4 people</p>
              </div>
            </div>
            {/* Bot confirm */}
            <div className="flex">
              <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 max-w-[88%] shadow-sm">
                <p className="text-[11px] text-gray-800 leading-relaxed">✅ <strong>Reservation confirmed!</strong> See you tomorrow at 7 PM. We'll send a reminder an hour before.</p>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[10px] text-gray-400">Type a message…</div>
            <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-3 -right-5 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
        AI-POWERED
      </div>
      <div className="absolute -bottom-4 -left-6 bg-white text-gray-900 text-[10px] font-semibold px-3 py-2 rounded-xl shadow-xl border border-gray-100 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
        Instant Replies 24/7
      </div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/40 to-white pt-16 pb-20 lg:pt-24 lg:pb-28">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-50/60 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <WAIcon className="w-3.5 h-3.5" />
              AI-POWERED WHATSAPP BOT
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
              Your AI Restaurant<br />
              Assistant on{' '}
              <span className="text-green-600">WhatsApp</span>
              <WAIcon className="inline w-10 h-10 ml-2 -mt-1 text-green-500" />
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              Automate orders, reservations &amp; customer support on WhatsApp.
              Save time, increase sales, and delight every customer — 24/7, no staff required.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/signup"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition text-sm">
                Start Free Trial
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <a href="#how-it-works"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-green-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:border-green-300 transition text-sm bg-white">
                See How It Works →
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {['R', 'S', 'K', 'M', 'A'].map((l, i) => (
                  <div key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ background: ['#16a34a','#2563eb','#dc2626','#d97706','#7c3aed'][i] }}>
                    {l}
                  </div>
                ))}
              </div>
              <span><strong className="text-gray-800">500+</strong> restaurants trust WhatsMenu</span>
            </div>
          </div>

          {/* Right — phone */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: '🛵', label: 'Order Taking' },
            { icon: '📅', label: 'Reservations' },
            { icon: '🤖', label: 'AI Responses' },
            { icon: '📊', label: 'Analytics' },
            { icon: '💬', label: 'Inbox & Handoff' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const stats = [
    { value: '500+',  label: 'Restaurants' },
    { value: '50k+',  label: 'Orders Handled' },
    { value: '1M+',   label: 'Messages Sent' },
    { value: '< 2 s', label: 'Avg. Response Time' },
  ]
  return (
    <section className="bg-green-600 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center text-white">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold">{s.value}</div>
              <div className="text-green-200 text-sm mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🛵',
    title: 'Smart Order Taking',
    desc: 'Customers browse your menu, add items to cart, and place orders — all inside WhatsApp. No app download required.',
  },
  {
    icon: '📅',
    title: 'Table Reservations',
    desc: 'Automated multi-turn booking flow — date, time, party size, and optional UPI advance payment to secure tables.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Replies',
    desc: 'GPT-4o-mini answers menu questions, opening hours, location queries, and custom FAQs instantly, around the clock.',
  },
  {
    icon: '👤',
    title: 'Human Handoff',
    desc: 'One toggle silences the bot so your staff can reply directly from WhatsApp. Customers are notified automatically.',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Track messages, orders, reservations, and revenue in one place. See 7-day trends and top-selling menu items.',
  },
  {
    icon: '💳',
    title: 'UPI Advance Payments',
    desc: 'Collect table-booking deposits via UPI. Bot sends your UPI QR, customer pays, you verify UTR in the dashboard.',
  },
]

function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">FEATURES</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Everything your restaurant needs</h2>
          <p className="text-gray-500 max-w-xl mx-auto">One WhatsApp bot replaces a full front-desk team — without missing a single customer message.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Sign Up & Set Up',
      desc: 'Create your account and complete our 5-minute setup wizard — add your menu, FAQs, business hours, and location.',
    },
    {
      num: '02',
      title: 'Connect WhatsApp',
      desc: 'Link your existing WhatsApp Business number via Meta Cloud API. We handle the webhook setup — no coding required.',
    },
    {
      num: '03',
      title: 'Go Live',
      desc: 'Activate the bot. Your customers start getting instant replies, placing orders, and booking tables — automatically.',
    },
  ]
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">HOW IT WORKS</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Live in under 10 minutes</h2>
          <p className="text-gray-500 max-w-xl mx-auto">No technical knowledge needed. Our guided wizard walks you through every step.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[-calc(50%-2rem)] h-0.5 bg-green-100 z-0" />
              )}
              <div className="relative z-10 bg-green-50 rounded-2xl p-6 border border-green-100 text-center">
                <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center text-lg font-extrabold mx-auto mb-4 shadow-md">
                  {s.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    sub: 'forever',
    highlight: false,
    features: [
      '50 AI replies / month',
      'Menu & FAQ management',
      'Basic reservations flow',
      'Order taking via WhatsApp',
      'Admin dashboard',
      'Email support',
    ],
    cta: 'Get Started Free',
    href: '/signup',
  },
  {
    name: 'Growth',
    price: '₹999',
    sub: 'per month',
    highlight: true,
    features: [
      '150 AI replies / month',
      'Everything in Starter',
      'Analytics & insights',
      'UPI advance payments (UTR)',
      'Human handoff toggle',
      'Conversation inbox',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
  },
  {
    name: 'Pro',
    price: '₹2,499',
    sub: 'per month',
    highlight: false,
    features: [
      '500 AI replies / month',
      'Everything in Growth',
      'Broadcast messages',
      'Multi-branch support',
      'Customer tagging',
      'WhatsApp message templates',
      'Dedicated support',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">PRICING</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Simple, transparent pricing</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Start free. Upgrade when you're ready. Cancel anytime — no lock-in contracts.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map(p => (
            <div key={p.name}
              className={`rounded-2xl border p-7 ${
                p.highlight
                  ? 'bg-green-600 border-green-600 shadow-2xl shadow-green-200 relative'
                  : 'bg-white border-gray-100 shadow-sm'
              }`}>
              {p.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200 shadow">
                  MOST POPULAR
                </div>
              )}
              <div className={`text-sm font-semibold mb-1 ${p.highlight ? 'text-green-200' : 'text-gray-500'}`}>{p.name}</div>
              <div className={`text-4xl font-extrabold mb-0.5 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.price}</div>
              <div className={`text-sm mb-6 ${p.highlight ? 'text-green-200' : 'text-gray-400'}`}>{p.sub}</div>

              <ul className="space-y-3 mb-8">
                {p.features.map(f => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${p.highlight ? 'text-green-100' : 'text-gray-600'}`}>
                    <span className={p.highlight ? 'text-green-300 mt-0.5' : 'text-green-600 mt-0.5'}>
                      <Check />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={p.href}
                className={`block text-center font-semibold py-2.5 rounded-xl transition text-sm ${
                  p.highlight
                    ? 'bg-white text-green-700 hover:bg-green-50'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          All paid plans include a 7-day free trial. No credit card required to start.
          Subscriptions renew monthly and can be cancelled anytime from your dashboard.
          See our <Link href="/refund" className="underline hover:text-green-600">Refund Policy</Link> for details.
        </p>
      </div>
    </section>
  )
}

// ─── Integrations ─────────────────────────────────────────────────────────────

function Integrations() {
  const items = [
    { name: 'WhatsApp Business',  icon: '💬', desc: 'Meta Cloud API — official, free tier' },
    { name: 'OpenAI GPT-4o',      icon: '🤖', desc: 'Intelligent query resolution' },
    { name: 'Razorpay',           icon: '💳', desc: 'Subscription billing (INR)' },
    { name: 'UPI / BHIM',         icon: '📲', desc: 'Advance payment collection' },
    { name: 'PostgreSQL',         icon: '🗄️',  desc: 'Reliable data storage' },
    { name: 'Redis',              icon: '⚡',  desc: 'Real-time session handling' },
  ]
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">INTEGRATIONS</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Powered by best-in-class technology</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map(i => (
            <div key={i.name} className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center hover:border-green-200 hover:shadow-sm transition">
              <div className="text-3xl mb-2">{i.icon}</div>
              <div className="text-xs font-bold text-gray-800 mb-1">{i.name}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{i.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What exactly does WhatsMenu do?',
    a: 'WhatsMenu is a SaaS platform that connects an AI chatbot to your restaurant\'s WhatsApp Business number. It automatically handles customer messages — answering menu questions, taking food orders, booking tables, and collecting UPI advance payments — 24/7 without requiring any staff involvement.',
  },
  {
    q: 'What does the subscription include?',
    a: 'Every paid subscription includes unlimited WhatsApp message handling, order & reservation management, a full admin dashboard, analytics, conversation inbox, and AI-powered replies up to the monthly limit of your plan (50 Starter / 150 Growth / 500 Pro). All features are available immediately after payment confirmation.',
  },
  {
    q: 'How does billing work?',
    a: 'Subscriptions are billed monthly in Indian Rupees (INR) via Razorpay. Your card or UPI is charged on the same date each month. You can view your billing status, next renewal date, and usage inside the dashboard under Billing.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel your subscription at any time from the Billing page. Cancellation takes effect at the end of your current billing cycle — you retain access until then and will not be charged again.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'We offer a 7-day refund window from the date of your first paid subscription. After 7 days, subscriptions are non-refundable for the current billing period. See our full Refund Policy for details.',
  },
  {
    q: 'Do I need to download or install anything?',
    a: 'No. WhatsMenu is a fully cloud-hosted SaaS product. Your restaurant staff use the web dashboard at any browser. Customers interact entirely through their existing WhatsApp app — no downloads needed on either side.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. All data is stored in encrypted PostgreSQL databases. We never sell customer data to third parties. Our platform complies with applicable Indian data protection laws. See our Privacy Policy for full details.',
  },
  {
    q: 'What WhatsApp account do I need?',
    a: 'You need a WhatsApp Business account connected to the Meta Cloud API (free tier). During setup, we guide you step-by-step to link your existing business number — it takes about 10 minutes.',
  },
]

function FAQ() {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">FAQ</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Frequently asked questions</h2>
          <p className="text-gray-500">Everything you need to know before getting started.</p>
        </div>
        <div className="space-y-4">
          {FAQS.map(f => (
            <div key={f.q} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} className="w-3.5 h-3.5">
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" /><circle cx="12" cy="17" r="0.5" fill="#16a34a" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1.5">{f.q}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{f.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="py-16 bg-green-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <WAIcon className="w-10 h-10 mx-auto mb-4 text-green-200" />
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Ready to automate your restaurant?</h2>
        <p className="text-green-200 mb-8 max-w-xl mx-auto">
          Join 500+ restaurants already using WhatsMenu to handle orders, reservations, and customer queries on autopilot.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup"
            className="bg-white text-green-700 font-bold px-7 py-3 rounded-xl hover:bg-green-50 transition shadow-md text-sm">
            Start Free — No Credit Card
          </Link>
          <a href="mailto:support@whatsmenu.in"
            className="border border-green-400 text-white font-semibold px-7 py-3 rounded-xl hover:bg-green-700 transition text-sm">
            Book a Demo
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function Contact() {
  return (
    <section id="contact" className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">CONTACT US</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Get in touch</h2>
          <p className="text-gray-500 text-sm">We typically respond within one business day.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              icon: '📧',
              label: 'Email Support',
              value: 'support@whatsmenu.in',
              href: 'mailto:support@whatsmenu.in',
            },
            {
              icon: '📞',
              label: 'Phone / WhatsApp',
              value: '+91 98765 43210',
              href: 'tel:+919876543210',
            },
            {
              icon: '📍',
              label: 'Address',
              value: 'Mumbai, Maharashtra, India',
              href: undefined,
            },
          ].map(c => (
            <div key={c.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{c.label}</div>
              {c.href ? (
                <a href={c.href} className="text-sm font-semibold text-green-700 hover:underline">{c.value}</a>
              ) : (
                <div className="text-sm font-semibold text-gray-700">{c.value}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <WAIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-extrabold text-lg">WhatsMenu</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              AI-powered WhatsApp automation for restaurants. Handle orders, reservations &amp; customer support 24/7.
            </p>
            <div className="mt-4 text-xs text-gray-500">
              <div>WhatsMenu Technologies</div>
              <div>Mumbai, Maharashtra, India</div>
              <div className="mt-1">
                <a href="mailto:support@whatsmenu.in" className="hover:text-green-400 transition">support@whatsmenu.in</a>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-white font-semibold text-sm mb-4">Product</div>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Features',    href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Pricing',     href: '#pricing' },
                { label: 'Integrations', href: '#' },
                { label: 'Changelog',   href: '#' },
              ].map(l => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-green-400 transition">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-white font-semibold text-sm mb-4">Company</div>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'About',   href: '#' },
                { label: 'Blog',    href: '#' },
                { label: 'Careers', href: '#' },
                { label: 'Contact', href: '#contact' },
              ].map(l => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-green-400 transition">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-white font-semibold text-sm mb-4">Legal</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms"   className="hover:text-green-400 transition">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-green-400 transition">Privacy Policy</Link></li>
              <li><Link href="/refund"  className="hover:text-green-400 transition">Refund &amp; Cancellation Policy</Link></li>
            </ul>
            <div className="mt-6">
              <div className="text-white font-semibold text-sm mb-2">Account</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login"  className="hover:text-green-400 transition">Log In</Link></li>
                <li><Link href="/signup" className="hover:text-green-400 transition">Sign Up</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} WhatsMenu Technologies. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms"   className="hover:text-green-400 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-green-400 transition">Privacy</Link>
            <Link href="/refund"  className="hover:text-green-400 transition">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <Integrations />
      <FAQ />
      <CTABanner />
      <Contact />
      <Footer />
    </div>
  )
}
