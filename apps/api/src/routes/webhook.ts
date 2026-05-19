import { FastifyInstance } from 'fastify'
import { extractIncomingMessage, sendTextMessage } from '@wabot/whatsapp'
import { prisma } from '@wabot/db'
import { matchFaq } from '../services/faq-matcher'
import { classifyIntent, resolveStructured } from '../services/structured-resolver'
import { getSession } from '../services/session'
import { handleReservationFlow, startReservationFlow } from '../services/reservation-handler'

export async function webhookRoutes(app: FastifyInstance) {
  app.get('/', async (req, reply) => {
    const {
      'hub.mode': mode,
      'hub.verify_token': token,
      'hub.challenge': challenge,
    } = req.query as any
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      app.log.info('Webhook verified by Meta')
      return reply.send(parseInt(challenge))
    }
    return reply.status(403).send('Forbidden')
  })

  app.post('/', async (req, reply) => {
    const msg = extractIncomingMessage(req.body)
    if (msg) {
      setImmediate(() => handleMessage(msg.phoneNumberId, msg.from, msg.text, app))
    }
    return reply.status(200).send('OK')
  })
}

async function handleMessage(
  phoneNumberId: string,
  from: string,
  text: string,
  app: FastifyInstance
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { waPhoneNumberId: phoneNumberId },
    })
    if (!restaurant || !restaurant.botActive) return

    const send = (body: string) =>
      sendTextMessage({ to: from, body, phoneNumberId, accessToken: restaurant.waAccessToken })

    // 1. Active reservation session takes priority
    const session = await getSession(restaurant.id, from)
    if (session) {
      await handleReservationFlow(restaurant, from, text)
      return
    }

    // 2. Reservation intent checked BEFORE FAQ — "book a table" must start the flow,
    //    not hit the reservation FAQ which has overlapping keywords
    const intent = classifyIntent(text)
    if (intent === 'reservation') {
      await startReservationFlow(restaurant, from)
      return
    }

    // 3. FAQ match
    const faqAnswer = await matchFaq(restaurant.id, text)
    if (faqAnswer) { await send(faqAnswer); return }

    if (intent !== 'unknown') {
      const structured = await resolveStructured(restaurant.id, intent)
      if (structured) { await send(structured); return }
    }

    // 4. Fallback
    await send('Thanks for your message! Our team will get back to you shortly. 🙏')
  } catch (err) {
    app.log.error(err, 'handleMessage failed')
  }
}
