import { prisma } from '@wabot/db'

export type Intent = 'menu' | 'hours' | 'location' | 'reservation' | 'order' | 'unknown'

export function classifyIntent(message: string): Intent {
  const m = message.toLowerCase()

  const ORDER_KW    = ['order', 'i want to order', 'place order', 'want to eat', 'can i order', 'i\'d like to order']
  const RESERVE_KW  = ['book', 'reserve', 'table', 'reservation', 'seat', 'booking',
                       'visit', 'come', 'tonight', 'tomorrow', 'dinner', 'lunch']
  const MENU_KW     = ['menu', 'dish', 'item', 'price', 'rate', 'cost',
                       'paneer', 'chicken', 'veg', 'non-veg', 'starter', 'dessert',
                       'drink', 'beverage', 'special', 'available', 'food']
  const HOURS_KW    = ['time', 'timing', 'open', 'close', 'hours', 'when', 'schedule']
  const LOCATION_KW = ['where', 'location', 'address', 'map', 'direction', 'find', 'reach']

  if (ORDER_KW.some(k => m.includes(k)))    return 'order'
  if (RESERVE_KW.some(k => m.includes(k)))  return 'reservation'
  if (MENU_KW.some(k => m.includes(k)))     return 'menu'
  if (HOURS_KW.some(k => m.includes(k)))    return 'hours'
  if (LOCATION_KW.some(k => m.includes(k))) return 'location'
  return 'unknown'
}

export async function resolveStructured(restaurantId: string, intent: Intent): Promise<string | null> {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) return null

  if (intent === 'hours') {
    const hours = restaurant.businessHours as Record<string, string>
    const lines = Object.entries(hours)
      .map(([day, time]) => `${capitalise(day)}: ${time}`)
      .join('\n')
    return `🕐 *Our timings:*\n${lines}`
  }

  if (intent === 'location') {
    let reply = `📍 *Find us here:*\n${restaurant.address ?? 'Address not set yet'}`
    if (restaurant.locationLink) reply += `\n\n🗺 Google Maps: ${restaurant.locationLink}`
    return reply
  }

  if (intent === 'menu') {
    const items = await prisma.menuItem.findMany({
      where: { restaurantId, available: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
    if (!items.length) return null

    const byCategory = items.reduce<Record<string, typeof items>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    }, {})

    const lines = Object.entries(byCategory).map(([cat, catItems]) => {
      const itemLines = catItems.map(i => `  • ${i.name} — ₹${i.pricePaise / 100}`).join('\n')
      return `*${cat}*\n${itemLines}`
    })

    return `🍽 *Spice Garden Menu:*\n\n${lines.join('\n\n')}`
  }

  return null
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
