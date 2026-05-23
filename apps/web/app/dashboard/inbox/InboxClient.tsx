'use client'

import { useState } from 'react'

type CustomerRow = {
  customerPhone: string
  lastMessage: string
  lastAt: Date
  total: number
}

type Message = {
  id: string
  direction: string
  content: string
  resolvedBy: string | null
  createdAt: Date
}

const RESOLUTION_BADGE: Record<string, string> = {
  faq:        'bg-blue-100 text-blue-700',
  structured: 'bg-indigo-100 text-indigo-700',
  ai:         'bg-purple-100 text-purple-700',
  session:    'bg-cyan-100 text-cyan-700',
  fallback:   'bg-gray-100 text-gray-500',
  human:      'bg-orange-100 text-orange-700',
}

export default function InboxClient({
  restaurantId,
  customers,
}: {
  restaurantId: string
  customers: CustomerRow[]
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  async function loadThread(phone: string) {
    setSelected(phone)
    setLoading(true)
    const res = await fetch(`/api/inbox?phone=${encodeURIComponent(phone)}`)
    const data = await res.json()
    setMessages(data)
    setLoading(false)
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">
      {/* Customer list */}
      <div className="w-72 shrink-0 bg-white rounded-xl border border-gray-200 overflow-y-auto">
        {customers.map(c => (
          <button
            key={c.customerPhone}
            onClick={() => loadThread(c.customerPhone)}
            className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
              selected === c.customerPhone ? 'bg-green-50 border-l-2 border-l-green-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">+{c.customerPhone}</span>
              <span className="text-xs text-gray-400">
                {new Date(c.lastAt).toLocaleDateString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
            <span className="text-xs text-gray-400 mt-0.5">{c.total} messages</span>
          </button>
        ))}
      </div>

      {/* Conversation thread */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation to view
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Loading...
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-gray-100 font-medium text-gray-900 text-sm">
              +{selected}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm ${
                      m.direction === 'outbound'
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <div className={`flex items-center justify-between gap-2 mt-1 ${m.direction === 'outbound' ? 'text-green-200' : 'text-gray-400'}`}>
                      <span className="text-xs">
                        {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {m.resolvedBy && m.direction === 'outbound' && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${RESOLUTION_BADGE[m.resolvedBy] ?? 'bg-gray-100 text-gray-500'}`}>
                          {m.resolvedBy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
