import { prisma } from '@wabot/db'
import { sendTextMessage } from '@wabot/whatsapp'
import { getSession, setSession, clearSession, ReservationSession } from './session'
import { logMessage } from './logger'
import { safeText, safeButtons, safeCtaUrl } from './wa-send'

type Restaurant = {
  id: string
  name: string
  waPhoneNumberId: string
  waAccessToken: string
  whatsappNumber: string
  utrEnabled: boolean
  utrUpiId: string | null
  utrAdvancePaise: number
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

      const reservation = await prisma.reservation.create({
        data: {
          restaurantId: restaurant.id,
          customerId: customer.id,
          date: session.date!,
          timeSlot: session.time!,
          guests: session.guests!,
          status: 'PENDING',
        },
      })

      // --- UTR advance payment flow ---
      if (restaurant.utrEnabled && restaurant.utrUpiId) {
        const amount = restaurant.utrAdvancePaise / 100
        const tn = `Table advance - ${session.date}`

        // Build the pay page URL (HTTPS required for WhatsApp CTA buttons)
        const apiBase = process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`
        const payUrl = `${apiBase}/pay?pa=${encodeURIComponent(restaurant.utrUpiId)}&am=${amount}&pn=${encodeURIComponent(restaurant.name)}&tn=${encodeURIComponent(tn)}`

        // Move session to ask_utr stage, store reservationId so we can attach UTR later
        session.stage = 'ask_utr'
        session.reservationId = reservation.id
        await setSession(restaurant.id, customerPhone, session)

        const body =
          `💳 *Advance Payment Required*\n\n` +
          `To secure your table at *${restaurant.name}*, please pay *₹${amount}* in advance.\n\n` +
          `Tap the button below to open your UPI app directly. 👇\n\n` +
          `After paying, reply with your *UTR / Transaction ID* (12-digit number shown in the payment app).`

        await safeCtaUrl(
          { phoneNumberId: restaurant.waPhoneNumberId, accessToken: restaurant.waAccessToken },
          customerPhone,
          body,
          `💳 Pay ₹${amount} Now`,
          payUrl
        )
        await logMessage({
          restaurantId: restaurant.id, customerPhone,
          direction: 'outbound', content: body, resolvedBy: 'session'
        })
        return true
      }

      // --- Free reservation (UTR disabled) ---
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

  // --- Collect UTR after payment ---
  if (session.stage === 'ask_utr') {
    const utr = m.replace(/\s+/g, '')

    if (utr.length < 6) {
      await send(
        restaurant,
        customerPhone,
        `📱 Please send your *UTR / Transaction ID* — it's the 12-digit reference shown in your payment app after paying.`
      )
      return true
    }

    if (session.reservationId) {
      await prisma.reservation.update({
        where: { id: session.reservationId },
        data: { utrNumber: utr },
      })
    }

    await clearSession(restaurant.id, customerPhone)
    await send(
      restaurant,
      customerPhone,
      `✅ *Got it!* UTR *${utr}* noted.\n\nYour reservation is *pending payment verification*.\nWe'll confirm and notify you shortly. 🙏`
    )

    // Notify owner with UTR so they can verify
    await sendTextMessage({
      to: restaurant.whatsappNumber,
      body: `🔔 *New Reservation + Payment!*\n\n📅 ${session.date} at ${session.time}\n👥 ${session.guests} guests\n📱 From: +${customerPhone}\n💳 UTR: ${utr}\n\n👉 Open your dashboard to verify & confirm.`,
      phoneNumberId: restaurant.waPhoneNumberId,
      accessToken: restaurant.waAccessToken,
    }).catch(() => {})

    return true
  }

  return false
}
