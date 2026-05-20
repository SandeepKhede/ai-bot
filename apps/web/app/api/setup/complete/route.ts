import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.restaurant.update({
    where: { id: session.user.id },
    data: { botActive: true, setupComplete: true },
  })

  return NextResponse.json({ ok: true })
}
