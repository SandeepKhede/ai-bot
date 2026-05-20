import { prisma } from '@wabot/db'

export async function logMessage(data: {
  restaurantId: string
  customerPhone: string
  direction: 'inbound' | 'outbound'
  content: string
  resolvedBy?: 'faq' | 'structured' | 'ai' | 'human' | 'session' | 'fallback'
}) {
  await prisma.messageLog.create({ data }).catch(() => {/* log failures must never crash the bot */})
}
