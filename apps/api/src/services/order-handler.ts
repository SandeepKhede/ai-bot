import { prisma } from '@wabot/db'
import { sendTextMessage } from '@wabot/whatsapp'
import { getSession, setSession, clearSession, OrderSession } from './session'
import { logMessage } from './logger'
import { safeText, safeButtons } from './wa-send'

type Restaurant = {
  id: string
  name: string
  waPhoneNumberId: string
  waAccessToken: string
  whatsappNumber: string
}

type Creds = { phoneNumberId: string; accessToken: string }
const creds = (r: Restaurant): Creds => ({ phoneNumberId: r.waPhoneNumberId, accessToken: r.waAccessToken })

async function send(r: Restaurant, to: string, body: string) {
  await safeText(creds(r), to, body)
  await logMessage({ restaurantId: r.id, customerPhone: to, direction: 'outbound', content: body, resolvedBy: 'session' })
}

async function sendBtns(r: Restaurant, to: string, body: string, buttons: { id: string; title: string }[]) {
  await safeButtons(creds(r), to, body, buttons)
  await logMessage({ restaurantId: r.id, customerPhone: to, direction: 'outbound', content: body, resolvedBy: 'session' })
}

// Always returns items in the same consistent order (important for number-based selection)
async function getMenuItems(restaurantId: string) {
  return prisma.menuItem.findMany({
    where: { restaurantId, available: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
}

// Builds a numbered text menu. No list messages needed.
async function buildNumberedMenu(restaurantId: string): Promise<{ text: string; items: Awaited<ReturnType<typeof getMenuItems>> }> {
  const items = await getMenuItems(restaurantId)

  const byCategory = items.reduce<Record<string, typeof items>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? []
    acc[item.category].push(item)
    return acc
  }, {})

  let counter = 1
  const sections = Object.entries(byCategory).map(([cat, catItems]) => {
    const rows = catItems.map(i => `${counter++}. ${i.name}  Rs.${i.pricePaise / 100}`)
    return `*${cat}*\n${rows.join('\n')}`
  })

  return { text: sections.join('\n\n'), items }
}

async function addItemToCart(
  r: Restaurant,
  customerPhone: string,
  session: OrderSession,
  item: { id: string; name: string; pricePaise: number }
) {
  const existing = session.cart.find(c => c.itemId === item.id)
  if (existing) {
    existing.quantity++
  } else {
    session.cart.push({ itemId: item.id, name: item.name, pricePaise: item.pricePaise, quantity: 1 })
  }
  await setSession(r.id, customerPhone, session)

  await sendBtns(r, customerPhone,
    `✅ *${item.name}* added to cart!\n\nCart has ${session.cart.length} item(s).\nReply with another number to add more, or "done" to checkout.`,
    [
      { id: 'order_more', title: 'Add More' },
      { id: 'order_done', title: 'Done' },
    ]
  )
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function startOrderFlow(restaurant: Restaurant, customerPhone: string) {
  const session: OrderSession = {
    type: 'order',
    stage: 'selecting',
    restaurantId: restaurant.id,
    customerPhone,
    cart: [],
  }
  await setSession(restaurant.id, customerPhone, session)

  const { text, items } = await buildNumberedMenu(restaurant.id)
  if (!items.length) {
    await send(restaurant, customerPhone, 'Our menu is being updated. Please check back soon!')
    await clearSession(restaurant.id, customerPhone)
    return
  }

  await send(restaurant, customerPhone,
    `🛒 *What would you like to order?*\n\n${text}\n\nReply with the *item number* (e.g. "3") or *item name* to add to cart.\nReply *done* to checkout or *cancel* to exit.`
  )
}

// Called when user taps a browse list item (browse_ITEMID) — show details + order button
export async function handleOrderItemBrowse(restaurant: Restaurant, customerPhone: string, itemId: string) {
  const item = await prisma.menuItem.findUnique({ where: { id: itemId } })
  if (!item) return

  const desc = item.description ? `\n${item.description}` : ''
  await sendBtns(restaurant, customerPhone,
    `*${item.name}*\nRs.${item.pricePaise / 100}${desc}\n\nAdd this to your order?`,
    [
      { id: `order_${item.id}`, title: 'Order This' },
      { id: 'intent_menu',      title: 'Back to Menu' },
    ]
  )
}

export async function handleOrderFlow(restaurant: Restaurant, customerPhone: string, text: string): Promise<boolean> {
  const raw = await getSession(restaurant.id, customerPhone)
  if (!raw || raw.type !== 'order') return false
  const session = raw as OrderSession

  const lower = text.toLowerCase().trim()

  // ── Universal cancel — works in any stage ──────────────────────────────────
  const CANCEL_WORDS = ['no', 'cancel', 'exit', 'stop', 'quit', 'back']
  if (CANCEL_WORDS.includes(lower)) {
    await clearSession(restaurant.id, customerPhone)
    await send(restaurant, customerPhone, 'Order cancelled. Feel free to message us anytime! 😊')
    return true
  }

  // ── Item added via interactive list/button reply ───────────────────────────
  if (text.startsWith('order_') && !['order_done', 'order_more'].includes(text)) {
    const itemId = text.replace('order_', '')
    const item = await prisma.menuItem.findUnique({ where: { id: itemId } })
    if (!item) {
      await send(restaurant, customerPhone, 'Item not found. Please try again.')
      return true
    }
    session.stage = 'selecting'
    await addItemToCart(restaurant, customerPhone, session, item)
    return true
  }

  // ── SELECTING stage ────────────────────────────────────────────────────────
  if (session.stage === 'selecting') {

    // Show menu / add more
    if (['menu', 'more', 'order more', 'add more', 'show menu', 'view menu'].includes(lower)) {
      const { text: menuText } = await buildNumberedMenu(restaurant.id)
      await send(restaurant, customerPhone,
        `Here's our menu:\n\n${menuText}\n\nReply with item number or name. Reply *done* to checkout.`
      )
      return true
    }

    // Checkout
    if (['done', 'confirm', 'place order', 'checkout', 'order_done'].includes(lower)) {
      if (session.cart.length === 0) {
        await send(restaurant, customerPhone, 'Your cart is empty! Reply with an item number to add something first.')
        return true
      }
      session.stage = 'confirm'
      await setSession(restaurant.id, customerPhone, session)

      const total = session.cart.reduce((s, i) => s + i.pricePaise * i.quantity, 0)
      const lines = session.cart.map(i => `• ${i.name} ×${i.quantity}  Rs.${(i.pricePaise * i.quantity) / 100}`).join('\n')
      await sendBtns(restaurant, customerPhone,
        `🧾 *Your Order*\n\n${lines}\n\n*Total: Rs.${total / 100}*\n\nConfirm?`,
        [
          { id: 'res_yes', title: 'Confirm Order' },
          { id: 'res_no',  title: 'Cancel' },
        ]
      )
      return true
    }

    // Match by item number (e.g. user types "3")
    const num = parseInt(text.trim())
    if (!isNaN(num) && num > 0) {
      const allItems = await getMenuItems(restaurant.id)
      const item = allItems[num - 1]
      if (item) {
        session.stage = 'selecting'
        await addItemToCart(restaurant, customerPhone, session, item)
        return true
      }
      await send(restaurant, customerPhone, `No item #${num}. Please enter a valid number from the menu.`)
      return true
    }

    // Match by item name (fuzzy)
    const allItems = await getMenuItems(restaurant.id)
    const matched = allItems.find(i => {
      const il = i.name.toLowerCase()
      return il.includes(lower) || lower.includes(il.split(' ')[0])
    })
    if (matched) {
      session.stage = 'selecting'
      await addItemToCart(restaurant, customerPhone, session, matched)
      return true
    }

    // Unrecognised — re-show menu instead of confusing 3-button prompt
    const { text: menuText } = await buildNumberedMenu(restaurant.id)
    await send(restaurant, customerPhone,
      `I didn't get that. Here's the menu:\n\n${menuText}\n\nReply with item *number*, *name*, *done* to checkout, or *cancel* to exit.`
    )
    return true
  }

  // ── CONFIRM stage ──────────────────────────────────────────────────────────
  if (session.stage === 'confirm') {

    if (lower === 'yes' || lower === 'y') {
      const customer = await prisma.customer.upsert({
        where: { restaurantId_whatsappNumber: { restaurantId: restaurant.id, whatsappNumber: customerPhone } },
        update: { visitCount: { increment: 1 }, lastSeen: new Date() },
        create: { restaurantId: restaurant.id, whatsappNumber: customerPhone },
      })

      const total = session.cart.reduce((s, i) => s + i.pricePaise * i.quantity, 0)

      const order = await prisma.order.create({
        data: {
          restaurantId: restaurant.id,
          customerId: customer.id,
          totalPaise: total,
          status: 'PENDING',
          items: {
            create: session.cart.map(i => ({
              menuItemId: i.itemId,
              name: i.name,
              pricePaise: i.pricePaise,
              quantity: i.quantity,
            })),
          },
        },
      })

      await clearSession(restaurant.id, customerPhone)
      await send(restaurant, customerPhone,
        `🎉 *Order Placed!*\n\nOrder #${order.id.slice(-6).toUpperCase()}\nTotal: Rs.${total / 100}\n\nWe'll start preparing your order shortly. Thank you! 🙏`)

      await sendTextMessage({
        to: restaurant.whatsappNumber,
        body: `🔔 *New Order!* #${order.id.slice(-6).toUpperCase()}\n\n${session.cart.map(i => `• ${i.name} ×${i.quantity}`).join('\n')}\n\nTotal: Rs.${total / 100}\nFrom: +${customerPhone}`,
        phoneNumberId: restaurant.waPhoneNumberId,
        accessToken: restaurant.waAccessToken,
      }).catch(() => {})

      return true
    }

    // No / cancel at confirm stage
    await clearSession(restaurant.id, customerPhone)
    await send(restaurant, customerPhone, 'Order cancelled. Feel free to start again anytime! 😊')
    return true
  }

  return false
}
