'use client'

import { useState } from 'react'

type OrderItem = { id: string; name: string; pricePaise: number; quantity: number }

type Order = {
  id: string
  status: string
  totalPaise: number
  createdAt: Date
  customer: { whatsappNumber: string; name: string | null }
  items: OrderItem[]
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PREPARING: 'bg-orange-100 text-orange-700 border-orange-200',
  READY:     'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

// What actions are available per status
const NEXT_ACTIONS: Record<string, { status: string; label: string; color: string }[]> = {
  PENDING:   [
    { status: 'CONFIRMED', label: 'Accept',  color: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { status: 'CANCELLED', label: 'Reject',  color: 'bg-red-500 hover:bg-red-600 text-white' },
  ],
  CONFIRMED: [
    { status: 'PREPARING', label: 'Preparing', color: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { status: 'CANCELLED', label: 'Cancel',    color: 'border border-red-300 text-red-600 hover:bg-red-50' },
  ],
  PREPARING: [
    { status: 'READY',     label: 'Mark Ready', color: 'bg-green-600 hover:bg-green-700 text-white' },
    { status: 'CANCELLED', label: 'Cancel',     color: 'border border-red-300 text-red-600 hover:bg-red-50' },
  ],
  READY:     [],
  CANCELLED: [],
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(date).toLocaleDateString('en-IN')
}

export default function OrdersClient({ initial }: { initial: Order[] }) {
  const [orders, setOrders] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setLoading(id + status)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      }
    } finally {
      setLoading(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-4xl mb-3">🛒</div>
        <p className="text-gray-500 text-sm">No orders yet. Orders placed via WhatsApp will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map(order => {
        const actions = NEXT_ACTIONS[order.status] ?? []
        const isExpanded = expanded === order.id

        return (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Order header row */}
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Order ID + time */}
              <div className="w-28 shrink-0">
                <div className="font-mono font-bold text-gray-900 text-sm">
                  #{order.id.slice(-6).toUpperCase()}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{timeAgo(order.createdAt)}</div>
              </div>

              {/* Customer */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {order.customer.name ?? `+${order.customer.whatsappNumber}`}
                </div>
                <button
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="text-xs text-blue-600 hover:underline mt-0.5"
                >
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} — Rs.{order.totalPaise / 100}
                  <span className="ml-1">{isExpanded ? '▲' : '▼'}</span>
                </button>
              </div>

              {/* Status badge */}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_COLOR[order.status]}`}>
                {order.status}
              </span>

              {/* Action buttons */}
              <div className="flex gap-2 shrink-0">
                {actions.map(action => (
                  <button
                    key={action.status}
                    onClick={() => updateStatus(order.id, action.status)}
                    disabled={!!loading}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50 ${action.color}`}
                  >
                    {loading === order.id + action.status ? '...' : action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable items breakdown */}
            {isExpanded && (
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-1.5 text-gray-800">{item.name}</td>
                        <td className="py-1.5 text-gray-500 text-center">×{item.quantity}</td>
                        <td className="py-1.5 text-gray-800 text-right font-medium">
                          Rs.{(item.pricePaise * item.quantity) / 100}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={2} className="pt-2 text-gray-600 font-medium text-sm">Total</td>
                      <td className="pt-2 text-right font-bold text-gray-900">Rs.{order.totalPaise / 100}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
