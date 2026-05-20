'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type MenuItem = {
  id: string
  category: string
  name: string
  pricePaise: number
  description: string | null
  available: boolean
}

const EMPTY_FORM = { category: '', name: '', price: '', description: '', available: true }

export default function MenuClient({ items, restaurantId }: { items: MenuItem[]; restaurantId: string }) {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_FORM)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, restaurantId }),
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
    setAdding(false)
    router.refresh()
  }

  async function toggleAvailable(id: string, available: boolean) {
    await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, available: !available }),
    })
    router.refresh()
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this item?')) return
    await fetch(`/api/menu?id=${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1)
    for (const line of lines) {
      const [category, name, price, description] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      if (!category || !name || !price) continue
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, name, price, description: description ?? '', available: true, restaurantId }),
      })
    }
    e.target.value = ''
    router.refresh()
  }

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Add Item
        </button>
        <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">
          📥 Import CSV
          <input type="file" accept=".csv" className="hidden" onChange={importCsv} />
        </label>
        <span className="text-xs text-gray-400 self-center">CSV format: category, name, price, description</span>
      </div>

      {showForm && (
        <form onSubmit={addItem} className="bg-white border border-gray-200 rounded-xl p-5 grid grid-cols-2 gap-4">
          <input placeholder="Category *" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input placeholder="Item name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input placeholder="Price (₹) *" required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <div className="col-span-2 flex gap-3">
            <button type="submit" disabled={adding}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              {adding ? 'Adding…' : 'Add Item'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          </div>
        </form>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No menu items yet. Add your first item above.
        </div>
      ) : (
        Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-sm uppercase tracking-wide">
              {category}
            </div>
            <ul className="divide-y divide-gray-50">
              {catItems.map(item => (
                <li key={item.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    {item.description && <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium text-gray-700">₹{item.pricePaise / 100}</span>
                    <button onClick={() => toggleAvailable(item.id, item.available)}
                      className={`text-xs px-2 py-1 rounded-full font-medium transition ${
                        item.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </button>
                    <button onClick={() => deleteItem(item.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
