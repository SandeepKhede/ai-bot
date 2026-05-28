'use client'

import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':              'Overview',
  '/dashboard/inbox':        'Inbox',
  '/dashboard/orders':       'Orders',
  '/dashboard/reservations': 'Reservations',
  '/dashboard/analytics':    'Analytics',
  '/dashboard/menu':         'Menu',
  '/dashboard/faqs':         'FAQs',
  '/dashboard/billing':      'Billing',
  '/dashboard/settings':     'Settings',
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

interface Props {
  restaurantName: string
  botActive: boolean
}

export default function TopHeader({ restaurantName, botActive }: Props) {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'Dashboard'
  const initial = restaurantName.charAt(0).toUpperCase()
  const today = formatDate(new Date())

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">

      {/* Left — page title */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400 leading-none mt-0.5">{today}</p>
      </div>

      {/* Right — bot status + bell + avatar */}
      <div className="flex items-center gap-3">

        {/* Bot status pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          botActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${botActive ? 'bg-green-500' : 'bg-red-500'}`} />
          Bot {botActive ? 'Active' : 'Paused'}
        </div>

        {/* Notification bell */}
        <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition relative">
          <BellIcon />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{initial}</span>
        </div>
      </div>
    </header>
  )
}
