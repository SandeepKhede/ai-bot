import { auth } from '@/auth'
import { prisma } from '@/lib/db'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(current: number, prev: number) {
  if (prev === 0) return current > 0 ? 100 : 0
  return Math.round(((current - prev) / prev) * 100)
}

function TrendBadge({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
      up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
    }`}>
      {up ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  )
}

const ORDER_STATUS_STYLE: Record<string, string> = {
  PENDING:    'bg-yellow-50 text-yellow-700',
  CONFIRMED:  'bg-blue-50 text-blue-700',
  PREPARING:  'bg-purple-50 text-purple-700',
  READY:      'bg-green-50 text-green-700',
  CANCELLED:  'bg-red-50 text-red-600',
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, trend, icon, accent,
}: {
  label: string
  value: string | number
  sub?: string
  trend?: number
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ─── Revenue bar chart (inline SVG) ──────────────────────────────────────────

function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const W = 400, H = 120, barW = 32, gap = (W - data.length * barW) / (data.length + 1)

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full h-auto min-w-[280px]">
        {data.map((d, i) => {
          const barH = max > 0 ? Math.max((d.value / max) * H, d.value > 0 ? 4 : 0) : 0
          const x = gap + i * (barW + gap)
          const y = H - barH

          return (
            <g key={d.label}>
              {/* Background bar */}
              <rect x={x} y={0} width={barW} height={H} rx={6} fill="#f3f4f6" />
              {/* Value bar */}
              {barH > 0 && (
                <rect x={x} y={y} width={barW} height={barH} rx={6} fill="#16a34a" opacity={0.85} />
              )}
              {/* Label */}
              <text x={x + barW / 2} y={H + 18} textAnchor="middle" fontSize={10} fill="#9ca3af">
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OverviewPage() {
  const session = await auth()
  const restaurantId = session!.user!.id as string

  // Date boundaries
  const now      = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    // This month
    messagesThisMonth,
    reservationsThisMonth,
    ordersThisMonth,
    revenueRows,
    // Last month (for trend)
    messagesLastMonth,
    reservationsLastMonth,
    ordersLastMonth,
    revenueLastRows,
    // Recent orders
    recentOrders,
    // Top items
    topItemRows,
    // 7-day chart
    chartRows,
  ] = await Promise.all([
    prisma.messageLog.count({
      where: { restaurantId, direction: 'inbound', createdAt: { gte: monthStart } },
    }),
    prisma.reservation.count({
      where: { restaurantId, createdAt: { gte: monthStart } },
    }),
    prisma.order.count({
      where: { restaurantId, createdAt: { gte: monthStart } },
    }),
    prisma.order.aggregate({
      where: { restaurantId, createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } },
      _sum: { totalPaise: true },
    }),
    prisma.messageLog.count({
      where: { restaurantId, direction: 'inbound', createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    prisma.reservation.count({
      where: { restaurantId, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    prisma.order.count({
      where: { restaurantId, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    prisma.order.aggregate({
      where: { restaurantId, createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, status: { not: 'CANCELLED' } },
      _sum: { totalPaise: true },
    }),
    prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        customer: { select: { name: true, whatsappNumber: true } },
        items: { select: { name: true, quantity: true } },
      },
    }),
    // Top menu items by quantity sold
    prisma.orderItem.groupBy({
      by: ['name'],
      where: { order: { restaurantId, status: { not: 'CANCELLED' } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    // 7-day message counts
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, COUNT(*)::bigint as count
      FROM "MessageLog"
      WHERE "restaurantId" = ${restaurantId}
        AND direction = 'inbound'
        AND "createdAt" >= ${new Date(Date.now() - 6 * 86400000)}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date
    `,
  ])

  // Revenue in rupees
  const revenueThisMonth  = (revenueRows._sum.totalPaise ?? 0) / 100
  const revenueLastMonth  = (revenueLastRows._sum.totalPaise ?? 0) / 100

  // Trends
  const trends = {
    messages:     pct(messagesThisMonth,     messagesLastMonth),
    reservations: pct(reservationsThisMonth, reservationsLastMonth),
    orders:       pct(ordersThisMonth,       ordersLastMonth),
    revenue:      pct(revenueThisMonth,      revenueLastMonth),
  }

  // 7-day chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    const dateStr = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' })
    const found = chartRows.find(r => r.date === dateStr)
    return { label, value: found ? Number(found.count) : 0 }
  })

  // Icons (inline SVG, white on colored bg)
  const msgIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
  const resIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
  const revIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
  const ordIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )

  return (
    <div className="space-y-6">

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Messages" value={messagesThisMonth.toLocaleString()}
          sub="this month" trend={trends.messages}
          icon={msgIcon} accent="bg-green-500" />
        <StatCard label="Reservations" value={reservationsThisMonth.toLocaleString()}
          sub="this month" trend={trends.reservations}
          icon={resIcon} accent="bg-blue-500" />
        <StatCard label="Revenue" value={`₹${revenueThisMonth.toLocaleString('en-IN')}`}
          sub="from orders" trend={trends.revenue}
          icon={revIcon} accent="bg-purple-500" />
        <StatCard label="Orders" value={ordersThisMonth.toLocaleString()}
          sub="this month" trend={trends.orders}
          icon={ordIcon} accent="bg-orange-400" />
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Orders — takes 2/3 width */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <span className="font-semibold text-gray-900">Recent Orders</span>
            <a href="/dashboard/orders" className="text-xs text-green-600 font-medium hover:underline">
              View all →
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">No orders yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Order', 'Customer', 'Items', 'Amount', 'Status', 'Time'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(order => {
                  const customerLabel = order.customer.name ?? `+${order.customer.whatsappNumber}`
                  const itemsSummary = order.items.length === 1
                    ? order.items[0].name
                    : `${order.items[0].name} +${order.items.length - 1}`
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3 font-mono text-xs text-gray-500">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-800 max-w-[120px] truncate">
                        {customerLabel}
                      </td>
                      <td className="px-6 py-3 text-gray-500 max-w-[140px] truncate">
                        {itemsSummary}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-800">
                        ₹{(order.totalPaise / 100).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {order.createdAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column — chart + top items */}
        <div className="space-y-6">

          {/* Message activity chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-900">Messages</span>
              <span className="text-xs text-gray-400">Last 7 days</span>
            </div>
            <RevenueChart data={chartData} />
          </div>

          {/* Top menu items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Top Items</span>
              <a href="/dashboard/menu" className="text-xs text-green-600 font-medium hover:underline">
                View menu →
              </a>
            </div>
            {topItemRows.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No orders yet</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {topItemRows.map((item, idx) => (
                  <li key={item.name} className="flex items-center gap-3 px-5 py-3">
                    {/* Rank badge */}
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700'
                      : idx === 1 ? 'bg-gray-100 text-gray-500'
                      : 'bg-orange-50 text-orange-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">{item.name}</span>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      ×{item._sum.quantity ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
