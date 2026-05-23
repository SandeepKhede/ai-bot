import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const restaurantId = session.user.id

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [rawDailyMessages, resolutionGroups, peakHoursRaw, totalInbound, totalOutbound] = await Promise.all([
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, COUNT(*)::bigint as count
      FROM "MessageLog"
      WHERE "restaurantId" = ${restaurantId}
        AND "createdAt" >= ${sevenDaysAgo}
        AND direction = 'inbound'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date
    `,
    prisma.messageLog.groupBy({
      by: ['resolvedBy'],
      where: { restaurantId, direction: 'outbound' },
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ hour: number; count: bigint }[]>`
      SELECT EXTRACT(HOUR FROM "createdAt")::int as hour, COUNT(*)::bigint as count
      FROM "MessageLog"
      WHERE "restaurantId" = ${restaurantId}
        AND direction = 'inbound'
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY hour
    `,
    prisma.messageLog.count({ where: { restaurantId, direction: 'inbound' } }),
    prisma.messageLog.count({ where: { restaurantId, direction: 'outbound' } }),
  ])

  // Fill in missing days with 0
  const dailyMessages: { date: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const found = rawDailyMessages.find(r => r.date === dateStr)
    dailyMessages.push({ date: dateStr, count: found ? Number(found.count) : 0 })
  }

  const resolution = resolutionGroups.reduce<Record<string, number>>((acc, g) => {
    acc[g.resolvedBy ?? 'unknown'] = g._count._all
    return acc
  }, {})

  const peakHours = peakHoursRaw.map(r => ({ hour: r.hour, count: Number(r.count) }))

  return NextResponse.json({ dailyMessages, resolution, peakHours, totalInbound, totalOutbound })
}
