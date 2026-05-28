# WhatsApp AI Assistant for Restaurants
# Codebase Reference for Claude Code

## Project Overview

A multi-tenant SaaS product that gives restaurants a WhatsApp-based AI front desk.
Each restaurant gets an automated bot that handles menu queries, business info,
table reservations, food orders, and escalates to human staff when needed.

**Tech Stack**
- Runtime: Node.js 20+ (TypeScript)
- Framework: Fastify (API) + Next.js 16 App Router (web)
- Database: PostgreSQL 15 via Prisma ORM v5
- Cache / Sessions: Redis (ioredis) — Docker locally, Upstash in prod
- Queue: BullMQ (backed by Redis) — 3 retries, exponential backoff, concurrency 10
- WhatsApp: Meta Cloud API (free tier, no BSP)
- AI: OpenAI GPT-4o-mini with per-plan monthly call limits
- Payments: Razorpay (subscriptions) + UPI/UTR advance for reservations
- Auth: NextAuth v5 (beta) with email + bcrypt password
- Deployment: Railway (MVP)

---

## Repository Structure

```
ai-bot/
├── apps/
│   ├── api/                        # Fastify backend (port 3001)
│   │   └── src/
│   │       ├── index.ts            # Server entrypoint, registers routes + queue worker
│   │       ├── routes/
│   │       │   ├── webhook.ts      # Meta WhatsApp webhook (GET verify + POST receive)
│   │       │   └── pay.ts          # GET /pay — UPI QR payment page (HTML)
│   │       ├── services/
│   │       │   ├── message-router.ts     # Main routing funnel (10-step priority chain)
│   │       │   ├── session.ts            # Redis session manager (reservation + order)
│   │       │   ├── reservation-handler.ts # Multi-turn reservation flow incl. UTR payment
│   │       │   ├── order-handler.ts      # Multi-turn food ordering flow with cart
│   │       │   ├── faq-matcher.ts        # Keyword-scored FAQ lookup
│   │       │   ├── structured-resolver.ts # Intent classifier + hours/location/menu resolver
│   │       │   ├── logger.ts             # Message log writer
│   │       │   └── wa-send.ts            # Fault-tolerant send helpers with fallbacks
│   │       └── queue/
│   │           └── message-queue.ts      # BullMQ queue + worker factory
│   └── web/                        # Next.js admin portal (port 3000)
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── signup/page.tsx
│       │   ├── setup/              # 4-step onboarding wizard (shown before dashboard)
│       │   ├── dashboard/
│       │   │   ├── layout.tsx      # Sidebar + TopHeader wrapper
│       │   │   ├── page.tsx        # Overview: stats, recent orders, chart, top items
│       │   │   ├── inbox/          # Conversation viewer (per-customer message thread)
│       │   │   ├── orders/         # Orders management
│       │   │   ├── reservations/   # Reservations + UTR verify/confirm
│       │   │   ├── analytics/      # 7-day chart + resolution breakdown
│       │   │   ├── menu/           # Menu item CRUD
│       │   │   ├── faqs/           # FAQ CRUD with keyword tags
│       │   │   ├── billing/        # Razorpay subscription + plan cards
│       │   │   └── settings/       # Business info, hours, bot toggle, UTR, WA token
│       │   └── api/
│       │       ├── auth/           # NextAuth routes + register
│       │       ├── billing/        # GET info, POST subscribe, verify, cancel, webhook
│       │       ├── faqs/           # CRUD
│       │       ├── inbox/          # Per-customer message thread
│       │       ├── menu/           # CRUD
│       │       ├── orders/         # List + status update
│       │       ├── reservations/   # List + PATCH status/UTR verify
│       │       ├── settings/       # PATCH profile, PATCH handoff
│       │       └── setup/complete/ # Marks setupComplete = true
│       ├── components/
│       │   ├── Sidebar.tsx         # SVG-icon nav, restaurant logo, sign out
│       │   └── TopHeader.tsx       # Page title, date, bot status pill, bell, avatar
│       └── auth.ts                 # NextAuth config
├── packages/
│   ├── db/
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Canonical schema — always edit here
│   │   │   ├── migrations/         # Never edit manually
│   │   │   └── seed.ts
│   │   └── src/index.ts            # Re-exports PrismaClient singleton
│   ├── whatsapp/src/
│   │   ├── client.ts               # sendTextMessage, sendButtonMessage,
│   │   │                           # sendListMessage, sendCtaUrlMessage,
│   │   │                           # extractIncomingMessage
│   │   └── index.ts
│   └── ai/src/
│       ├── client.ts               # askAI() with plan limits + context injection
│       └── index.ts
├── docker-compose.yml              # postgres:15 (→5434) + redis:7
└── .env.example
```

---

## Database Schema (current)

```prisma
model Restaurant {
  id                     String    @id @default(cuid())
  name                   String
  whatsappNumber         String    @unique   // owner's WA number — reservation alerts go here
  waPhoneNumberId        String    @unique   // Meta phone number ID
  waAccessToken          String              // Meta access token — update via Settings page
  adminEmail             String?   @unique
  adminPassword          String?             // bcrypt hashed
  setupComplete          Boolean   @default(false)
  address                String?
  locationLink           String?
  businessHours          Json                // { mon: "9am-10pm", ... }
  plan                   Plan      @default(STARTER)
  botActive              Boolean   @default(true)
  humanHandoff           Boolean   @default(false)
  utrEnabled             Boolean   @default(false)   // require UPI advance for reservations
  utrUpiId               String?              // restaurant's UPI VPA
  utrAdvancePaise        Int       @default(0)
  monthlyAiCalls         Int       @default(0)
  aiCallsResetAt         DateTime  @default(now())
  razorpayCustomerId     String?
  razorpaySubscriptionId String?
  subscriptionStatus     String?   // created|authenticated|active|pending|halted|cancelled|completed|expired
  planRenewsAt           DateTime?
  createdAt              DateTime  @default(now())
}

model Customer { ... }   // restaurantId + whatsappNumber unique; visitCount, lastSeen
model MenuItem { ...  }  // pricePaise (integer, ×100); available toggle; orderItems relation
model Faq      { ...  }  // keywords String[]; priority Int
model Reservation { ... } // date String, timeSlot String, utrNumber, utrVerified
model Session  { ...  }  // JSON state in Redis — this model is legacy; sessions are in Redis
model MessageLog { ... } // direction inbound|outbound; resolvedBy faq|structured|ai|session|human|fallback
model Order    { ...  }  // totalPaise; status PENDING|CONFIRMED|PREPARING|READY|CANCELLED
model OrderItem { ... }  // orderId + menuItemId + quantity

enum Plan              { STARTER  GROWTH  PRO }
enum ReservationStatus { PENDING  CONFIRMED  CANCELLED }
enum OrderStatus       { PENDING  CONFIRMED  PREPARING  READY  CANCELLED }
```

**Migration commands (always run from `packages/db`):**
```bash
pnpm prisma migrate dev --name <descriptive_name>
pnpm prisma generate        # must stop API + web servers first on Windows (DLL lock)
pnpm prisma studio
```

**Windows DLL lock fix** — if `prisma generate` fails with EPERM:
```powershell
# Find + kill the locking processes
$dll = "...\node_modules\.pnpm\@prisma+client@5.22.0_prisma@5.22.0\node_modules\.prisma\client\query_engine-windows.dll.node"
Get-Process | Where-Object { try { $_.Modules.FileName -contains $dll } catch { $false } } | Stop-Process -Force
# Then regenerate
cd packages/db && pnpm prisma generate
```

---

## Message Routing Funnel

Every inbound WhatsApp message passes through `apps/api/src/services/message-router.ts`
in this exact priority order:

```
1.  Bot inactive OR human handoff ON  →  silent drop (log only)
2.  Global cancel keywords            →  clear session, show main menu
3.  browse_ITEMID payload             →  show item detail + Order This button
4.  Active session (order type)       →  handleOrderFlow()
4.  Active session (reservation type) →  handleReservationFlow()
5.  Greeting                          →  3-button interactive welcome card
6.  Intent: reservation               →  startReservationFlow()
6.  Intent: order                     →  startOrderFlow()
7.  FAQ keyword match                 →  return FAQ answer
8.  Intent: menu                      →  WhatsApp list message (falls back to text)
8.  Intent: hours/location            →  structured data reply
9.  AI fallback (GPT-4o-mini)         →  askAI() with restaurant context
10. Total fallback                    →  "Our team will get back to you" text
```

**Session types in Redis** (`session:{restaurantId}:{phone}`, TTL 30 min):
- `ReservationSession` — stages: `ask_date → ask_time → ask_guests → confirm → ask_utr`
- `OrderSession` — stages: `selecting → confirm`; holds `cart: CartItem[]`

---

## WhatsApp Message Types

All send helpers live in `apps/api/src/services/wa-send.ts` with automatic fallbacks:

| Helper | Falls back to |
|--------|--------------|
| `safeText()` | — (plain text, always works) |
| `safeButtons()` | numbered plain-text options |
| `safeCtaUrl()` | plain text + URL appended |
| `safeList()` | plain text fallback |

Raw senders in `packages/whatsapp/src/client.ts`:
`sendTextMessage`, `sendButtonMessage`, `sendListMessage`, `sendCtaUrlMessage`

**Important:** Interactive messages (buttons, lists, CTA URLs) require a real Meta
Cloud API token with messaging permissions. They silently fail in the sandbox.

---

## UPI / UTR Advance Payment Flow

When `restaurant.utrEnabled = true` and a reservation is confirmed:

1. Bot sends a CTA URL button → `GET /pay?pa=UPI_ID&am=AMOUNT&pn=NAME&tn=NOTE`
2. `/pay` returns an HTML page with a QR code + manual UPI ID copy button
3. Customer pays, replies with their UTR/transaction number
4. Bot records `utrNumber` on the reservation, notifies owner
5. Owner opens **Reservations** dashboard → clicks "Verify & Confirm"
6. Customer receives confirmation WhatsApp message

**Configure in Settings:** toggle "Require advance payment", enter UPI ID + amount.

---

## Razorpay Subscription Billing

**Plans:** STARTER (free) · GROWTH ₹999/mo · PRO ₹2,499/mo

**AI call limits:** STARTER 50 · GROWTH 150 · PRO 500 per month

**Setup (one-time):**
1. Create two plans in Razorpay Dashboard → Subscriptions → Plans
2. Set env vars: `RAZORPAY_PLAN_GROWTH`, `RAZORPAY_PLAN_PRO`, `RAZORPAY_WEBHOOK_SECRET`
3. Register webhook in Razorpay Dashboard → `POST /api/billing/webhook`
   - Events: all `subscription.*`

**Flow:**
```
POST /api/billing          →  creates Razorpay subscription, returns sub ID + key
Client: Razorpay.open()    →  checkout modal with subscription_id
POST /api/billing/verify   →  HMAC verify signature, activate plan immediately
POST /api/billing/webhook  →  lifecycle: charged→extend, cancelled/halted→downgrade STARTER
POST /api/billing/cancel   →  cancel_at_cycle_end via Razorpay API
```

All billing DB writes use `$executeRaw` / `$queryRaw` (safe against stale Prisma client).

---

## Admin Portal Pages

| Route | Purpose |
|-------|---------|
| `/` | Redirects to login |
| `/login` | Email + password login |
| `/signup` | Register restaurant + credentials |
| `/setup` | 4-step wizard (Business → Menu → FAQs → Go Live). Shown once until `setupComplete = true` |
| `/dashboard` | Overview: 4 stat cards, Recent Orders table, 7-day message chart, Top Items |
| `/dashboard/inbox` | Per-customer conversation threads |
| `/dashboard/orders` | Orders table with status management |
| `/dashboard/reservations` | Reservations with Confirm / Cancel / Verify UTR actions |
| `/dashboard/analytics` | 7-day message bar chart + resolution breakdown (FAQ/AI/Session/Human %) |
| `/dashboard/menu` | Menu item CRUD |
| `/dashboard/faqs` | FAQ CRUD with keyword tags |
| `/dashboard/billing` | Plan cards + Razorpay checkout + AI usage bar |
| `/dashboard/settings` | Business details, hours, bot/handoff toggles, UTR config, WA token update |

**Layout:** `Sidebar` (SVG icons, restaurant logo, avatar) + `TopHeader` (page title, date,
bot status pill, bell, restaurant avatar). Both are server-rendered via `dashboard/layout.tsx`.

---

## Environment Variables

```env
# WhatsApp (Meta Cloud API)
WA_ACCESS_TOKEN=           # Stored in DB per restaurant — update via Settings page
WEBHOOK_VERIFY_TOKEN=      # Any string; must match Meta webhook config

# Database (note: Docker maps to port 5434 locally)
DATABASE_URL=postgresql://wabot:wabot@localhost:5434/wabot

# Redis
REDIS_URL=redis://localhost:6379

# AI
OPENAI_API_KEY=

# Next.js
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
API_PUBLIC_URL=https://your-public-api-url  # Used for CTA button URLs (needs HTTPS)

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
RAZORPAY_PLAN_GROWTH=plan_xxx
RAZORPAY_PLAN_PRO=plan_xxx
```

**waAccessToken is stored in the DB**, not read from env at runtime.
To update it: Settings → WhatsApp Credentials → paste new token → Save.
Meta temporary tokens expire every 24 h. Use a System User token for production.

---

## Local Dev Setup

```bash
# 1. Start DB + Redis (postgres maps to 5434 locally)
docker-compose up -d

# 2. Run migrations
cd packages/db && pnpm prisma migrate deploy

# 3. Start API (terminal 1)
pnpm --filter @wabot/api dev      # http://localhost:3001

# 4. Start web (terminal 2)
pnpm --filter @wabot/web dev      # http://localhost:3000

# 5. Expose API publicly for Meta webhook (use devtunnel or ngrok)
# Then set in Meta Developer Console: https://YOUR_TUNNEL/webhook
```

---

## Deployment (Railway)

1. Push monorepo to GitHub; connect to Railway project
2. Create two services: `apps/api` and `apps/web`
3. Add Railway PostgreSQL plugin (update `DATABASE_URL`) + Redis plugin
4. Set all env vars in Railway dashboard
5. Start commands:
   - API: `tsx apps/api/src/index.ts`
   - Web: `cd apps/web && next start`
6. One-off job: `cd packages/db && prisma migrate deploy`
7. Point Meta webhook to Railway API URL + `/webhook`
8. Register Razorpay webhook to Railway Web URL + `/api/billing/webhook`

---

## Implementation Status

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Infrastructure + WhatsApp plumbing | ✅ Done |
| 2 | DB schema + FAQ engine | ✅ Done |
| 3 | Reservation flow + session management | ✅ Done |
| 4 | AI fallback (GPT-4o-mini) | ✅ Done |
| 5 | Message router | ✅ Done |
| 6 | Admin portal | ✅ Done |
| 7 | Human handoff | ✅ Done |
| 8 | BullMQ queue | ✅ Done |
| — | Food ordering flow (WhatsApp cart) | ✅ Done (beyond original plan) |
| — | Orders dashboard | ✅ Done |
| — | Analytics dashboard | ✅ Done |
| — | Inbox / conversation viewer | ✅ Done |
| — | Interactive WA messages (buttons, lists, CTA) | ✅ Done |
| — | UPI/UTR advance payment for reservations | ✅ Done |
| — | Razorpay subscription billing | ✅ Done |
| — | Dashboard UI redesign (mockup-matched) | ✅ Done |
| — | Broadcast messages | ⬜ Not started |
| — | FAQ auto-suggest | ⬜ Not started |
| — | Multi-branch support | ⬜ Not started |
| — | Customer tagging UI | ⬜ Not started (schema has `label` field) |
| — | WhatsApp message templates | ⬜ Not started |
| — | Monthly AI call reset cron | ⬜ Not started (needs Railway cron) |
| — | Menu CSV import | ⬜ Not started |

---

## Notes for Claude Code

- **Always use `pnpm`** — never npm or yarn
- **Prisma client** lives in `packages/db` — import via `@wabot/db`
- **WhatsApp client** lives in `packages/whatsapp` — import via `@wabot/whatsapp`
- **pricePaise** stores prices ×100 (integer). Always display as `pricePaise / 100`
- **WhatsApp message limit** is 4096 chars — keep AI replies under 300 chars
- **Meta webhook** must get 200 within 5 s — always enqueue via BullMQ, never process inline
- **waAccessToken** comes from `restaurant.waAccessToken` (DB), not `process.env.WA_ACCESS_TOKEN`
- **Prisma generate on Windows** fails if API or web dev server is running (DLL lock).
  Kill node processes first: `Stop-Process -Name node -Force`, then regenerate.
- **New billing columns** (`subscriptionStatus`, `planRenewsAt`, `razorpaySubscriptionId`)
  use `$queryRaw`/`$executeRaw` in billing routes to survive a stale Prisma client.
  This is intentional — do not refactor unless Prisma client has been regenerated.
- **Docker postgres** is mapped to port **5434** (not 5432) locally.
- **Interactive WA messages** (buttons, lists) fall back to plain text automatically via
  `safeButtons()` / `safeList()` in `wa-send.ts` — always use these, never raw senders.
- **Session type discrimination**: check `session.type === 'reservation'` or `'order'`
  before casting — both live under the same Redis key pattern.
- **Do not log AI responses in memory** — all messages must go through `logMessage()` to DB.
