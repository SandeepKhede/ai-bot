import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export default async function OverviewPage() {
  const session = await auth()
  const restaurantId = session!.user.id

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [restaurant, totalMessages, todayMessages, pendingReservations, totalCustomers] =
    await Promise.all([
      prisma.restaurant.findUnique({ where: { id: restaurantId } }),
      prisma.messageLog.count({ where: { restaurantId } }),
      prisma.messageLog.count({ where: { restaurantId, createdAt: { gte: today }, direction: 'inbound' } }),
      prisma.reservation.count({ where: { restaurantId, status: 'PENDING' } }),
      prisma.customer.count({ where: { restaurantId } }),
    ])

  const stats = [
    { label: 'Messages Today', value: todayMessages, icon: '💬' },
    { label: 'Total Messages', value: totalMessages, icon: '📨' },
    { label: 'Pending Reservations', value: pendingReservations, icon: '📅' },
    { label: 'Total Customers', value: totalCustomers, icon: '👥' },
  ]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">{restaurant?.name}</p>
        </div>
        <BotToggle active={restaurant?.botActive ?? true} restaurantId={restaurantId} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <RecentMessages restaurantId={restaurantId} />
    </div>
  )
}

async function RecentMessages({ restaurantId }: { restaurantId: string }) {
  const messages = await prisma.messageLog.findMany({
    where: { restaurantId, direction: 'inbound' },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100 font-medium text-gray-900">Recent Messages</div>
      {messages.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-gray-400">No messages yet</div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {messages.map(m => (
            <li key={m.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-gray-400 shrink-0">+{m.customerPhone}</span>
                <span className="text-sm text-gray-700 truncate">{m.content}</span>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                {m.resolvedBy ?? 'n/a'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function BotToggle({ active, restaurantId }: { active: boolean; restaurantId: string }) {
  return (
    <form action={`/api/settings/bot-toggle`} method="POST">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <button
        type="submit"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
          active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
        Bot {active ? 'Active' : 'Paused'}
      </button>
    </form>
  )
}
