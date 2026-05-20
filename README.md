# WaBot — WhatsApp AI Assistant for Restaurants

A multi-tenant SaaS platform that gives restaurants a WhatsApp-based AI front desk.
Customers message your WhatsApp number and get instant answers about the menu, hours,
location, and reservations — powered by a rule-based engine + GPT-4o-mini fallback.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ / TypeScript |
| API server | Fastify 4 |
| Admin portal | Next.js 16 (App Router) |
| Database | PostgreSQL 15 via Prisma ORM |
| Sessions | Redis (ioredis) |
| Queue | BullMQ (backed by Redis) |
| AI | OpenAI GPT-4o-mini |
| WhatsApp | Meta Cloud API (free) |
| Monorepo | pnpm workspaces |

---

## Repository Structure

```
├── apps/
│   ├── api/                    # Fastify backend — webhook + message routing
│   │   └── src/
│   │       ├── queue/          # BullMQ queue + worker
│   │       ├── routes/         # Webhook route
│   │       └── services/       # message-router, faq-matcher, reservation-handler, etc.
│   └── web/                    # Next.js admin portal
│       └── app/
│           ├── dashboard/      # Overview, menu, FAQs, settings, reservations
│           └── api/            # REST API routes for the portal
├── packages/
│   ├── db/                     # Prisma schema, migrations, seed
│   ├── whatsapp/               # Meta Cloud API client
│   └── ai/                     # OpenAI GPT-4o-mini wrapper
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Prerequisites

- Node.js 20+
- pnpm 8+ — `npm install -g pnpm`
- Docker Desktop (for PostgreSQL)
- A Meta developer account with a WhatsApp Business app
- An OpenAI account (for AI fallback)

---

## 1. Clone & Install

```bash
git clone https://github.com/SandeepKhede/ai-bot.git
cd ai-bot
pnpm install
```

---

## 2. Environment Variables

### Root `.env` (used by the API server)

Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `WA_ACCESS_TOKEN` | Meta WhatsApp temporary access token (regenerate every 24h in Meta dashboard) | `EAALpq...` |
| `WEBHOOK_VERIFY_TOKEN` | Any secret string — must match what you set in the Meta webhook config | `my-secret-token` |
| `PHONE_NUMBER_ID` | Your WhatsApp phone number ID from Meta dashboard | `1096739166862421` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://wabot:wabot@localhost:5434/wabot` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `OPENAI_API_KEY` | OpenAI API key for AI fallback | `sk-...` |

> **Note:** The database port is `5434` (not `5432`) to avoid conflicts with other local PostgreSQL instances.

### `apps/web/.env.local` (used by the admin portal)

Create this file manually:

```bash
cat > apps/web/.env.local << EOF
DATABASE_URL=postgresql://wabot:wabot@localhost:5434/wabot
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEXTAUTH_URL=http://localhost:3000
EOF
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Same PostgreSQL URL as the root `.env` |
| `NEXTAUTH_SECRET` | Random 32-byte hex string — run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXTAUTH_URL` | Base URL of the admin portal |

---

## 3. Start Services

### Step 1 — Start PostgreSQL

```bash
docker-compose up -d
```

This starts a PostgreSQL container on port `5434`.

> **Already have Redis running locally?** The project reuses your existing Redis on port `6379`. If not, run:
> ```bash
> docker run -d -p 6379:6379 redis:7-alpine
> ```

### Step 2 — Run Database Migration

```bash
cd packages/db
DATABASE_URL="postgresql://wabot:wabot@localhost:5434/wabot" npx prisma migrate deploy
cd ../..
```

### Step 3 — Seed a Test Restaurant

```bash
cd packages/db
PHONE_NUMBER_ID=<your-phone-number-id> DATABASE_URL="postgresql://wabot:wabot@localhost:5434/wabot" npx tsx prisma/seed.ts
cd ../..
```

This creates **Spice Garden** restaurant with sample menu items, FAQs, and business hours.

### Step 4 — Create Admin Account

Set an admin email and password for the restaurant:

```bash
# Generate a bcrypt hash for your chosen password
HASH=$(node -e "const b=require('./node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs/index.js'); console.log(b.hashSync('your-password', 10));")

# Write credentials to the DB
docker exec <postgres-container-name> psql -U wabot -d wabot -c \
  "UPDATE \"Restaurant\" SET \"adminEmail\" = 'admin@yourrestaurant.com', \"adminPassword\" = '${HASH}', \"setupComplete\" = true WHERE \"waPhoneNumberId\" = '<your-phone-number-id>';"
```

> Find your container name with: `docker ps | grep postgres`

### Step 5 — Start the API Server

```bash
cd apps/api
pnpm run dev
```

API runs on **http://localhost:3001**

### Step 6 — Start the Admin Portal

```bash
cd apps/web
pnpm run dev
```

Portal runs on **http://localhost:3000**

Login at `http://localhost:3000/login` with the credentials you set in Step 4.

### Step 7 — Expose the Webhook (Local Dev)

Meta needs a public HTTPS URL to send webhook events. Use **Dev Tunnels** or **ngrok**:

**Dev Tunnels (Windows):**
```bash
devtunnel create wabot-webhook
devtunnel port create wabot-webhook -p 3001
devtunnel host wabot-webhook
```

**ngrok:**
```bash
ngrok http 3001
```

Copy the public URL and configure Meta:
- **Webhook URL:** `https://<your-tunnel-url>/webhook`
- **Verify token:** value of `WEBHOOK_VERIFY_TOKEN` in your `.env`
- **Subscribe to:** `messages` field

---

## 4. Refreshing the WhatsApp Access Token

Meta temporary tokens expire every **24 hours**. When you see `401 Unauthorized` errors:

1. Go to [developers.facebook.com](https://developers.facebook.com) → your app → **WhatsApp → API Setup**
2. Click the refresh icon next to the access token
3. Copy the new token and update `.env`:
   ```
   WA_ACCESS_TOKEN=<new-token>
   ```
4. Sync the new token to the database:
   ```bash
   TOKEN=$(grep "^WA_ACCESS_TOKEN=" .env | cut -d'=' -f2-)
   docker exec <postgres-container> psql -U wabot -d wabot -c \
     "UPDATE \"Restaurant\" SET \"waAccessToken\" = '${TOKEN}' WHERE \"waPhoneNumberId\" = '<your-phone-number-id>';"
   ```
5. Restart the API server

---

## 5. All Services at a Glance

| Service | Command | Port | Notes |
|---|---|---|---|
| PostgreSQL | `docker-compose up -d` | 5434 | Start once, persists data |
| Redis | already running or `docker run -d -p 6379:6379 redis:7-alpine` | 6379 | Start once |
| API server | `cd apps/api && pnpm run dev` | 3001 | Auto-restarts on file changes |
| Admin portal | `cd apps/web && npm run dev` | 3000 | Auto-restarts on file changes |
| Dev tunnel | `devtunnel host wabot-webhook` | — | Exposes port 3001 publicly |

---

## 6. Message Flow

```
Customer sends WhatsApp message
            ↓
  Meta webhook → POST /webhook
            ↓
   messageQueue.add() → 200 OK   ← returns instantly to Meta
            ↓
   BullMQ worker picks up job
   (concurrency: 10, 3 retries)
            ↓
       routeMessage()
            ↓
  0. Human handoff ON?            →  bot silent, owner replies manually
  1. Active reservation session?  →  continue multi-turn booking flow
  2. Reservation intent?          →  start booking flow (date → time → guests → confirm)
  3. FAQ keyword match?           →  instant answer from DB (no AI cost)
  4. Structured intent?           →  menu / hours / location from DB
  5. AI fallback (GPT-4o-mini)?   →  context-aware answer with restaurant data
  6. Total fallback               →  "Our team will get back to you"
```

---

## 7. Admin Dashboard Pages

| Page | URL | Purpose |
|---|---|---|
| Overview | `/dashboard` | Message stats, reservations today, recent activity |
| Menu | `/dashboard/menu` | Add / toggle availability / delete items, CSV import |
| FAQs | `/dashboard/faqs` | Keyword-triggered instant answers (no AI cost) |
| Settings | `/dashboard/settings` | Hours, address, Google Maps link, bot toggle, human handoff (notifies active customers instantly) |
| Reservations | `/dashboard/reservations` | View all bookings with status |

---

## 8. Human Handoff

The owner can pause the bot at any time from the **Settings → Human Handoff** toggle:

- **Toggle ON** — bot goes silent immediately; customers active in the last 30 minutes receive *"Our team member will be with you shortly! 👋"*
- **Toggle OFF** — bot resumes; same recent customers receive *"Our WhatsApp assistant is back online. How can we help? 😊"*

The toggle fires instantly (no Save button needed) and shows a confirmation: `Handoff ON — 2 customers notified`.

---

## 9. Phases Completed

| Phase | Description |
|---|---|
| 1 | WhatsApp webhook plumbing |
| 2 | Database schema + FAQ engine |
| 3 | Reservation flow + Redis sessions |
| 4 | AI fallback (GPT-4o-mini) with token optimisation |
| 5 | Full message router (session → FAQ → structured → AI → fallback) |
| 6 | Admin portal (Next.js) — menu, FAQs, settings, reservations |
| 7 | Human handoff — bot pause with automatic customer notifications |
| 8 | BullMQ message queue — reliable processing with retries and concurrency control |

**Coming next:** Payments / subscriptions (Phase 9 — Razorpay)
