'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

const DEFAULT_FAQS = [
  {
    question: 'Do you take reservations?',
    answer: "Yes! We accept table reservations. Just say *book a table* and I'll help you set one up. 😊",
    keywords: 'book, reserve, reservation, table, booking, seat',
  },
  {
    question: 'Do you have vegetarian options?',
    answer: 'Yes, we have a great vegetarian menu! Feel free to ask about specific dishes.',
    keywords: 'veg, vegetarian, vegan, no meat, plant',
  },
  {
    question: 'Is parking available?',
    answer: '',
    keywords: 'parking, park, car, vehicle, bike',
  },
]

const STEPS = ['Business Details', 'Menu', 'FAQs', 'Go Live']

type AddedItem = { id: string; category: string; name: string; pricePaise: number }

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

interface Props {
  restaurantId: string
  restaurantName: string
  waPhoneNumberId: string
}

export default function SetupWizard({ restaurantId, restaurantName, waPhoneNumberId }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1 — business details
  const [details, setDetails] = useState({
    name: restaurantName,
    address: '',
    locationLink: '',
    whatsappNumber: '',
  })
  const [hours, setHours] = useState<Record<string, string>>({})

  // Step 2 — menu
  const [menuItems, setMenuItems] = useState<AddedItem[]>([])
  const [mForm, setMForm] = useState({ category: '', name: '', price: '', description: '' })
  const [mLoading, setMLoading] = useState(false)

  // Step 3 — FAQs
  const [faqs, setFaqs] = useState(DEFAULT_FAQS.map(f => ({ ...f, enabled: true })))
  const [fForm, setFForm] = useState({ question: '', answer: '', keywords: '' })
  const [fLoading, setFLoading] = useState(false)
  const [customFaqs, setCustomFaqs] = useState<string[]>([])

  // ── Step actions ──────────────────────────────────────────

  async function saveBusinessDetails() {
    setLoading(true)
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: details.name,
        address: details.address,
        locationLink: details.locationLink,
        whatsappNumber: details.whatsappNumber,
        botActive: false,
        businessHours: hours,
        restaurantId,
      }),
    })
    setLoading(false)
    return res.ok
  }

  async function addMenuItem() {
    if (!mForm.category.trim() || !mForm.name.trim() || !mForm.price) return
    setMLoading(true)
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId,
        category: mForm.category.trim(),
        name: mForm.name.trim(),
        price: mForm.price,
        description: mForm.description.trim(),
        available: true,
      }),
    })
    setMLoading(false)
    if (res.ok) {
      const item = await res.json()
      setMenuItems(prev => [...prev, item])
      setMForm({ category: mForm.category, name: '', price: '', description: '' })
    }
  }

  async function saveDefaultFaqs() {
    setLoading(true)
    const toSave = faqs.filter(f => f.enabled && f.answer.trim())
    for (const faq of toSave) {
      await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          question: faq.question,
          answer: faq.answer,
          keywords: faq.keywords.split(',').map(k => k.trim()).filter(Boolean),
        }),
      })
    }
    setLoading(false)
  }

  async function addCustomFaq() {
    if (!fForm.question.trim() || !fForm.answer.trim()) return
    setFLoading(true)
    const res = await fetch('/api/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId,
        question: fForm.question.trim(),
        answer: fForm.answer.trim(),
        keywords: fForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
      }),
    })
    setFLoading(false)
    if (res.ok) {
      setCustomFaqs(prev => [...prev, fForm.question.trim()])
      setFForm({ question: '', answer: '', keywords: '' })
    }
  }

  async function goLive() {
    setLoading(true)
    await fetch('/api/setup/complete', { method: 'POST' })
    setLoading(false)
    router.push('/dashboard')
  }

  async function next() {
    setError('')
    if (step === 1) {
      if (!details.name.trim() || !details.address.trim()) {
        setError('Restaurant name and address are required')
        return
      }
      const ok = await saveBusinessDetails()
      if (!ok) { setError('Failed to save. Please try again.'); return }
      setStep(2)
    } else if (step === 2) {
      if (menuItems.length === 0) {
        setError('Add at least one menu item to continue')
        return
      }
      setStep(3)
    } else if (step === 3) {
      await saveDefaultFaqs()
      setStep(4)
    }
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">

      {/* Progress bar */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => {
          const n = i + 1
          const done = step > n
          const active = step === n
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${active ? 'text-green-700' : done ? 'text-green-500' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${active ? 'bg-green-600 text-white' : done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? '✓' : n}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${step > n ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">

        {/* ── Step 1: Business Details ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
              <p className="text-sm text-gray-500">This info is shown to customers when they ask about your restaurant.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
              <input value={details.name} onChange={e => setDetails({ ...details, name: e.target.value })}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
              <input value={details.address} onChange={e => setDetails({ ...details, address: e.target.value })}
                placeholder="14, MG Road, Indiranagar, Bangalore" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps Link <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input value={details.locationLink} onChange={e => setDetails({ ...details, locationLink: e.target.value })}
                placeholder="https://maps.google.com/..." className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your WhatsApp Number <span className="text-gray-400 font-normal">(for reservation alerts)</span>
              </label>
              <input value={details.whatsappNumber} onChange={e => setDetails({ ...details, whatsappNumber: e.target.value })}
                placeholder="919876543210" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">Country code + number, no + or spaces</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Business Hours</label>
              <div className="space-y-2">
                {DAYS.map(day => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-600 shrink-0">{DAY_LABELS[day]}</span>
                    <input value={hours[day] ?? ''} onChange={e => setHours({ ...hours, [day]: e.target.value })}
                      placeholder="11am – 11pm or Closed"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Menu ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Menu Items</h2>
              <p className="text-sm text-gray-500">Add at least one item. You can manage your full menu from the dashboard later.</p>
            </div>

            {menuItems.length > 0 && (
              <div className="border border-gray-200 rounded-xl divide-y">
                {menuItems.map(item => (
                  <div key={item.id} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">₹{item.pricePaise / 100}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Add Item</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Category</label>
                  <input value={mForm.category} onChange={e => setMForm({ ...mForm, category: e.target.value })}
                    placeholder="Starters" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Item Name</label>
                  <input value={mForm.name} onChange={e => setMForm({ ...mForm, name: e.target.value })}
                    placeholder="Paneer Tikka" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Price (₹)</label>
                  <input type="number" min="0" value={mForm.price} onChange={e => setMForm({ ...mForm, price: e.target.value })}
                    placeholder="299" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description <span className="text-gray-400">(optional)</span></label>
                  <input value={mForm.description} onChange={e => setMForm({ ...mForm, description: e.target.value })}
                    placeholder="Char-grilled cottage cheese..." className={inputCls} />
                </div>
              </div>
              <button type="button" onClick={addMenuItem}
                disabled={mLoading || !mForm.category.trim() || !mForm.name.trim() || !mForm.price}
                className="text-sm font-medium text-green-700 hover:text-green-800 disabled:opacity-40">
                {mLoading ? 'Adding…' : '+ Add Item'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: FAQs ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Answer FAQs</h2>
              <p className="text-sm text-gray-500">
                The bot answers these instantly without AI cost. Fill in answers for the ones that apply, skip the rest.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className={`border rounded-xl p-4 space-y-2 transition ${faq.enabled ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{faq.question}</p>
                    <button type="button"
                      onClick={() => setFaqs(prev => prev.map((f, j) => j === i ? { ...f, enabled: !f.enabled } : f))}
                      className="text-xs text-gray-400 hover:text-gray-600 ml-4 shrink-0">
                      {faq.enabled ? 'Skip' : 'Include'}
                    </button>
                  </div>
                  {faq.enabled && (
                    <textarea value={faq.answer}
                      onChange={e => setFaqs(prev => prev.map((f, j) => j === i ? { ...f, answer: e.target.value } : f))}
                      rows={2} placeholder="Type the answer customers will receive…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                  )}
                </div>
              ))}
            </div>

            {customFaqs.length > 0 && (
              <div className="space-y-1">
                {customFaqs.map(q => (
                  <div key={q} className="text-sm text-green-700 flex items-center gap-2">
                    <span>✓</span><span>{q}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Add Custom FAQ</p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Question</label>
                <input value={fForm.question} onChange={e => setFForm({ ...fForm, question: e.target.value })}
                  placeholder="Do you have outdoor seating?" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Answer</label>
                <textarea value={fForm.answer} onChange={e => setFForm({ ...fForm, answer: e.target.value })}
                  rows={2} placeholder="Yes, we have a lovely outdoor terrace open until 10pm."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Keywords <span className="text-gray-400">(comma separated)</span></label>
                <input value={fForm.keywords} onChange={e => setFForm({ ...fForm, keywords: e.target.value })}
                  placeholder="outdoor, seating, terrace, outside" className={inputCls} />
              </div>
              <button type="button" onClick={addCustomFaq}
                disabled={fLoading || !fForm.question.trim() || !fForm.answer.trim()}
                className="text-sm font-medium text-green-700 hover:text-green-800 disabled:opacity-40">
                {fLoading ? 'Saving…' : '+ Save FAQ'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Go Live ── */}
        {step === 4 && (
          <div className="text-center space-y-6">
            <div>
              <div className="text-5xl mb-3">🚀</div>
              <h2 className="text-xl font-bold text-gray-900">You're ready to go live!</h2>
              <p className="text-sm text-gray-500 mt-2">Activate the bot and customers can start messaging right away.</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-semibold text-green-800">What happens when you activate:</p>
              <ul className="text-sm text-green-700 space-y-1.5">
                <li>✓ Bot starts replying to WhatsApp messages instantly</li>
                <li>✓ Menu, hours and location questions answered from your data</li>
                <li>✓ Customers can book tables through a multi-turn conversation</li>
                <li>✓ Unknown questions handled by GPT-4o-mini with your context</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Make sure this is set in Meta Dashboard</p>
              <p className="text-xs text-gray-500 mb-2">WhatsApp → Configuration → Webhook → Callback URL</p>
              <p className="text-sm font-mono text-gray-800 break-all bg-white border border-gray-200 rounded px-3 py-2">
                https://&lt;your-tunnel-url&gt;/webhook
              </p>
              <p className="text-xs text-gray-400 mt-2">Replace with your actual Dev Tunnel or ngrok URL. Subscribe to the <strong>messages</strong> field.</p>
            </div>

            <button onClick={goLive} disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition">
              {loading ? 'Activating…' : 'Activate Bot & Go to Dashboard →'}
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between items-center mt-6 pt-5 border-t border-gray-100">
            {step > 1 ? (
              <button type="button" onClick={() => { setError(''); setStep(s => s - 1) }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                ← Back
              </button>
            ) : <div />}
            <button type="button" onClick={next} disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg text-sm transition">
              {loading ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
