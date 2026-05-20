'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Faq = { id: string; question: string; answer: string; keywords: string[]; priority: number }

const EMPTY = { question: '', answer: '', keywords: '' }

export default function FaqsClient({ faqs, restaurantId }: { faqs: Faq[]; restaurantId: string }) {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function addFaq(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        keywords: form.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean),
        restaurantId,
      }),
    })
    setForm(EMPTY)
    setShowForm(false)
    setSaving(false)
    router.refresh()
  }

  async function deleteFaq(id: string) {
    if (!confirm('Delete this FAQ?')) return
    await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
      >
        + Add FAQ
      </button>

      {showForm && (
        <form onSubmit={addFaq} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <input placeholder="Question (display only)" required value={form.question}
            onChange={e => setForm({ ...form, question: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <textarea placeholder="Answer sent to customer *" required rows={3} value={form.answer}
            onChange={e => setForm({ ...form, answer: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          <input placeholder="Keywords (comma-separated) e.g. parking, park, car" required value={form.keywords}
            onChange={e => setForm({ ...form, keywords: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              {saving ? 'Saving…' : 'Save FAQ'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          </div>
        </form>
      )}

      {faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No FAQs yet. Add your first one above.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {faqs.map(faq => (
            <div key={faq.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{faq.question || '(no question label)'}</div>
                  <div className="text-sm text-gray-600 mt-1">{faq.answer}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {faq.keywords.map(k => (
                      <span key={k} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{k}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => deleteFaq(faq.id)}
                  className="text-xs text-red-400 hover:text-red-600 shrink-0 transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
