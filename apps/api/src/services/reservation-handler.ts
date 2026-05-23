import { prisma } from '@wabot/db'
import { sendTextMessage } from '@wabot/whatsapp'
import { getSession, setSession, clearSession, ReservationSession } from './session'
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

async function send(restaurant: Restaurant, to: string, body: string) {
  await safeText(creds(restaurant), to, body)
  await logMessage({ restaurantId: restaurant.id, customerPhone: to, direction: 'outbound', content: body, resolvedBy: 'session' })
}

async function sendButtons(restaurant: Restaurant, to: string, body: string, buttons: { id: string; title: string }[]) {
  await safeButtons(creds(restaurant), to, body, buttons)
  await logMessage({ restaurantId: restaurant.id, customerPhone: to, direction: 'outbound', content: body, resolvedBy: 'session' })
}

export async function startReservationFlow(restaurant: Restaurant, customerPhone: string) {
  const session: ReservationSession = {
    type: 'reservation',
    stage: 'ask_date',
    restaurantId: restaurant.id,
    customerPhone,
  }
  await setSession(restaurant.id, customerPhone, session)
  await send(restaurant, customerPhone,
    `📅 Sure! Let's book a table at *${restaurant.name}*.\n\nWhat date would you like to visit? (e.g. "25 Dec" or "tomorrow")`)
}

export async function handleReservationFlow(
  restaurant: Restaurant,
  customerPhone: string,
  message: string
): Promise<boolean> {
  const raw = await getSession(restaurant.id, customerPhone)
  if (!raw || raw.type !== 'reservation') return false
  const session = raw as ReservationSession

  const m = message.trim()

  if (session.stage === 'ask_date') {
    if (m.length < 2) {
      await send(restaurant, customerPhone, '📅 Please share the date you\'d like to visit (e.g. "25 Dec" or "tomorrow").')
      return true
    }
    session.date = m
    session.stage = 'ask_time'
    await setSession(restaurant.id, customerPhone, session)
    await send(restaurant, customerPhone, `⏰ What time works for you? (e.g. "7:30 PM")`)
    return true
  }

  if (session.stage === 'ask_time') {
    session.time = m
    session.stage = 'ask_guests'
    await setSession(restaurant.id, customerPhone, session)
    await send(restaurant, customerPhone, `👥 How many guests will be joining?`)
    return true
  }

  if (session.stage === 'ask_guests') {
    const guests = parseInt(m)
    if (isNaN(guests) || guests < 1 || guests > 50) {
      await send(restaurant, customerPhone, `Please reply with a number between 1 and 50 (e.g. "4").`)
      return true
    }
    session.guests = guests
    session.stage = 'confirm'
    await setSession(restaurant.id, customerPhone, session)

    await sendButtons(restaurant, customerPhone,
      `📋 *Reservation Summary*\n\n📅 Date: ${session.date}\n⏰ Time: ${session.time}\n👥 Guests: ${guests}\n\nConfirm your booking?`,
      [
        { id: 'res_yes', title: '✅ Confirm' },
        { id: 'res_no',  title: '❌ Cancel' },
      ]
    )
    return true
  }

  if (session.stage === 'confirm') {
    const reply = m.toLowerCase()

    if (reply === 'yes' || reply === 'y') {
      const customer = await prisma.customer.upsert({
        where: { restaurantId_whatsappNumber: { restaurantId: restaurant.id, whatsappNumber: customerPhone } },
        update: { visitCount: { increment: 1 }, lastSeen: new Date() },
        create: { restaurantId: restaurant.id, whatsappNumber: customerPhone },
      })

      await prisma.reservation.create({
        data: {
          restaurantId: restaurant.id,
          customerId: customer.id,
          date: session.date!,
          timeSlot: session.time!,
          guests: session.guests!,
          status: 'PENDING',
        },
      })

      await clearSession(restaurant.id, customerPhone)
      await send(restaurant, customerPhone,
        `✅ *Reservation confirmed!*\n\nWe'll see you on ${session.date} at ${session.time}.\n\nFor any changes, just message us again. 🙏`)

      await sendTextMessage({
        to: restaurant.whatsappNumber,
        body: `🔔 *New Reservation!*\n\n📅 ${session.date} at ${session.time}\n👥 ${session.guests} guests\n📱 From: +${customerPhone}`,
        phoneNumberId: restaurant.waPhoneNumberId,
        accessToken: restaurant.waAccessToken,
      }).catch(() => {})

      return true
    }

    if (reply === 'no' || reply === 'n') {
      await clearSession(restaurant.id, customerPhone)
      await send(restaurant, customerPhone, `No problem! Feel free to message us whenever you'd like to book. 😊`)
      return true
    }

    await sendButtons(restaurant, customerPhone, `Please confirm your reservation:`,
      [
        { id: 'res_yes', title: '✅ Confirm' },
        { id: 'res_no',  title: '❌ Cancel' },
      ]
    )
    return true
  }

  return false
}
