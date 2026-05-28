import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import ReservationsClient from './ReservationsClient'

export default async function ReservationsPage() {
  const session = await auth()
  const restaurantId = session!.user.id

  const reservations = await prisma.reservation.findMany({
    where: { restaurantId },
    select: {
      id: true,
      date: true,
      timeSlot: true,
      guests: true,
      status: true,
      utrNumber: true,
      utrVerified: true,
      createdAt: true,
      customer: { select: { whatsappNumber: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
        <span className="text-sm text-gray-500">Confirming or cancelling sends a WhatsApp notification to the customer.</span>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No reservations yet.
        </div>
      ) : (
        <ReservationsClient initial={reservations} />
      )}
    </div>
  )
}
