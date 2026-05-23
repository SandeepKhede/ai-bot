import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 })

  const messages = await prisma.messageLog.findMany({
    where: { restaurantId: session.user.id, customerPhone: phone },
    orderBy: { createdAt: 'asc' },
    take: 200,
  })

  return NextResponse.json(messages)
}
