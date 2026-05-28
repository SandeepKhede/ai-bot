'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const nav = [
  { href: '/dashboard',              label: 'Overview',      icon: '📊' },
  { href: '/dashboard/inbox',        label: 'Inbox',         icon: '💬' },
  { href: '/dashboard/orders',       label: 'Orders',        icon: '🛒' },
  { href: '/dashboard/reservations', label: 'Reservations',  icon: '📅' },
  { href: '/dashboard/analytics',    label: 'Analytics',     icon: '📈' },
  { href: '/dashboard/menu',         label: 'Menu',          icon: '🍽️' },
  { href: '/dashboard/faqs',         label: 'FAQs',          icon: '🗂️' },
  { href: '/dashboard/billing',      label: 'Billing',       icon: '💳' },
  { href: '/dashboard/settings',     label: 'Settings',      icon: '⚙️' },
]

export default function Sidebar({ restaurantName }: { restaurantName: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="text-lg font-bold text-gray-900 truncate">{restaurantName}</div>
        <div className="text-xs text-gray-400 mt-0.5">Admin Dashboard</div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  )
}
