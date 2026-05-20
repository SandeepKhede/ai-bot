import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question, answer, keywords, restaurantId } = await req.json()
  if (restaurantId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const faq = await prisma.faq.create({
    data: { restaurantId, question, answer, keywords },
  })
  return NextResponse.json(faq)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')!
  await prisma.faq.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
