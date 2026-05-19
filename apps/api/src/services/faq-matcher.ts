import { prisma } from '@wabot/db'

export async function matchFaq(restaurantId: string, message: string): Promise<string | null> {
  const faqs = await prisma.faq.findMany({
    where: { restaurantId },
    orderBy: { priority: 'desc' },
  })

  const normalised = message.toLowerCase().trim()

  let bestScore = 0
  let bestAnswer: string | null = null

  for (const faq of faqs) {
    let score = 0
    for (const keyword of faq.keywords) {
      if (normalised.includes(keyword.toLowerCase())) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestAnswer = faq.answer
    }
  }

  return bestScore > 0 ? bestAnswer : null
}
