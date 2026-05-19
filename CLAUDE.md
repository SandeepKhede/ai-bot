# WhatsApp AI Assistant for Restaurants — Implementation Plan
# Optimized for Claude Code

## Project Overview

A multi-tenant SaaS product that gives restaurants a WhatsApp-based AI front desk.
Each restaurant gets an automated bot that handles menu queries, business info,
table reservations, and escalates to human staff when needed.

**Tech Stack**
- Runtime: Node.js 20+ (TypeScript)
- Framework: Fastify (faster than Express, built-in schema validation)
- Database: PostgreSQL 15 via Prisma ORM
- Cache / Sessions: Redis (Upstash for managed, or local Docker)
- Queue: BullMQ (backed by Redis)
- WhatsApp: Meta Cloud API (free, no BSP)
- AI: OpenAI GPT-4o-mini (cheapest capable model; swap to Claude later)
- Admin portal: Next.js 14 (App Router)
- Deployment: Railway (MVP) → AWS ECS (scale)
- Payments: Razorpay

---

## Repository Structure

```
whatsapp-saas/
├── apps/
│   ├── api/                   # Fastify backend
│   └── web/                   # Next.js admin portal
├── packages/
│   ├── db/                    # Prisma schema + migrations
│   ├── whatsapp/              # Meta Cloud API client
│   ├── ai/                    # AI layer wrapper
│   └── shared/                # Types, utils, constants
├── docker-compose.yml         # Local dev (postgres + redis)
├── .env.example
└── CLAUDE.md                  # This file
```

Use a pnpm workspace monorepo.

---

## Phase 1 — Infrastructure & WhatsApp Plumbing
**Goal: Receive a WhatsApp message and send a reply back. No DB, no AI.**

### 1.1 Project Scaffolding

```bash
mkdir whatsapp-saas && cd whatsapp-saas
pnpm init
pnpm add -D typescript tsx @types/node
```

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Create `docker-compose.yml`:
```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: wabot
      POSTGRES_USER: wabot
      POSTGRES_PASSWORD: wabot
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  pgdata:
```

### 1.2 Fastify API App

```bash
mkdir -p apps/api/src
cd apps/api
pnpm init
pnpm add fastify @fastify/formbody @fastify/helmet dotenv axios
pnpm add -D typescript @types/node tsx nodemon
```

Create `apps/api/src/index.ts`:
```typescript
import Fastify from 'fastify'
import { webhookRoutes } from './routes/webhook'

const app = Fastify({ logger: true })

app.register(webhookRoutes, { prefix: '/webhook' })

app.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) { app.log.error(err); process.exit(1) }
})
```

### 1.3 WhatsApp Package

```bash
mkdir -p packages/whatsapp/src
cd packages/whatsapp
pnpm init
pnpm add axios
```

Create `packages/whatsapp/src/client.ts`:
```typescript
import axios from 'axios'

const BASE = 'https://graph.facebook.com/v19.0'

export interface TextMessage {
  to: string
  body: string
  phoneNumberId: string
  accessToken: string
}

export async function sendTextMessage(msg: TextMessage): Promise<void> {
  await axios.post(
    `${BASE}/${msg.phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: msg.to,
      type: 'text',
      text: { body: msg.body },
    },
    {
      headers: {
        Authorization: `Bearer ${msg.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )
}

export function extractIncomingMessage(body: unknown): {
  from: string
  text: string
  phoneNumberId: string
} | null {
  try {
    const entry = (body as any).entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value
    const msg = value?.messages?.[0]
    if (!msg || msg.type !== 'text') return null
    return {
      from: msg.from,
      text: msg.text.body,
      phoneNumberId: value.metadata.phone_number_id,
    }
  } catch {
    return null
  }
}
```

### 1.4 Webhook Route

Create `apps/api/src/routes/webhook.ts`:
```typescript
import { FastifyInstance } from 'fastify'
import { extractIncomingMessage, sendTextMessage } from '@wabot/whatsapp'

export async function webhookRoutes(app: FastifyInstance) {
  // Meta verification handshake
  app.get('/', async (req, reply) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query as any
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      return reply.send(parseInt(challenge))
    }
    return reply.status(403).send('Forbidden')
  })

  // Incoming messages
  app.post('/', async (req, reply) => {
    const msg = extractIncomingMessage(req.body)
    if (msg) {
      // Placeholder — will be replaced by the message router in Phase 2
      await sendTextMessage({
        to: msg.from,
        body: `Thanks for your message! Our bot is being set up. 🙏`,
        phoneNumberId: msg.phoneNumberId,
        accessToken: process.env.WA_ACCESS_TOKEN!,
      })
    }
    return reply.status(200).send('OK')
  })
}
```

**Checkpoint:** Deploy to a public URL (use ngrok locally), configure the Meta webhook, send a message from your phone, and receive the echo reply.

---

## Phase 2 — Database Schema & FAQ Engine
**Goal: A real restaurant in the DB. "What time do you open?" returns the correct answer.**

### 2.1 Prisma Schema

```bash
mkdir -p packages/db
cd packages/db
pnpm init
pnpm add prisma @prisma/client
npx prisma init
```

Replace `packages/db/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Restaurant {
  id              String   @id @default(cuid())
  name            String
  whatsappNumber  String   @unique
  waPhoneNumberId String   @unique
  waAccessToken   String
  address         String?
  locationLink    String?
  businessHours   Json     // { mon: "9am-10pm", tue: "9am-10pm", ... }
  plan            Plan     @default(STARTER)
  botActive       Boolean  @default(true)
  humanHandoff    Boolean  @default(false)
  monthlyAiCalls  Int      @default(0)
  aiCallsResetAt  DateTime @default(now())
  createdAt       DateTime @default(now())

  customers    Customer[]
  menuItems    MenuItem[]
  faqs         Faq[]
  reservations Reservation[]
  sessions     Session[]
}

model Customer {
  id             String     @id @default(cuid())
  restaurantId   String
  whatsappNumber String
  name           String?
  label          String?    // new | repeat | vip
  visitCount     Int        @default(1)
  lastSeen       DateTime   @default(now())
  createdAt      DateTime   @default(now())

  restaurant   Restaurant    @relation(fields: [restaurantId], references: [id])
  reservations Reservation[]

  @@unique([restaurantId, whatsappNumber])
}

model MenuItem {
  id           String  @id @default(cuid())
  restaurantId String
  category     String
  name         String
  pricePaise   Int     // store in paise to avoid float issues (₹49 = 4900)
  description  String?
  available    Boolean @default(true)

  restaurant Restaurant @relation(fields: [restaurantId], references: [id])
}

model Faq {
  id           String   @id @default(cuid())
  restaurantId String
  question     String
  answer       String
  keywords     String[] // postgres text array
  priority     Int      @default(0)

  restaurant Restaurant @relation(fields: [restaurantId], references: [id])
}

model Reservation {
  id           String            @id @default(cuid())
  restaurantId String
  customerId   String
  date         String            // "2024-12-25"
  timeSlot     String            // "7:30 PM"
  guests       Int
  status       ReservationStatus @default(PENDING)
  createdAt    DateTime          @default(now())

  restaurant Restaurant @relation(fields: [restaurantId], references: [id])
  customer   Customer   @relation(fields: [customerId], references: [id])
}

model Session {
  id           String   @id @default(cuid())
  restaurantId String
  customerPhone String
  state        String   // JSON stringified session state
  expiresAt    DateTime
  updatedAt    DateTime @updatedAt

  restaurant Restaurant @relation(fields: [restaurantId], references: [id])

  @@unique([restaurantId, customerPhone])
}

model MessageLog {
  id           String   @id @default(cuid())
  restaurantId String
  customerPhone String
  direction    String   // inbound | outbound
  content      String
  resolvedBy   String?  // faq | structured | ai | human
  createdAt    DateTime @default(now())
}

enum Plan {
  STARTER
  GROWTH
  PRO
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
}
```

Run migration:
```bash
DATABASE_URL="postgresql://wabot:wabot@localhost:5432/wabot" npx prisma migrate dev --name init
```

### 2.2 FAQ Matcher

Create `apps/api/src/services/faq-matcher.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Simple fuzzy keyword matcher.
 * Returns the best FAQ answer or null if no match found.
 * Strategy: score each FAQ by how many of its keywords appear in the message.
 * Return the highest-scoring FAQ above threshold.
 */
export async function matchFaq(
  restaurantId: string,
  message: string
): Promise<string | null> {
  const faqs = await prisma.faq.findMany({
    where: { restaurantId },
    orderBy: { priority: 'desc' },
  })

  const normalised = message.toLowerCase().trim()

  let bestScore = 0
  let bestAnswer: string | null = null

  for (const faq of faqs) {
    let score = 0
    for (const keyword of faq.keywords) {
      if (normalised.includes(keyword.toLowerCase())) {
        score++
      }
    }
    // Require at least 1 keyword match; prefer higher scores
    if (score > bestScore) {
      bestScore = score
      bestAnswer = faq.answer
    }
  }

  return bestScore > 0 ? bestAnswer : null
}
```

### 2.3 Structured Data Resolver

Create `apps/api/src/services/structured-resolver.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type Intent = 'menu' | 'hours' | 'location' | 'reservation' | 'unknown'

/** Rule-based intent classifier — no AI needed */
export function classifyIntent(message: string): Intent {
  const m = message.toLowerCase()

  const MENU_KEYWORDS = ['menu', 'food', 'dish', 'item', 'eat', 'price', 'rate', 'cost',
    'paneer', 'chicken', 'veg', 'non-veg', 'starter', 'dessert', 'drink', 'beverage',
    'special', 'today', 'available']
  const HOURS_KEYWORDS = ['time', 'timing', 'open', 'close', 'hours', 'when', 'schedule']
  const LOCATION_KEYWORDS = ['where', 'location', 'address', 'map', 'direction', 'find', 'reach']
  const RESERVATION_KEYWORDS = ['book', 'reserve', 'table', 'reservation', 'seat', 'booking',
    'visit', 'come', 'tonight', 'tomorrow', 'dinner', 'lunch']

  if (RESERVATION_KEYWORDS.some(k => m.includes(k))) return 'reservation'
  if (MENU_KEYWORDS.some(k => m.includes(k))) return 'menu'
  if (HOURS_KEYWORDS.some(k => m.includes(k))) return 'hours'
  if (LOCATION_KEYWORDS.some(k => m.includes(k))) return 'location'
  return 'unknown'
}

export async function resolveStructured(
  restaurantId: string,
  intent: Intent
): Promise<string | null> {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) return null

  if (intent === 'hours') {
    const hours = restaurant.businessHours as Record<string, string>
    const lines = Object.entries(hours)
      .map(([day, time]) => `${capitalise(day)}: ${time}`)
      .join('\n')
    return `🕐 *Our timings:*\n${lines}`
  }

  if (intent === 'location') {
    let reply = `📍 *Find us here:*\n${restaurant.address ?? 'Address not set yet'}`
    if (restaurant.locationLink) reply += `\n\n🗺️ Google Maps: ${restaurant.locationLink}`
    return reply
  }

  if (intent === 'menu') {
    const items = await prisma.menuItem.findMany({
      where: { restaurantId, available: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
    if (!items.length) return null

    const byCategory = items.reduce<Record<string, typeof items>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    }, {})

    const lines = Object.entries(byCategory).map(([cat, catItems]) => {
      const itemLines = catItems.map(i => `  • ${i.name} — ₹${i.pricePaise / 100}`).join('\n')
      return `*${cat}*\n${itemLines}`
    })

    return `🍽️ *Our Menu:*\n\n${lines.join('\n\n')}`
  }

  return null
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
```

**Checkpoint:** Seed one restaurant + FAQs + menu items manually via Prisma Studio. Send "what's your menu?" and "when are you open?" and get real answers back.

---

## Phase 3 — Reservation Flow & Session Management
**Goal: Multi-turn conversation collects date, time, guest count, confirms, notifies owner.**

### 3.1 Redis Session Manager

```bash
cd apps/api
pnpm add ioredis
```

Create `apps/api/src/services/session.ts`:
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')

const SESSION_TTL = 60 * 30 // 30 minutes

export interface ReservationSession {
  stage: 'ask_date' | 'ask_time' | 'ask_guests' | 'confirm'
  restaurantId: string
  customerPhone: string
  date?: string
  time?: string
  guests?: number
}

export type SessionState = ReservationSession | null

function key(restaurantId: string, phone: string) {
  return `session:${restaurantId}:${phone}`
}

export async function getSession(restaurantId: string, phone: string): Promise<SessionState> {
  const raw = await redis.get(key(restaurantId, phone))
  return raw ? JSON.parse(raw) : null
}

export async function setSession(restaurantId: string, phone: string, state: SessionState) {
  if (state === null) {
    await redis.del(key(restaurantId, phone))
  } else {
    await redis.setex(key(restaurantId, phone), SESSION_TTL, JSON.stringify(state))
  }
}

export async function clearSession(restaurantId: string, phone: string) {
  await redis.del(key(restaurantId, phone))
}
```

### 3.2 Reservation Handler

Create `apps/api/src/services/reservation-handler.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import { getSession, setSession, clearSession, ReservationSession } from './session'
import { sendTextMessage } from '@wabot/whatsapp'

const prisma = new PrismaClient()

/**
 * Stateful handler for reservation conversations.
 * Returns true if the message was handled as part of a reservation flow.
 */
export async function handleReservationFlow(
  restaurant: { id: string; name: string; waPhoneNumberId: string; waAccessToken: string },
  customerPhone: string,
  message: string
): Promise<boolean> {
  const session = await getSession(restaurant.id, customerPhone)

  // Start new reservation flow
  if (!session) return false

  const m = message.trim()

  if (session.stage === 'ask_date') {
    // Basic date validation — accept any reasonable date string for MVP
    if (m.length < 3) {
      await sendReply(restaurant, customerPhone, '📅 Please share the date you\'d like to visit (e.g. "25 Dec" or "tomorrow").')
      return true
    }
    session.date = m
    session.stage = 'ask_time'
    await setSession(restaurant.id, customerPhone, session)
    await sendReply(restaurant, customerPhone, `⏰ What time works for you? (e.g. "7:30 PM")`)
    return true
  }

  if (session.stage === 'ask_time') {
    session.time = m
    session.stage = 'ask_guests'
    await setSession(restaurant.id, customerPhone, session)
    await sendReply(restaurant, customerPhone, `👥 How many guests will be joining?`)
    return true
  }

  if (session.stage === 'ask_guests') {
    const guests = parseInt(m)
    if (isNaN(guests) || guests < 1 || guests > 50) {
      await sendReply(restaurant, customerPhone, `Please reply with a number (e.g. "4").`)
      return true
    }
    session.guests = guests
    session.stage = 'confirm'
    await setSession(restaurant.id, customerPhone, session)

    const summary = `📋 *Reservation Summary*\n📅 Date: ${session.date}\n⏰ Time: ${session.time}\n👥 Guests: ${guests}\n\nReply *YES* to confirm or *NO* to cancel.`
    await sendReply(restaurant, customerPhone, summary)
    return true
  }

  if (session.stage === 'confirm') {
    if (m.toLowerCase() === 'yes' || m.toLowerCase() === 'y') {
      // Upsert customer
      let customer = await prisma.customer.findUnique({
        where: { restaurantId_whatsappNumber: { restaurantId: restaurant.id, whatsappNumber: customerPhone } },
      })
      if (!customer) {
        customer = await prisma.customer.create({
          data: { restaurantId: restaurant.id, whatsappNumber: customerPhone },
        })
      }

      // Create reservation
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
      await sendReply(restaurant, customerPhone,
        `✅ *Reservation confirmed!*\nWe'll see you on ${session.date} at ${session.time}.\nFor any changes, just message us again. 🙏`)

      // Notify owner (send to restaurant's own number — simplest approach for MVP)
      await sendTextMessage({
        to: restaurant.id, // replace with owner's actual number from DB
        body: `🔔 New reservation!\n📅 ${session.date} at ${session.time}\n👥 ${session.guests} guests\n📱 From: ${customerPhone}`,
        phoneNumberId: restaurant.waPhoneNumberId,
        accessToken: restaurant.waAccessToken,
      })

      return true
    }

    if (m.toLowerCase() === 'no' || m.toLowerCase() === 'n') {
      await clearSession(restaurant.id, customerPhone)
      await sendReply(restaurant, customerPhone, `No problem! Let us know if you'd like to book another time. 😊`)
      return true
    }

    await sendReply(restaurant, customerPhone, `Please reply *YES* to confirm or *NO* to cancel.`)
    return true
  }

  return false
}

/** Start a new reservation flow for a customer */
export async function startReservationFlow(
  restaurant: { id: string; waPhoneNumberId: string; waAccessToken: string },
  customerPhone: string
) {
  const session: ReservationSession = {
    stage: 'ask_date',
    restaurantId: restaurant.id,
    customerPhone,
  }
  await setSession(restaurant.id, customerPhone, session)
  await sendReply(restaurant, customerPhone,
    `📅 Sure! Let's book a table.\n\nWhat date would you like to visit?`)
}

async function sendReply(
  restaurant: { waPhoneNumberId: string; waAccessToken: string },
  to: string,
  body: string
) {
  const { sendTextMessage } = await import('@wabot/whatsapp')
  await sendTextMessage({ to, body, phoneNumberId: restaurant.waPhoneNumberId, accessToken: restaurant.waAccessToken })
}
```

**Checkpoint:** Send "I want to book a table" and complete the full multi-turn reservation flow. Check the `reservations` table in Prisma Studio to confirm the record was created.

---

## Phase 4 — AI Fallback Layer
**Goal: Unknown/complex queries get answered by GPT-4o-mini with restaurant context injected.**

### 4.1 AI Package

```bash
mkdir -p packages/ai/src
cd packages/ai
pnpm init
pnpm add openai
```

Create `packages/ai/src/client.ts`:
```typescript
import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const prisma = new PrismaClient()

const AI_CALL_LIMITS: Record<string, number> = {
  STARTER: 50,
  GROWTH: 150,
  PRO: 500,
}

export async function askAI(
  restaurantId: string,
  customerMessage: string
): Promise<string | null> {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) return null

  // Enforce monthly AI call limits per plan
  const limit = AI_CALL_LIMITS[restaurant.plan] ?? 50
  if (restaurant.monthlyAiCalls >= limit) {
    return `I'm not sure about that — please call us or ask our staff directly! 😊`
  }

  // Build minimal context (only what's needed — keep tokens low)
  const menuItems = await prisma.menuItem.findMany({
    where: { restaurantId, available: true },
    select: { category: true, name: true, pricePaise: true, description: true },
    take: 60, // cap at 60 items to control prompt size
  })

  const menuText = menuItems
    .map(i => `${i.category} | ${i.name} | ₹${i.pricePaise / 100}${i.description ? ` | ${i.description}` : ''}`)
    .join('\n')

  const hours = JSON.stringify(restaurant.businessHours)

  const systemPrompt = `You are a friendly WhatsApp assistant for ${restaurant.name}, a restaurant in India.
Answer customer questions based ONLY on the information below.
If you don't know, say "I'm not sure — please call us!" Do NOT make up prices or details.
Keep replies short (under 100 words), warm, and use simple language.
Do not use markdown formatting — plain text only (WhatsApp doesn't render markdown well except *bold*).

RESTAURANT INFO:
Name: ${restaurant.name}
Address: ${restaurant.address ?? 'Not provided'}
Timings: ${hours}

MENU:
${menuText}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 200,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: customerMessage },
    ],
  })

  // Increment usage counter (reset monthly via a cron job)
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { monthlyAiCalls: { increment: 1 } },
  })

  return response.choices[0].message.content ?? null
}
```

**Important:** Add a daily cron job (or Railway cron) to reset `monthlyAiCalls` on the 1st of each month:
```sql
UPDATE restaurants SET monthly_ai_calls = 0, ai_calls_reset_at = NOW()
WHERE ai_calls_reset_at < DATE_TRUNC('month', NOW());
```

### 4.2 Message Log Service

Create `apps/api/src/services/logger.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function logMessage(data: {
  restaurantId: string
  customerPhone: string
  direction: 'inbound' | 'outbound'
  content: string
  resolvedBy?: 'faq' | 'structured' | 'ai' | 'human' | 'session'
}) {
  await prisma.messageLog.create({ data })
}
```

---

## Phase 5 — Message Router (Assembling the Funnel)
**Goal: Wire all layers together in the correct priority order.**

Create `apps/api/src/services/message-router.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import { matchFaq } from './faq-matcher'
import { classifyIntent, resolveStructured } from './structured-resolver'
import { handleReservationFlow, startReservationFlow } from './reservation-handler'
import { askAI } from '@wabot/ai'
import { sendTextMessage } from '@wabot/whatsapp'
import { logMessage } from './logger'

const prisma = new PrismaClient()

export async function routeMessage(phoneNumberId: string, from: string, text: string) {
  // 1. Find restaurant by WhatsApp phone number ID
  const restaurant = await prisma.restaurant.findUnique({
    where: { waPhoneNumberId: phoneNumberId },
  })
  if (!restaurant) return

  // Log inbound
  await logMessage({ restaurantId: restaurant.id, customerPhone: from, direction: 'inbound', content: text })

  // 2. Bot inactive — do nothing
  if (!restaurant.botActive) return

  // 3. Human handoff active — skip the bot entirely
  if (restaurant.humanHandoff) {
    await logMessage({ restaurantId: restaurant.id, customerPhone: from, direction: 'inbound', content: text, resolvedBy: 'human' })
    return
  }

  // Helper to send and log an outbound message
  async function reply(body: string, resolvedBy: string) {
    await sendTextMessage({ to: from, body, phoneNumberId: restaurant.waPhoneNumberId, accessToken: restaurant.waAccessToken })
    await logMessage({ restaurantId: restaurant.id, customerPhone: from, direction: 'outbound', content: body, resolvedBy: resolvedBy as any })
  }

  // 4. Check if this message is part of an ongoing reservation session
  const { getSession } = await import('./session')
  const session = await getSession(restaurant.id, from)
  if (session) {
    const handled = await handleReservationFlow(restaurant, from, text)
    if (handled) return
  }

  // 5. FAQ match (cheapest — check first)
  const faqAnswer = await matchFaq(restaurant.id, text)
  if (faqAnswer) {
    await reply(faqAnswer, 'faq')
    return
  }

  // 6. Rule-based intent + structured data
  const intent = classifyIntent(text)

  if (intent === 'reservation') {
    await startReservationFlow(restaurant, from)
    return
  }

  if (intent !== 'unknown') {
    const structuredAnswer = await resolveStructured(restaurant.id, intent)
    if (structuredAnswer) {
      await reply(structuredAnswer, 'structured')
      return
    }
  }

  // 7. AI fallback (most expensive — last resort)
  const aiAnswer = await askAI(restaurant.id, text)
  if (aiAnswer) {
    await reply(aiAnswer, 'ai')
    return
  }

  // 8. Total fallback
  await reply(
    `Thanks for your message! Our team will get back to you shortly. For urgent queries, please call us directly. 🙏`,
    'fallback'
  )
}
```

Update `apps/api/src/routes/webhook.ts` to call the router:
```typescript
import { routeMessage } from '../services/message-router'

// Replace the placeholder in the POST handler:
app.post('/', async (req, reply) => {
  const msg = extractIncomingMessage(req.body)
  if (msg) {
    // Process asynchronously so Meta webhook gets 200 immediately
    setImmediate(() => routeMessage(msg.phoneNumberId, msg.from, msg.text))
  }
  return reply.status(200).send('OK')
})
```

**Important:** Always return 200 to Meta within 5 seconds or they'll retry. Process messages asynchronously.

**Checkpoint:** Test all paths — FAQ hit, menu query, hours query, reservation flow, unknown query (AI), total fallback.

---

## Phase 6 — Admin Portal (Next.js)
**Goal: Restaurant owner can sign up, fill in details, upload menu, go live in under 10 minutes.**

```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
pnpm add @prisma/client next-auth zod react-hook-form @hookform/resolvers
```

### 6.1 Page Structure

```
apps/web/app/
├── (auth)/
│   ├── login/page.tsx          # Email OTP login (no passwords)
│   └── signup/page.tsx
├── dashboard/
│   ├── page.tsx                # Overview: message count, reservations today
│   ├── menu/page.tsx           # Add/edit/delete menu items
│   ├── faqs/page.tsx           # Add/edit FAQs and keywords
│   ├── settings/page.tsx       # Business hours, location, bot toggle
│   └── reservations/page.tsx   # Upcoming reservations list
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── menu/route.ts           # CRUD for menu items
    ├── faqs/route.ts           # CRUD for FAQs
    └── settings/route.ts       # Update restaurant profile
```

### 6.2 Key Onboarding Flow

The `/dashboard/settings` page must collect in one form:
- Restaurant name
- WhatsApp phone number (display only — set at signup)
- Business hours (a simple table: day × open/close time)
- Address (text)
- Google Maps link (paste box)
- Bot active toggle
- Owner's WhatsApp number (for receiving reservation alerts)

The `/dashboard/menu` page:
- Show existing items in a table (category, name, price, available toggle)
- "Add item" form: category, name, price (₹), description, available
- CSV import button: accept CSV with columns `category,name,price,description`

The `/dashboard/faqs` page:
- Show existing FAQs
- "Add FAQ" form: question (display only), answer, keywords (comma-separated tags)
- Pre-fill with common FAQs on first load:
  - "What are your timings?" → keywords: time, timing, open, close, hours
  - "Where are you located?" → keywords: where, location, address, map, directions
  - "Do you take reservations?" → keywords: book, reserve, table, reservation

### 6.3 Bot Setup Wizard (Onboarding Screen)

Show a 4-step wizard on first login:
1. **Business details** — name, address, hours
2. **Menu** — CSV upload or manual entry (minimum 3 items to proceed)
3. **FAQs** — review pre-filled FAQs, add custom ones
4. **Go live** — show the WhatsApp number customers should message, copy/share button

---

## Phase 7 — Human Handoff
**Goal: Owner can pause the bot and take over any conversation from their phone.**

### 7.1 Handoff Toggle API

Add to `apps/web/app/api/settings/route.ts`:
```typescript
// PATCH /api/settings/handoff
export async function PATCH(req: Request) {
  const { active } = await req.json()
  await prisma.restaurant.update({
    where: { id: restaurantId }, // from session
    data: { humanHandoff: active },
  })
  return Response.json({ ok: true })
}
```

### 7.2 Notify Customer on Handoff

When humanHandoff is toggled ON, send one message to any active customer:
```
Our team member will be with you shortly! 👋
```

When toggled OFF, send:
```
Our WhatsApp assistant is back online. How can we help? 😊
```

---

## Phase 8 — BullMQ Queue (Reliability)
**Goal: Messages never dropped under load. Webhook puts jobs in queue; workers process them.**

```bash
cd apps/api
pnpm add bullmq
```

Create `apps/api/src/queue/message-queue.ts`:
```typescript
import { Queue, Worker } from 'bullmq'
import { routeMessage } from '../services/message-router'

const connection = { host: 'localhost', port: 6379 }

export const messageQueue = new Queue('messages', { connection })

export const messageWorker = new Worker(
  'messages',
  async (job) => {
    const { phoneNumberId, from, text } = job.data
    await routeMessage(phoneNumberId, from, text)
  },
  {
    connection,
    concurrency: 10, // process 10 messages in parallel
  }
)

messageWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})
```

Update webhook route to enqueue instead of calling routeMessage directly:
```typescript
import { messageQueue } from '../queue/message-queue'

// In the POST handler:
await messageQueue.add('process', { phoneNumberId: msg.phoneNumberId, from: msg.from, text: msg.text })
```

---

## Environment Variables

Create `.env.example` at the repo root:
```env
# WhatsApp (Meta Cloud API)
WA_ACCESS_TOKEN=           # from Meta developer dashboard
WEBHOOK_VERIFY_TOKEN=      # any random string you choose

# Database
DATABASE_URL=postgresql://wabot:wabot@localhost:5432/wabot

# Redis
REDIS_URL=redis://localhost:6379

# AI
OPENAI_API_KEY=

# Next.js admin portal
NEXTAUTH_SECRET=           # random string
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Payments (Phase 9)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## Testing Checklist (Manual, per phase)

**Phase 1**
- [ ] Webhook verification passes (Meta sends GET, returns challenge)
- [ ] Send message → receive echo reply on phone

**Phase 2**
- [ ] "What's your menu?" → formatted menu reply
- [ ] "When do you open?" → formatted hours reply
- [ ] "Where are you located?" → address + maps link
- [ ] Unknown keyword → no reply (falls through to later phases)

**Phase 3**
- [ ] "I want to book a table" → starts reservation flow
- [ ] Complete full reservation → record in DB
- [ ] "NO" at confirm → cancels cleanly
- [ ] Session expires after 30 min → starts fresh

**Phase 4**
- [ ] "Do you have gluten-free options?" → AI responds with context
- [ ] AI call count increments in DB
- [ ] Exceeding plan limit → graceful fallback message

**Phase 5**
- [ ] FAQ match wins over AI for known questions
- [ ] Structured resolver wins over AI for intent-matched queries
- [ ] All messages appear in message_logs table with correct resolvedBy

**Phase 6**
- [ ] Sign up → wizard → bot live in under 10 minutes
- [ ] Menu CSV import works
- [ ] FAQ keywords saved correctly

**Phase 7**
- [ ] Toggle humanHandoff ON → bot stops responding
- [ ] Toggle OFF → bot resumes

---

## Deployment (Railway MVP)

1. Push monorepo to GitHub
2. Create Railway project → connect repo
3. Add two services: `apps/api` and `apps/web`
4. Add Railway PostgreSQL and Redis plugins
5. Set all env vars in Railway dashboard
6. Set start commands:
   - API: `npx tsx apps/api/src/index.ts`
   - Web: `cd apps/web && npx next start`
7. Point Meta webhook URL to Railway API URL + `/webhook`
8. Run `npx prisma migrate deploy` as a one-off Railway job

---

## Post-MVP Roadmap (Month 4+)

| Feature | Notes |
|---|---|
| Razorpay subscription billing | Webhook to update `plan` field on payment |
| Broadcast messages | Only business-initiated — Growth/Pro plans only |
| Analytics dashboard | Daily message count, resolution breakdown, top queries |
| FAQ auto-suggest | Flag queries that hit AI >3 times → suggest as FAQ |
| Multi-branch support | Add `branchId` FK to restaurant; owner manages all branches |
| Customer tagging | Auto-tag repeat customers; manual VIP tag |
| WhatsApp message templates | Pre-approved templates for promos |
| SMS fallback | Twilio fallback if WhatsApp delivery fails |

---

## Notes for Claude Code

- Run `docker-compose up -d` before starting any dev work (postgres + redis)
- Use `pnpm` throughout — not npm or yarn
- Prisma client is in `packages/db`; always import from there
- WhatsApp client is in `packages/whatsapp`; always import from there
- Never store AI responses in memory — always log to DB for debugging
- The `price_paise` column stores prices ×100 (integer). Display as `pricePaise / 100`
- WhatsApp messages have a 4096 character limit — keep AI replies under 300 chars
- Meta requires webhook response within 5 seconds — always process async
- Test with real WhatsApp numbers from day 1 — the emulator is unreliable
