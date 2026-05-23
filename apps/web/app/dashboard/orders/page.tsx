import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const session = await auth()
  const restaurantId = session!.user.id

  const orders = await prisma.order.findMany({
    where: { restaurantId },
    include: {
      customer: { select: { whatsappNumber: true, name: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <span className="text-sm text-gray-500">
          Status updates send WhatsApp notifications to customers.
        </span>
      </div>
      <OrdersClient initial={orders} />
    </div>
  )
}
