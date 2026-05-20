import { config } from 'dotenv'
import { join } from 'path'
// Root .env is two levels up from apps/api/
config({ path: join(process.cwd(), '../../.env') })
import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import formbody from '@fastify/formbody'
import { webhookRoutes } from './routes/webhook'
import { createMessageWorker } from './queue/message-queue'

const app = Fastify({ logger: true })

app.register(helmet)
app.register(formbody)
app.register(webhookRoutes, { prefix: '/webhook' })

app.get('/health', async () => ({ status: 'ok' }))

// Start the message queue worker
const worker = createMessageWorker()
app.log.info('Message queue worker started (concurrency: 10)')

// Graceful shutdown
const shutdown = async () => {
  await worker.close()
  await app.close()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

app.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' }, (err) => {
  if (err) { app.log.error(err); process.exit(1) }
})
