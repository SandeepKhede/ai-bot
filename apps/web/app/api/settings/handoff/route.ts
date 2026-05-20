import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const ON_MESSAGE = "Our team member will be with you shortly! 👋"
const OFF_MESSAGE = "Our WhatsApp assistant is back online. How can we help? 😊"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { active } = await req.json()
  if (typeof active !== 'boolean') {
    return NextResponse.json({ error: 'active must be a boolean' }, { status: 400 })
  }

  const restaurantId = session.user.id

  // Read current state before updating
  const current = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { humanHandoff: true, waPhoneNumberId: true, waAccessToken: true },
  })
  if (!current) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })

  // No-op if state unchanged
  if (current.humanHandoff === active) {
    return NextResponse.json({ humanHandoff: active, notified: 0 })
  }

  // Update DB
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { humanHandoff: active },
  })

  // Notify recent customers (active in the last 30 minutes)
  const since = new Date(Date.now() - 30 * 60 * 1000)
  const recentLogs = await prisma.messageLog.findMany({
    where: {
      restaurantId,
      direction: 'inbound',
      createdAt: { gte: since },
    },
    select: { customerPhone: true },
    distinct: ['customerPhone'],
  })

  const message = active ? ON_MESSAGE : OFF_MESSAGE
  const { sendTextMessage } = await import('@wabot/whatsapp')

  let notified = 0
  await Promise.allSettled(
    recentLogs.map(async ({ customerPhone }) => {
      await sendTextMessage({
        to: customerPhone,
        body: message,
        phoneNumberId: current.waPhoneNumberId,
        accessToken: current.waAccessToken,
      })
      notified++
    })
  )

  return NextResponse.json({ humanHandoff: active, notified })
}
