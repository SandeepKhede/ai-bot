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

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#06100a]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <WAIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">WhatsMenu</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
            <a href="#features"     className="hover:text-emerald-400 transition">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a>
            <a href="#pricing"      className="hover:text-emerald-400 transition">Pricing</a>
            <a href="#faq"          className="hover:text-emerald-400 transition">FAQ</a>
            <a href="#contact"      className="hover:text-emerald-400 transition">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-white/55 hover:text-white px-3 py-2 rounded-lg transition">
              Log In
            </Link>
            <Link href="/signup" className="text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-500/20">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ─── Phone Mockup ─────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[248px] select-none">
      {/* Studio glow behind phone */}
      <div
        className="absolute inset-0 rounded-[3rem] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.35) 0%, transparent 70%)',
          animation: 'glow-pulse 4s ease-in-out infinite',
          transform: 'scale(1.4)',
        }}
      />

      {/* Phone frame — dark glass with emerald rim */}
      <div
        className="relative bg-[#0b1a10] border border-emerald-500/25 rounded-[2.5rem] p-[10px]"
        style={{ boxShadow: '0 0 0 1px rgba(16,185,129,0.08), 0 40px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Screen */}
        <div className="bg-white rounded-[2rem] overflow-hidden">
          {/* WA header */}
          <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow">TB</div>
            <div className="flex-1">
              <div className="text-white text-xs font-semibold leading-tight">Taste Bistro</div>
              <div className="text-emerald-300 text-[10px] leading-tight">AI Assistant • Online</div>
            </div>
            <WAIcon className="w-4 h-4 text-emerald-300" />
          </div>

          {/* Chat body */}
          <div className="bg-[#ece5dd] px-3 py-3 space-y-2.5 min-h-[340px]">
            <div className="flex">
              <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 max-w-[88%] shadow-sm">
                <p className="text-[11px] text-gray-800 leading-relaxed">👋 Welcome to <strong>Taste Bistro!</strong> I'm your AI assistant. How can I help?</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-start">
              {['📋 View Menu', '📅 Reserve a Table', '🛵 Order Food'].map(opt => (
                <div key={opt} className="bg-white border border-green-200 text-green-700 text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  {opt}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <div className="bg-[#d9fdd3] rounded-xl rounded-tr-none px-3 py-2 max-w-[75%] shadow-sm">
                <p className="text-[11px] text-gray-800">📅 Reserve a Table</p>
              </div>
            </div>
            <div className="flex">
              <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 max-w-[88%] shadow-sm">
                <p className="text-[11px] text-gray-800 leading-relaxed">Sure! What date would you like to visit?</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-[#d9fdd3] rounded-xl rounded-tr-none px-3 py-2 max-w-[75%] shadow-sm">
                <p className="text-[11px] text-gray-800">Tomorrow, 7 PM — 4 people</p>
              </div>
            </div>
            <div className="flex">
              <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 max-w-[88%] shadow-sm">
                <p className="text-[11px] text-gray-800 leading-relaxed">✅ <strong>Confirmed!</strong> See you tomorrow at 7 PM.</p>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[10px] text-gray-400">Type a message…</div>
            <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-3 -right-6 bg-emerald-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/30">
        AI-POWERED
      </div>
      <div className="absolute -bottom-4 -left-8 bg-[#0b1a10] border border-emerald-500/20 text-white/80 text-[10px] font-semibold px-3 py-2 rounded-xl shadow-xl flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
        Instant Replies 24/7
      </div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#06100a] pt-16 pb-20 lg:pt-24 lg:pb-32">
      {/* Ambient emerald glow — right side, behind phone */}
      <div
        className="absolute top-1/2 right-0 w-[800px] h-[800px] -translate-y-1/2 translate-x-1/4 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.1) 0%, transparent 65%)' }}
      />
      {/* Top-left secondary glow */}
      <div
        className="absolute -top-48 -left-48 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              AI-POWERED WHATSAPP BOT FOR RESTAURANTS
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-[66px] font-bold text-white leading-[1.04] tracking-tight mb-6">
              Your Restaurant's<br />
              <span className="text-emerald-400">AI Front Desk</span><br />
              on WhatsApp
            </h1>

            <p className="text-lg text-white/55 leading-relaxed mb-8 max-w-md">
              Automate orders, reservations &amp; customer support — 24/7, no staff required.
              Every message answered. Every table booked. Every order taken.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/signup"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3.5 rounded-xl transition text-sm shadow-lg shadow-emerald-500/25">
                Start Free Trial
                <ArrowRight />
              </Link>
              <a href="#how-it-works"
                className="inline-flex items-center gap-2 text-white/65 hover:text-white font-semibold px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/25 transition text-sm">
                See How It Works →
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 text-sm text-white/45">
              <div className="flex -space-x-2">
                {['R', 'S', 'K', 'M', 'A'].map((l, i) => (
                  <div key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#06100a] flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: ['#10b981', '#2563eb', '#dc2626', '#d97706', '#7c3aed'][i] }}>
                    {l}
                  </div>
                ))}
              </div>
              <span><strong className="text-white/80">500+</strong> restaurants on WhatsMenu</span>
            </div>
          </div>

          {/* Right — phone */}
          <div className="flex justify-center lg:justify-end">
            <div style={{ animation: 'float 6s ease-in-out infinite' }}>
              <PhoneMockup />
            </div>
          </div>
        </div>

        {/* Feature chips */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: '🛵', label: 'Order Taking' },
            { icon: '📅', label: 'Reservations' },
            { icon: '🤖', label: 'AI Responses' },
            { icon: '📊', label: 'Analytics' },
            { icon: '💬', label: 'Inbox & Handoff' },
          ].map(f => (
            <div key={f.label}
              className="flex items-center gap-2.5 bg-[#0b1a10] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-emerald-500/20 transition">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm font-medium text-white/65">{f.label}</span>
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
    { value: '500+',  label: 'Restaurants',       accent: 'text-emerald-400' },
    { value: '50k+',  label: 'Orders Handled',    accent: 'text-amber-400'   },
    { value: '1M+',   label: 'Messages Sent',     accent: 'text-emerald-400' },
    { value: '< 2 s', label: 'Avg. Response Time', accent: 'text-amber-400'  },
  ]
  return (
    <section className="bg-[#030705] py-16 border-y border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className={`font-display text-4xl font-bold mb-2 ${s.accent}`}>{s.value}</div>
              <div className="text-white/40 text-sm">{s.label}</div>
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
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    title: 'Smart Order Taking',
    desc: 'Customers browse your menu, add items to cart, and place orders — all inside WhatsApp. No app download required.',
  },
  {
    icon: '📅',
    gradient: 'from-blue-500/20 to-blue-500/5',
    title: 'Table Reservations',
    desc: 'Automated multi-turn booking flow — date, time, party size, and optional UPI advance payment to secure tables.',
  },
  {
    icon: '🤖',
    gradient: 'from-violet-500/20 to-violet-500/5',
    title: 'AI-Powered Replies',
    desc: 'GPT-4o-mini answers menu questions, opening hours, location queries, and custom FAQs instantly, around the clock.',
  },
  {
    icon: '👤',
    gradient: 'from-amber-500/20 to-amber-500/5',
    title: 'Human Handoff',
    desc: 'One toggle silences the bot so your staff can reply directly from WhatsApp. Customers are notified automatically.',
  },
  {
    icon: '📊',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    title: 'Analytics Dashboard',
    desc: 'Track messages, orders, reservations, and revenue in one place. See 7-day trends and top-selling menu items.',
  },
  {
    icon: '💳',
    gradient: 'from-rose-500/20 to-rose-500/5',
    title: 'UPI Advance Payments',
    desc: 'Collect table-booking deposits via UPI. Bot sends your UPI QR, customer pays, you verify UTR in the dashboard.',
  },
]

function Features() {
  return (
    <section id="features" className="py-24 bg-[#06100a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left-aligned header — breaks the expected center-everything pattern */}
        <div className="max-w-xl mb-16">
          <div className="inline-block border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            FEATURES
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Everything your<br />restaurant needs
          </h2>
          <p className="text-white/50 text-lg leading-relaxed">
            One WhatsApp bot replaces a full front-desk team — without missing a single customer message.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="group bg-[#0b1a10] border border-white/[0.06] rounded-2xl p-7 hover:border-emerald-500/20 hover:bg-[#0e2016] transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl mb-5`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-white text-lg mb-3">{f.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
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
    <section id="how-it-works" className="py-24 bg-[#030705]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-block border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            HOW IT WORKS
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">Live in under 10 minutes</h2>
          <p className="text-white/50">No technical knowledge needed. Our guided wizard walks you through every step.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+3.5rem)] right-[calc(-50%+3.5rem)] h-px z-0"
                  style={{ background: 'linear-gradient(to right, rgba(16,185,129,0.3), transparent)' }} />
              )}
              <div className="relative z-10 bg-[#0b1a10] border border-white/[0.06] rounded-2xl p-8 text-center hover:border-emerald-500/20 transition">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="font-display text-2xl font-bold text-emerald-400">{s.num}</span>
                </div>
                <h3 className="font-semibold text-white text-lg mb-3">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
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
    variant: 'default' as const,
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
    variant: 'featured' as const,
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
    variant: 'gold' as const,
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
    <section id="pricing" className="py-24 bg-[#06100a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            PRICING
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-white/50 max-w-md mx-auto">Start free. Upgrade when you're ready. Cancel anytime — no lock-in contracts.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PLANS.map(p => {
            const isFeatured = p.variant === 'featured'
            const isGold = p.variant === 'gold'
            return (
              <div
                key={p.name}
                className={`relative rounded-2xl p-8 ${
                  isFeatured
                    ? 'bg-emerald-500 shadow-2xl shadow-emerald-500/20 -mt-3 -mb-3'
                    : isGold
                    ? 'bg-[#0b1a10] border border-amber-400/15'
                    : 'bg-[#0b1a10] border border-white/[0.06]'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                {isGold && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0b1a10] border border-amber-400/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                    PRO
                  </div>
                )}

                <div className={`text-sm font-semibold mb-1 ${isFeatured ? 'text-emerald-100' : 'text-white/45'}`}>{p.name}</div>
                <div className={`font-display text-4xl font-bold mb-1 ${isFeatured ? 'text-white' : isGold ? 'text-amber-400' : 'text-white'}`}>
                  {p.price}
                </div>
                <div className={`text-sm mb-7 ${isFeatured ? 'text-emerald-100' : 'text-white/35'}`}>{p.sub}</div>

                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${isFeatured ? 'text-emerald-50' : 'text-white/55'}`}>
                      <span className={`mt-0.5 ${isFeatured ? 'text-emerald-100' : isGold ? 'text-amber-400' : 'text-emerald-400'}`}>
                        <Check />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={p.href}
                  className={`block text-center font-bold py-3 rounded-xl transition text-sm ${
                    isFeatured
                      ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                      : isGold
                      ? 'bg-amber-400 text-black hover:bg-amber-300'
                      : 'bg-emerald-500 text-black hover:bg-emerald-400'
                  }`}>
                  {p.cta}
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-white/25 mt-10">
          All paid plans include a 7-day free trial. No credit card required to start.
          Subscriptions renew monthly and can be cancelled anytime.{' '}
          <Link href="/refund" className="underline hover:text-emerald-400 transition">Refund Policy</Link>
        </p>
      </div>
    </section>
  )
}

// ─── Integrations ─────────────────────────────────────────────────────────────

function Integrations() {
  const items = [
    { name: 'WhatsApp Business', icon: '💬', desc: 'Meta Cloud API' },
    { name: 'OpenAI GPT-4o',     icon: '🤖', desc: 'Intelligent AI' },
    { name: 'Razorpay',          icon: '💳', desc: 'Subscription billing' },
    { name: 'UPI / BHIM',        icon: '📲', desc: 'Advance payments' },
    { name: 'PostgreSQL',        icon: '🗄️',  desc: 'Reliable storage' },
    { name: 'Redis',             icon: '⚡',  desc: 'Real-time sessions' },
  ]
  return (
    <section className="py-20 bg-[#030705] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            INTEGRATIONS
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Powered by best-in-class technology</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map(i => (
            <div key={i.name} className="bg-[#0b1a10] border border-white/[0.06] rounded-xl p-5 text-center hover:border-emerald-500/20 transition group">
              <div className="text-3xl mb-3">{i.icon}</div>
              <div className="text-xs font-semibold text-white/70 mb-1 group-hover:text-white transition">{i.name}</div>
              <div className="text-[10px] text-white/30 leading-tight">{i.desc}</div>
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
    a: "WhatsMenu is a SaaS platform that connects an AI chatbot to your restaurant's WhatsApp Business number. It automatically handles customer messages — answering menu questions, taking food orders, booking tables, and collecting UPI advance payments — 24/7 without requiring any staff involvement.",
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
    <section id="faq" className="py-24 bg-[#06100a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-block border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            FAQ
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">Frequently asked questions</h2>
          <p className="text-white/45">Everything you need to know before getting started.</p>
        </div>
        <div className="space-y-3">
          {FAQS.map(f => (
            <div key={f.q} className="bg-[#0b1a10] border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/15 transition">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2.5} className="w-3.5 h-3.5">
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" />
                    <circle cx="12" cy="17" r="0.5" fill="#34d399" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white/90 mb-2">{f.q}</div>
                  <div className="text-sm text-white/45 leading-relaxed">{f.a}</div>
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
    <section className="py-24 relative overflow-hidden bg-[#030705]">
      {/* Radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 90% at 50% 50%, rgba(16,185,129,0.09) 0%, transparent 70%)' }}
      />
      {/* Grid line decoration */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center mx-auto mb-7">
          <WAIcon className="w-7 h-7 text-emerald-400" />
        </div>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-5">
          Ready to automate<br />your restaurant?
        </h2>
        <p className="text-white/45 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
          Join 500+ restaurants already using WhatsMenu to handle orders, reservations, and customer queries on autopilot.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm">
            Start Free — No Credit Card
          </Link>
          <a href="mailto:support@whatsmenu.in"
            className="border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-semibold px-8 py-4 rounded-xl transition text-sm">
            Book a Demo
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function Contact() {
  const contacts = [
    { icon: '📧', label: 'Email Support', value: 'support@whatsmenu.in', href: 'mailto:support@whatsmenu.in' },
    { icon: '📞', label: 'Phone / WhatsApp', value: '+91 98765 43210', href: 'tel:+919876543210' },
    { icon: '📍', label: 'Address', value: 'Mumbai, Maharashtra, India', href: undefined },
  ]
  return (
    <section id="contact" className="py-20 bg-[#06100a] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            CONTACT US
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">Get in touch</h2>
          <p className="text-white/40 text-sm">We typically respond within one business day.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {contacts.map(c => (
            <div key={c.label} className="bg-[#0b1a10] border border-white/[0.06] rounded-2xl p-6 text-center hover:border-emerald-500/20 transition">
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-2">{c.label}</div>
              {c.href ? (
                <a href={c.href} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition">{c.value}</a>
              ) : (
                <div className="text-sm font-semibold text-white/60">{c.value}</div>
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
    <footer className="bg-[#020604] text-white/40 pt-16 pb-8 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <WAIcon className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-white font-extrabold text-lg">WhatsMenu</span>
            </div>
            <p className="text-sm leading-relaxed text-white/35">
              AI-powered WhatsApp automation for restaurants. Handle orders, reservations &amp; customer support 24/7.
            </p>
            <div className="mt-5 text-xs text-white/25 space-y-0.5">
              <div>WhatsMenu Technologies</div>
              <div>Mumbai, Maharashtra, India</div>
              <div className="mt-1">
                <a href="mailto:support@whatsmenu.in" className="hover:text-emerald-400 transition">support@whatsmenu.in</a>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-white/70 font-semibold text-sm mb-4">Product</div>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Features',     href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Pricing',      href: '#pricing' },
                { label: 'Integrations', href: '#' },
                { label: 'Changelog',    href: '#' },
              ].map(l => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-emerald-400 transition">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-white/70 font-semibold text-sm mb-4">Company</div>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'About',   href: '#' },
                { label: 'Blog',    href: '#' },
                { label: 'Careers', href: '#' },
                { label: 'Contact', href: '#contact' },
              ].map(l => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-emerald-400 transition">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Account */}
          <div>
            <div className="text-white/70 font-semibold text-sm mb-4">Legal</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terms"   className="hover:text-emerald-400 transition">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-400 transition">Privacy Policy</Link></li>
              <li><Link href="/refund"  className="hover:text-emerald-400 transition">Refund &amp; Cancellation Policy</Link></li>
            </ul>
            <div className="mt-6">
              <div className="text-white/70 font-semibold text-sm mb-4">Account</div>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/login"  className="hover:text-emerald-400 transition">Log In</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-400 transition">Sign Up</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <span>© {new Date().getFullYear()} WhatsMenu Technologies. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link href="/terms"   className="hover:text-emerald-400 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition">Privacy</Link>
            <Link href="/refund"  className="hover:text-emerald-400 transition">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen font-body bg-[#06100a]">
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
