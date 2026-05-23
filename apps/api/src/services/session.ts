import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

redis.on('error', (err) => console.error('[Redis]', err.message))

const SESSION_TTL = 60 * 30 // 30 minutes

export interface ReservationSession {
  type: 'reservation'
  stage: 'ask_date' | 'ask_time' | 'ask_guests' | 'confirm'
  restaurantId: string
  customerPhone: string
  date?: string
  time?: string
  guests?: number
}

export interface CartItem {
  itemId: string
  name: string
  pricePaise: number
  quantity: number
}

export interface OrderSession {
  type: 'order'
  stage: 'selecting' | 'confirm'
  restaurantId: string
  customerPhone: string
  cart: CartItem[]
}

export type BotSession = ReservationSession | OrderSession

function key(restaurantId: string, phone: string) {
  return `session:${restaurantId}:${phone}`
}

export async function getSession(restaurantId: string, phone: string): Promise<BotSession | null> {
  const raw = await redis.get(key(restaurantId, phone))
  if (!raw) return null
  const parsed = JSON.parse(raw)
  // Backward-compat: old sessions without `type` are reservation sessions
  if (!parsed.type) parsed.type = 'reservation'
  return parsed as BotSession
}

export async function setSession(restaurantId: string, phone: string, state: BotSession) {
  await redis.setex(key(restaurantId, phone), SESSION_TTL, JSON.stringify(state))
}

export async function clearSession(restaurantId: string, phone: string) {
  await redis.del(key(restaurantId, phone))
}
