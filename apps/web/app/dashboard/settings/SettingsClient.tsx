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
  waAccessToken: string
  utrEnabled: boolean
  utrUpiId: string | null
  utrAdvancePaise: number
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
    utrEnabled: restaurant.utrEnabled,
    utrUpiId: restaurant.utrUpiId ?? '',
    utrAdvancePaise: restaurant.utrAdvancePaise,
  })
  const [hours, setHours] = useState<Record<string, string>>(
    (restaurant.businessHours as Record<string, string>) ?? {}
  )
  // waAccessToken — blank means "don't change", populated means "update to this"
  const [newToken, setNewToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [handoffLoading, setHandoffLoading] = useState(false)
  const [handoffMsg, setHandoffMsg] = useState<string | null>(null)

  async function toggleHandoff() {
    const next = !form.humanHandoff
    setHandoffLoading(true)
    setHandoffMsg(null)
    const res = await fetch('/api/settings/handoff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: next }),
    })
    setHandoffLoading(false)
    if (res.ok) {
      const data = await res.json()
      setForm(f => ({ ...f, humanHandoff: next }))
      const label = next ? 'Handoff ON' : 'Bot resumed'
      const notif = data.notified > 0 ? ` — ${data.notified} customer${data.notified > 1 ? 's' : ''} notified` : ''
      setHandoffMsg(`${label}${notif}`)
      setTimeout(() => setHandoffMsg(null), 4000)
      router.refresh()
    } else {
      setHandoffMsg('Failed to update — try again')
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, address: form.address, locationLink: form.locationLink,
        whatsappNumber: form.whatsappNumber, botActive: form.botActive,
        businessHours: hours, restaurantId,
        utrEnabled: form.utrEnabled,
        utrUpiId: form.utrUpiId || null,
        utrAdvancePaise: form.utrAdvancePaise,
        // Only sent when the owner has typed a new token — blank = keep existing
        ...(newToken.trim() ? { waAccessToken: newToken.trim() } : {}),
      }),
    })
    setSaving(false)
    setSaved(true)
    setNewToken('')   // clear the token field — it's been saved
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
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Human Handoff</div>
            <div className="text-xs text-gray-400">Bot goes silent, you reply manually from your phone</div>
            {handoffMsg && (
              <div className={`text-xs mt-1 font-medium ${handoffMsg.startsWith('Failed') ? 'text-red-500' : form.humanHandoff ? 'text-orange-600' : 'text-green-600'}`}>
                {handoffMsg}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={handoffLoading}
            onClick={toggleHandoff}
            className={`relative w-11 h-6 rounded-full transition disabled:opacity-50 ${form.humanHandoff ? 'bg-orange-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.humanHandoff ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reservation Payments (UTR) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Reservation Advance Payment</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            When enabled, customers must pay an advance via UPI and share their UTR/Transaction ID before the reservation is confirmed.
          </p>
        </div>

        {/* Toggle */}
        <label className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Require advance payment</div>
            <div className="text-xs text-gray-400">Customers pay UPI advance and submit UTR</div>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, utrEnabled: !f.utrEnabled }))}
            className={`relative w-11 h-6 rounded-full transition ${form.utrEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.utrEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </label>

        {/* UPI details — only shown when toggle is ON */}
        {form.utrEnabled && (
          <div className="space-y-3 pt-1 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your UPI ID <span className="text-red-500">*</span>
              </label>
              <input
                value={form.utrUpiId}
                onChange={e => setForm(f => ({ ...f, utrUpiId: e.target.value }))}
                placeholder="yourname@okaxis"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Must be a full UPI VPA — e.g. <span className="font-mono">9876543210@ybl</span> (PhonePe),{' '}
                <span className="font-mono">name@okicici</span>, <span className="font-mono">name@axl</span>.{' '}
                A phone number alone won't work — open any UPI app → Profile → copy your UPI ID.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.utrAdvancePaise / 100}
                onChange={e => setForm(f => ({ ...f, utrAdvancePaise: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                placeholder="400"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Amount customers pay to secure their table</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <strong>How it works:</strong> After customers confirm a reservation, the bot sends your UPI ID and asks them to pay ₹{form.utrAdvancePaise / 100 || '—'}. They reply with their UTR number. You then verify in the <strong>Reservations</strong> dashboard and click <em>Verify &amp; Confirm</em>.
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Credentials */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">WhatsApp Credentials</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Update your access token whenever Meta rotates it (every 24 h for temporary tokens).
            Leave blank to keep the current token.
          </p>
        </div>

        {/* Phone Number ID — read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
          <input
            readOnly
            value={restaurant.waPhoneNumberId}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-mono"
          />
        </div>

        {/* Current token preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Access Token</label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              type={showToken ? 'text' : 'password'}
              value={restaurant.waAccessToken}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken(v => !v)}
              className="text-xs px-2.5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition shrink-0"
            >
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* New token input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Access Token <span className="text-gray-400 font-normal">(paste new token here to update)</span>
          </label>
          <input
            value={newToken}
            onChange={e => setNewToken(e.target.value)}
            placeholder="Paste new token from Meta Developer Console…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
          />
          {newToken.trim() && (
            <p className="text-xs text-green-600 mt-1">✓ New token will be saved when you click "Save Changes"</p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
          <strong>Where to get your token:</strong> Meta Developer Console →
          your app → WhatsApp → API Setup → copy the <em>Temporary access token</em> (24 h) or generate
          a <em>System User token</em> (permanent) under Business Settings → System Users.
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition">
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </form>
  )
}
