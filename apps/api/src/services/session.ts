import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

redis.on('error', (err) => console.error('[Redis]', err.message))

const SESSION_TTL = 60 * 30 // 30 minutes

export interface ReservationSession {
  stage: 'ask_date' | 'ask_time' | 'ask_guests' | 'confirm'
  restaurantId: string
  customerPhone: string
  date?: string
  time?: string
  guests?: number
}

function key(restaurantId: string, phone: string) {
  return `session:${restaurantId}:${phone}`
}

export async function getSession(
  restaurantId: string,
  phone: string
): Promise<ReservationSession | null> {
  const raw = await redis.get(key(restaurantId, phone))
  return raw ? JSON.parse(raw) : null
}

export async function setSession(
  restaurantId: string,
  phone: string,
  state: ReservationSession
) {
  await redis.setex(key(restaurantId, phone), SESSION_TTL, JSON.stringify(state))
}

export async function clearSession(restaurantId: string, phone: string) {
  await redis.del(key(restaurantId, phone))
}
