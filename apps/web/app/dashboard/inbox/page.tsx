import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import InboxClient from './InboxClient'

export default async function InboxPage() {
  const session = await auth()
  const restaurantId = session!.user.id

  // Latest inbound message per unique customer phone
  const latest = await prisma.$queryRaw<
    { customerPhone: string; content: string; createdAt: Date; total: bigint }[]
  >`
    SELECT DISTINCT ON ("customerPhone")
      "customerPhone",
      "content",
      "createdAt",
      COUNT(*) OVER (PARTITION BY "customerPhone") AS total
    FROM "MessageLog"
    WHERE "restaurantId" = ${restaurantId}
      AND direction = 'inbound'
    ORDER BY "customerPhone", "createdAt" DESC
    LIMIT 50
  `

  const customers = latest
    .map(r => ({
      customerPhone: r.customerPhone,
      lastMessage: r.content,
      lastAt: r.createdAt,
      total: Number(r.total),
    }))
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Conversation Inbox</h1>
      {customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No conversations yet.
        </div>
      ) : (
        <InboxClient restaurantId={restaurantId} customers={customers} />
      )}
    </div>
  )
}
