import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export default async function ReservationsPage() {
  const session = await auth()
  const restaurantId = session!.user.id

  const reservations = await prisma.reservation.findMany({
    where: { restaurantId },
    include: { customer: { select: { whatsappNumber: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reservations</h1>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No reservations yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Date', 'Time', 'Guests', 'Customer', 'Status', 'Booked At'].map(h => (
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
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
