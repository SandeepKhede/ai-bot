import { prisma } from '@wabot/db'
import { sendTextMessage } from '@wabot/whatsapp'
import { askAI } from '@wabot/ai'
import { matchFaq } from './faq-matcher'
import { classifyIntent, resolveStructured } from './structured-resolver'
import { getSession } from './session'
import { handleReservationFlow, startReservationFlow } from './reservation-handler'
import { logMessage } from './logger'

export async function routeMessage(phoneNumberId: string, from: string, text: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { waPhoneNumberId: phoneNumberId },
  })
  if (!restaurant || !restaurant.botActive) return

  await logMessage({ restaurantId: restaurant.id, customerPhone: from, direction: 'inbound', content: text })

  if (restaurant.humanHandoff) return

  const send = async (body: string, resolvedBy: Parameters<typeof logMessage>[0]['resolvedBy']) => {
    await sendTextMessage({ to: from, body, phoneNumberId, accessToken: restaurant.waAccessToken })
    await logMessage({ restaurantId: restaurant.id, customerPhone: from, direction: 'outbound', content: body, resolvedBy })
  }

  // 1. Active reservation session
  const session = await getSession(restaurant.id, from)
  if (session) {
    await handleReservationFlow(restaurant, from, text)
    return
  }

  // 2. Reservation intent — checked before FAQ to avoid keyword overlap
  const intent = classifyIntent(text)
  if (intent === 'reservation') {
    await startReservationFlow(restaurant, from)
    return
  }

  // 3. FAQ match
  const faqAnswer = await matchFaq(restaurant.id, text)
  if (faqAnswer) {
    await send(faqAnswer, 'faq')
    return
  }

  // 4. Structured data resolver (menu / hours / location)
  if (intent !== 'unknown') {
    const structured = await resolveStructured(restaurant.id, intent)
    if (structured) {
      await send(structured, 'structured')
      return
    }
  }

  // 5. AI fallback
  const aiAnswer = await askAI(restaurant.id, text)
  if (aiAnswer) {
    await send(aiAnswer, 'ai')
    return
  }

  // 6. Total fallback
  await send(
    `Thanks for your message! Our team will get back to you shortly. For urgent queries, please call us directly. 🙏`,
    'fallback'
  )
}
