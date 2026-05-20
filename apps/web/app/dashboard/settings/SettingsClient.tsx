'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

type Restaurant = {
  name: string
  address: string | null
  locationLink: string | null
  businessHours: any
  botActive: boolean
  humanHandoff: boolean
  whatsappNumber: string
  waPhoneNumberId: string
}

export default function SettingsClient({ restaurant, restaurantId }: { restaurant: Restaurant; restaurantId: string }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: restaurant.name,
    address: restaurant.address ?? '',
    locationLink: restaurant.locationLink ?? '',
    whatsappNumber: restaurant.whatsappNumber,
    botActive: restaurant.botActive,
    humanHandoff: restaurant.humanHandoff,
  })
  const [hours, setHours] = useState<Record<string, string>>(
    (restaurant.businessHours as Record<string, string>) ?? {}
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, businessHours: hours, restaurantId }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Business Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="123 Main St, Mumbai"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
          <input value={form.locationLink} onChange={e => setForm({ ...form, locationLink: e.target.value })}
            placeholder="https://maps.google.com/..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Owner WhatsApp Number</label>
          <input value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })}
            placeholder="919876543210"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <p className="text-xs text-gray-400 mt-1">Reservation alerts are sent here. Format: country code + number (no +)</p>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Business Hours</h2>
        <div className="space-y-2">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-24 text-sm text-gray-600">{DAY_LABELS[day]}</span>
              <input
                value={hours[day] ?? ''}
                onChange={e => setHours({ ...hours, [day]: e.target.value })}
                placeholder="9am–10pm or Closed"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bot Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Bot Controls</h2>
        <label className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Bot Active</div>
            <div className="text-xs text-gray-400">Turn off to stop all automated replies</div>
          </div>
          <button type="button" onClick={() => setForm({ ...form, botActive: !form.botActive })}
            className={`relative w-11 h-6 rounded-full transition ${form.botActive ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.botActive ? 'translate-x-5' : ''}`} />
          </button>
        </label>
        <label className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Human Handoff</div>
            <div className="text-xs text-gray-400">Bot goes silent, you reply manually from your phone</div>
          </div>
          <button type="button" onClick={() => setForm({ ...form, humanHandoff: !form.humanHandoff })}
            className={`relative w-11 h-6 rounded-full transition ${form.humanHandoff ? 'bg-orange-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.humanHandoff ? 'translate-x-5' : ''}`} />
          </button>
        </label>
      </div>

      {/* WhatsApp Info (read-only) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">WhatsApp Info</h2>
        <div className="text-sm text-gray-500">
          Phone Number ID: <span className="font-mono text-gray-700">{restaurant.waPhoneNumberId}</span>
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition">
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </form>
  )
}
