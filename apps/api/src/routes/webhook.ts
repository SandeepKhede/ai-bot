import { FastifyInstance } from 'fastify'
import { extractIncomingMessage } from '@wabot/whatsapp'
import { routeMessage } from '../services/message-router'

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
      setImmediate(() =>
        routeMessage(msg.phoneNumberId, msg.from, msg.text).catch(err =>
          app.log.error(err, 'routeMessage failed')
        )
      )
    }
    return reply.status(200).send('OK')
  })
}
