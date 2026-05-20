import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, address, locationLink, whatsappNumber, botActive, humanHandoff, businessHours, restaurantId } =
    await req.json()

  if (restaurantId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const restaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { name, address, locationLink, whatsappNumber, botActive, humanHandoff, businessHours },
  })
  return NextResponse.json(restaurant)
}
