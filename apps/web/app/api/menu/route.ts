import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { category, name, price, description, available, restaurantId } = await req.json()
  if (restaurantId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const item = await prisma.menuItem.create({
    data: {
      restaurantId,
      category: category.trim(),
      name: name.trim(),
      pricePaise: Math.round(parseFloat(price) * 100),
      description: description?.trim() || null,
      available,
    },
  })
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, available } = await req.json()
  const item = await prisma.menuItem.update({ where: { id }, data: { available } })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')!
  await prisma.menuItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
