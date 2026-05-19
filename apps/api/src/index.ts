import { config } from 'dotenv'
import { join } from 'path'
// Root .env is two levels up from apps/api/
config({ path: join(process.cwd(), '../../.env') })
import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import formbody from '@fastify/formbody'
import { webhookRoutes } from './routes/webhook'

const app = Fastify({ logger: true })

app.register(helmet)
app.register(formbody)
app.register(webhookRoutes, { prefix: '/webhook' })

app.get('/health', async () => ({ status: 'ok' }))

app.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' }, (err) => {
  if (err) { app.log.error(err); process.exit(1) }
})
