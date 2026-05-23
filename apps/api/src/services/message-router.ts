import { prisma } from '@wabot/db'
import { sendListMessage } from '@wabot/whatsapp'
import { askAI } from '@wabot/ai'
import { matchFaq } from './faq-matcher'
import { classifyIntent, resolveStructured } from './structured-resolver'
import { getSession, clearSession } from './session'
import { handleReservationFlow, startReservationFlow } from './reservation-handler'
import { handleOrderFlow, startOrderFlow, handleOrderItemBrowse } from './order-handler'
import { logMessage } from './logger'
import { safeText, safeButtons } from './wa-send'

const GREETINGS = new Set(['hi', 'hello', 'hey', 'hii', 'helo', 'good morning', 'good evening', 'good afternoon', 'namaste', 'hola'])

// These words clear any active session so a customer can always escape
const GLOBAL_CANCEL = new Set(['cancel', 'exit', 'stop', 'quit', 'restart', 'reset', 'main menu'])

export async function routeMessage(phoneNumberId: string, from: string, text: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { waPhoneNumberId: phoneNumberId },
  })
  if (!restaurant || !restaurant.botActive) return

  await logMessage({ restaurantId: restaurant.id, customerPhone: from, direction: 'inbound', content: text })

  if (restaurant.humanHandoff) return

  const wa = { phoneNumberId, accessToken: restaurant.waAccessToken }

  const send = async (body: string, resolvedBy: Parameters<typeof logMessage>[0]['resolvedBy']) => {
    await safeText(wa, from, body)
    await logMessage({ restaurantId: restaurant.id, customerPhone: from, direction: 'outbound', content: body, resolvedBy })
  }

  const sendBtns = async (body: string, buttons: { id: string; title: string }[], resolvedBy: Parameters<typeof logMessage>[0]['resolvedBy']) => {
    await safeButtons(wa, from, body, buttons)
    await logMessage({ restaurantId: restaurant.id, customerPhone: from, direction: 'outbound', content: body, resolvedBy })
  }

  const lower = text.toLowerCase().trim()

  // 0. Interactive list item selected — browse or order item
  if (text.startsWith('browse_')) {
    await handleOrderItemBrowse(restaurant, from, text.replace('browse_', ''))
    return
  }

  // 1. Global escape — clears any stuck session regardless of stage
  if (GLOBAL_CANCEL.has(lower)) {
    const sess = await getSession(restaurant.id, from)
    if (sess) {
      await clearSession(restaurant.id, from)
      await send(`Session cancelled. How can I help you?\n\nType *menu*, *book a table*, *location*, or *hours*.`, 'faq')
    } else {
      await send(`How can I help you?\n\nType *menu*, *book a table*, *location*, or *hours*.`, 'faq')
    }
    return
  }

  // 2. Active session (reservation or order) — routes to the correct handler
  const session = await getSession(restaurant.id, from)
  if (session) {
    if (session.type === 'order') {
      await handleOrderFlow(restaurant, from, text)
    } else {
      await handleReservationFlow(restaurant, from, text)
    }
    return
  }

  // 3. Greeting → interactive buttons
  if (GREETINGS.has(lower)) {
    await sendBtns(
      `👋 Hello! Welcome to *${restaurant.name}*.\n\nHow can I help you today?`,
      [
        { id: 'intent_menu', title: 'View Menu' },
        { id: 'intent_book', title: 'Book a Table' },
        { id: 'intent_location', title: 'Info & Hours' },
      ],
      'faq'
    )
    return
  }

  // 4. Intent classification
  const intent = classifyIntent(lower)

  if (intent === 'reservation') {
    await startReservationFlow(restaurant, from)
    return
  }

  if (intent === 'order') {
    await startOrderFlow(restaurant, from)
    return
  }

  // 5. FAQ match
  const faqAnswer = await matchFaq(restaurant.id, lower)
  if (faqAnswer) {
    await send(faqAnswer, 'faq')
    return
  }

  // 6. Menu — show as numbered text (list message attempted first, falls back gracefully)
  if (intent === 'menu') {
    const sent = await trySendMenuList(restaurant, from, phoneNumberId)
    if (!sent) {
      // List not supported — send formatted text menu
      const textMenu = await buildTextMenu(restaurant.id, restaurant.name)
      if (textMenu) {
        await send(textMenu, 'structured')
        return
      }
    } else {
      await logMessage({ restaurantId: restaurant.id, customerPhone: from, direction: 'outbound', content: '[menu list]', resolvedBy: 'structured' })
      return
    }
  }

  // 7. Structured data — hours / location
  if (intent !== 'unknown' && intent !== 'menu') {
    const structured = await resolveStructured(restaurant.id, intent)
    if (structured) {
      await send(structured, 'structured')
      return
    }
  }

  // 8. AI fallback
  const aiAnswer = await askAI(restaurant.id, text)
  if (aiAnswer) {
    await send(aiAnswer, 'ai')
    return
  }

  // 9. Total fallback
  await send(
    `Thanks for your message! Our team will get back to you shortly.\n\nYou can also type *menu*, *book a table*, or *location* for quick answers. 🙏`,
    'fallback'
  )
}

// Tries interactive list message — returns false if unsupported (sandbox/old client)
async function trySendMenuList(
  restaurant: { id: string; waPhoneNumberId: string; waAccessToken: string; name: string },
  to: string,
  phoneNumberId: string
): Promise<boolean> {
  try {
    const items = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id, available: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
    if (!items.length) return false

    const byCategory = items.reduce<Record<string, typeof items>>((acc, item) => {
      acc[item.category] = acc[item.category] ?? []
      acc[item.category].push(item)
      return acc
    }, {})

    const sections = Object.entries(byCategory).slice(0, 10).map(([cat, catItems]) => ({
      title: cat,
      rows: catItems.slice(0, 10).map(item => ({
        id: `browse_${item.id}`,
        title: item.name,
        description: `Rs.${item.pricePaise / 100}`,
      })),
    }))

    await sendListMessage({
      to,
      phoneNumberId,
      accessToken: restaurant.waAccessToken,
      body: `${restaurant.name} Menu\n\nTap any item to see details.`,
      buttonText: 'Browse Menu',
      sections,
    })
    return true
  } catch {
    return false
  }
}

// Plain-text numbered menu used as fallback when list messages fail
async function buildTextMenu(restaurantId: string, restaurantName: string): Promise<string | null> {
  const items = await prisma.menuItem.findMany({
    where: { restaurantId, available: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  if (!items.length) return null

  const byCategory = items.reduce<Record<string, typeof items>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? []
    acc[item.category].push(item)
    return acc
  }, {})

  const sections = Object.entries(byCategory).map(([cat, catItems]) => {
    const rows = catItems.map(i => `  • ${i.name}  Rs.${i.pricePaise / 100}`).join('\n')
    return `*${cat}*\n${rows}`
  })

  return `🍽️ *${restaurantName} Menu*\n\n${sections.join('\n\n')}\n\nTo place an order, type *"I want to order"*.`
}
