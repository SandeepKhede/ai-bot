import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { sendTextMessage } from '@wabot/whatsapp'

const STATUS_MESSAGES: Record<string, string> = {
  CONFIRMED: `✅ *Your reservation is confirmed!*\n\nWe're looking forward to seeing you. If you need any changes, just message us. 🙏`,
  CANCELLED: `❌ *Your reservation has been cancelled.*\n\nSorry we couldn't accommodate you this time. Feel free to book again anytime!`,
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  if (!['CONFIRMED', 'CANCELLED', 'PENDING'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { customer: true, restaurant: true },
  })
  if (!reservation || reservation.restaurantId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.reservation.update({ where: { id }, data: { status } })

  // Notify customer on WhatsApp when confirmed or cancelled
  const msgTemplate = STATUS_MESSAGES[status]
  if (msgTemplate) {
    await sendTextMessage({
      to: reservation.customer.whatsappNumber,
      body: `${msgTemplate}\n\n📅 ${reservation.date} at ${reservation.timeSlot}\n👥 ${reservation.guests} guests`,
      phoneNumberId: reservation.restaurant.waPhoneNumberId,
      accessToken: reservation.restaurant.waAccessToken,
    }).catch(() => {})
  }

  return NextResponse.json(updated)
}
