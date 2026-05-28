'use client'

import { useState } from 'react'

type Reservation = {
  id: string
  date: string
  timeSlot: string
  guests: number
  status: string
  utrNumber: string | null
  utrVerified: boolean
  createdAt: Date
  customer: { whatsappNumber: string; name: string | null }
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function ReservationsClient({ initial }: { initial: Reservation[] }) {
  const [reservations, setReservations] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(id: string, status: string, verifyUtr = false) {
    const loadKey = id + (verifyUtr ? 'verifyUtr' : status)
    setLoading(loadKey)
    try {
      const res = await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, verifyUtr }),
      })
      if (res.ok) {
        setReservations(prev =>
          prev.map(r =>
            r.id === id
              ? { ...r, status: verifyUtr ? 'CONFIRMED' : status, utrVerified: verifyUtr ? true : r.utrVerified }
              : r
          )
        )
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Date', 'Time', 'Guests', 'Customer', 'Status', 'Payment / UTR', 'Booked', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {reservations.map(r => (
            <tr key={r.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-900">{r.date}</td>
              <td className="px-4 py-3 text-gray-600">{r.timeSlot}</td>
              <td className="px-4 py-3 text-gray-600">{r.guests}</td>
              <td className="px-4 py-3 text-gray-600">
                {r.customer.name ?? `+${r.customer.whatsappNumber}`}
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status]}`}>
                  {r.status}
                </span>
              </td>

              {/* UTR / Payment column */}
              <td className="px-4 py-3">
                {r.utrNumber ? (
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs text-gray-700">{r.utrNumber}</div>
                    {r.utrVerified ? (
                      <span className="text-xs font-medium text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-xs font-medium text-amber-600">⏳ Unverified</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </td>

              <td className="px-4 py-3 text-gray-400 text-xs">
                {new Date(r.createdAt).toLocaleDateString('en-IN')}
              </td>
              <td className="px-4 py-3">
                {/* UTR submitted but not yet verified — show primary action */}
                {r.status === 'PENDING' && r.utrNumber && !r.utrVerified && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(r.id, 'CONFIRMED', true)}
                      disabled={loading === r.id + 'verifyUtr'}
                      className="text-xs px-2.5 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap"
                    >
                      {loading === r.id + 'verifyUtr' ? '...' : '✓ Verify & Confirm'}
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, 'CANCELLED')}
                      disabled={loading === r.id + 'CANCELLED'}
                      className="text-xs px-2.5 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition"
                    >
                      {loading === r.id + 'CANCELLED' ? '...' : 'Reject'}
                    </button>
                  </div>
                )}

                {/* Normal PENDING (no UTR required or waiting for payment) */}
                {r.status === 'PENDING' && !r.utrNumber && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(r.id, 'CONFIRMED')}
                      disabled={loading === r.id + 'CONFIRMED'}
                      className="text-xs px-2.5 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      {loading === r.id + 'CONFIRMED' ? '...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, 'CANCELLED')}
                      disabled={loading === r.id + 'CANCELLED'}
                      className="text-xs px-2.5 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition"
                    >
                      {loading === r.id + 'CANCELLED' ? '...' : 'Cancel'}
                    </button>
                  </div>
                )}

                {r.status === 'CONFIRMED' && (
                  <button
                    onClick={() => updateStatus(r.id, 'CANCELLED')}
                    disabled={!!loading}
                    className="text-xs px-2.5 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
