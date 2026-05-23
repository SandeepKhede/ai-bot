import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const RESOLUTION_LABELS: Record<string, { label: string; color: string }> = {
  faq:        { label: 'FAQ',        color: 'bg-blue-500' },
  structured: { label: 'Structured', color: 'bg-indigo-500' },
  ai:         { label: 'AI',         color: 'bg-purple-500' },
  session:    { label: 'Session',    color: 'bg-cyan-500' },
  fallback:   { label: 'Fallback',   color: 'bg-gray-400' },
  human:      { label: 'Human',      color: 'bg-orange-500' },
}

export default async function AnalyticsPage() {
  const session = await auth()
  const restaurantId = session!.user.id

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [rawDaily, resolutionGroups, totalIn, totalOut, totalCustomers, pendingRes] = await Promise.all([
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, COUNT(*)::bigint as count
      FROM "MessageLog"
      WHERE "restaurantId" = ${restaurantId}
        AND "createdAt" >= ${sevenDaysAgo}
        AND direction = 'inbound'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date
    `,
    prisma.messageLog.groupBy({
      by: ['resolvedBy'],
      where: { restaurantId, direction: 'outbound' },
      _count: { _all: true },
    }),
    prisma.messageLog.count({ where: { restaurantId, direction: 'inbound' } }),
    prisma.messageLog.count({ where: { restaurantId, direction: 'outbound' } }),
    prisma.customer.count({ where: { restaurantId } }),
    prisma.reservation.count({ where: { restaurantId, status: 'PENDING' } }),
  ])

  // Fill in the full 7-day window including empty days
  const daily: { date: string; label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const found = rawDaily.find(r => r.date === dateStr)
    daily.push({
      date: dateStr,
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      count: found ? Number(found.count) : 0,
    })
  }

  const maxCount = Math.max(...daily.map(d => d.count), 1)

  const resolution = resolutionGroups
    .map(g => ({ key: g.resolvedBy ?? 'unknown', count: g._count._all }))
    .sort((a, b) => b.count - a.count)
  const totalResolved = resolution.reduce((s, r) => s + r.count, 0)

  const stats = [
    { label: 'Total Inbound', value: totalIn, icon: '📨' },
    { label: 'Total Outbound', value: totalOut, icon: '💬' },
    { label: 'Unique Customers', value: totalCustomers, icon: '👥' },
    { label: 'Pending Reservations', value: pendingRes, icon: '📅' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 7-day message trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Messages — Last 7 Days</h2>
          <div className="flex items-end gap-2 h-40">
            {daily.map(d => (
              <div key={d.date} className="flex flex-col items-center flex-1 h-full justify-end gap-1">
                <span className="text-xs text-gray-500">{d.count > 0 ? d.count : ''}</span>
                <div
                  className="w-full rounded-t-md bg-green-500 transition-all"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '2px' }}
                />
                <span className="text-xs text-gray-400 text-center leading-tight">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">How Queries Are Resolved</h2>
          {resolution.length === 0 ? (
            <p className="text-sm text-gray-400 mt-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {resolution.map(r => {
                const meta = RESOLUTION_LABELS[r.key] ?? { label: r.key, color: 'bg-gray-300' }
                const pct = totalResolved ? Math.round((r.count / totalResolved) * 100) : 0
                return (
                  <div key={r.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{meta.label}</span>
                      <span className="text-gray-500">{r.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${meta.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
