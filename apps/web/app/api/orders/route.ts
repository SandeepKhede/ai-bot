import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { sendTextMessage } from '@wabot/whatsapp'

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'CANCELLED']

const STATUS_MESSAGES: Record<string, string> = {
  CONFIRMED:  `✅ *Order Confirmed!*\n\nYour order has been accepted. We're getting started on it right away!`,
  PREPARING:  `👨‍🍳 *Your order is being prepared!*\n\nWon't be long now. We'll let you know when it's ready.`,
  READY:      `🎉 *Your order is ready!*\n\nPlease come collect your order. See you soon!`,
  CANCELLED:  `❌ *Your order has been cancelled.*\n\nWe're sorry for the inconvenience. Please contact us if you have any questions.`,
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      restaurant: true,
      items: true,
    },
  })

  if (!order || order.restaurantId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.order.update({ where: { id }, data: { status } })

  // Notify customer on WhatsApp
  const msgTemplate = STATUS_MESSAGES[status]
  if (msgTemplate) {
    const itemsSummary = order.items.map(i => `• ${i.name} ×${i.quantity}`).join('\n')
    await sendTextMessage({
      to: order.customer.whatsappNumber,
      body: `${msgTemplate}\n\n${itemsSummary}\nTotal: Rs.${order.totalPaise / 100}`,
      phoneNumberId: order.restaurant.waPhoneNumberId,
      accessToken: order.restaurant.waAccessToken,
    }).catch(() => {})
  }

  return NextResponse.json(updated)
}
