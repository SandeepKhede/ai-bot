import OpenAI from 'openai'
import { prisma } from '@wabot/db'

let _openai: OpenAI | null = null

function getClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

const AI_CALL_LIMITS: Record<string, number> = {
  STARTER: 50,
  GROWTH: 150,
  PRO: 500,
}

const MENU_KEYWORDS = ['menu', 'dish', 'item', 'price', 'cost', 'rate', 'eat',
  'paneer', 'chicken', 'veg', 'starter', 'dessert', 'drink', 'beverage',
  'special', 'available', 'order', 'ingredient', 'contain', 'made', 'spice',
  'spicy', 'sweet', 'sour', 'portion', 'serving', 'half', 'full', 'combo']

function isFoodRelated(message: string): boolean {
  const m = message.toLowerCase()
  return MENU_KEYWORDS.some(k => m.includes(k))
}

export async function askAI(
  restaurantId: string,
  customerMessage: string
): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) return null

  const limit = AI_CALL_LIMITS[restaurant.plan] ?? 50
  if (restaurant.monthlyAiCalls >= limit) {
    return `I'm not sure about that — please call us or ask our staff directly! 😊`
  }

  const hours = JSON.stringify(restaurant.businessHours)

  // Only fetch and inject menu when the question is food-related
  let menuSection = ''
  if (isFoodRelated(customerMessage)) {
    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId, available: true },
      select: { category: true, name: true, pricePaise: true, description: true },
      take: 60,
    })
    if (menuItems.length) {
      const menuText = menuItems
        .map(i => `${i.category} | ${i.name} | ₹${i.pricePaise / 100}${i.description ? ` | ${i.description}` : ''}`)
        .join('\n')
      menuSection = `\n\nMENU:\n${menuText}`
    }
  }

  const systemPrompt = `You are a friendly WhatsApp assistant for ${restaurant.name}, a restaurant in India.
Answer customer questions based ONLY on the information below.
If you don't know, say "I'm not sure — please call us!" Do NOT make up prices or details.
Keep replies short (under 100 words), warm, and use simple language.
Do not use markdown — plain text only. You may use *bold* sparingly.

RESTAURANT INFO:
Name: ${restaurant.name}
Address: ${restaurant.address ?? 'Not provided'}
Timings: ${hours}${menuSection}`

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 200,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: customerMessage },
    ],
  })

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { monthlyAiCalls: { increment: 1 } },
  })

  return response.choices[0].message.content ?? null
}
