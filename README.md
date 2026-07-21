# PIKE — Phase 1 (Core Platform)

WebAR + App + Business Dashboard + Admin, one backend, one Postgres database. See `docs/PIKE_v1_PRD.md` and `docs/pike_ui_design.md` for the source-of-truth requirements and design system this build follows. Architecture decisions are recorded in `docs/adr`.

## Structure

```
pike/
├── packages/shared-types/   entities + API request/response DTOs shared by all 4 surfaces
└── apps/
    ├── api/         NestJS + Prisma (Postgres) + Redis — the shared backend
    ├── webar/        React + Vite — zero-install scan → reward → claim flow
    ├── dashboard/    Next.js — business self-registration + quest creation
    ├── admin/        Next.js — separate login, platform oversight
    └── app/          Expo React Native — consumer app shell (wallet, quests, profile)
```

## Setup

```bash
npm install
npm run build:shared-types
```

Copy `.env.example` → `apps/api/.env` and fill in `DATABASE_URL` (Neon) and `REDIS_URL` at minimum. Firebase, Stripe, and 8th Wall are optional in dev — see the `TODO(credentials)` markers below.

```bash
cd apps/api
npx prisma migrate dev      # applies migrations to your Postgres
npm run seed:admin          # seeds the first admin account from ADMIN_SEED_EMAIL/PASSWORD
```

## Running

```bash
npm run dev:api        # http://localhost:4000
npm run dev:webar       # http://localhost:5173
npm run dev:dashboard   # http://localhost:3001
npm run dev:admin       # http://localhost:3002
npm run dev:app         # Expo — scan the QR with Expo Go, or press a/i/w
```

## What's real vs. stubbed

Everything in `apps/api` is fully wired against a real Postgres (Neon) and Redis instance: auth, redemption-cap enforcement, expiry, the anti-gaming repeat-scan flag, the payment-gated publish flow, and platform oversight were all exercised live during development (register → verify → login → venue → quest → marker → publish-blocked-by-payment → attach payment → publish → resolve marker → redeem → hit cap → claim → wallet dedupe → admin oversight).

Three external integrations don't have credentials in this environment and are stubbed behind `TODO(credentials)` comments, with the real call sites already wired so they're a drop-in once keys exist:

- **Firebase Auth** (`apps/api/src/auth/firebase-admin.service.ts`) — falls back to a dev token format (base64 JSON) that both `apps/webar` and `apps/app` already produce client-side.
- **Stripe** (`apps/api/src/payments/payments.service.ts`) — payment-method attach is a no-op stub until `STRIPE_SECRET_KEY` is set; the `payment_status` gate around quest publishing is real regardless.
- **8th Wall** (`apps/api/src/markers/marker-compile.service.ts`, `apps/webar/src/components/ArScanView.tsx`) — marker "compiling" is simulated server-side; the WebAR scan screen has a real camera preview but recognition is a manual dev button until an 8th Wall app key is wired in.

The Expo app (`apps/app`) was scaffolded and typechecks but wasn't runtime-verified in this session — no simulator/device was available. `apps/webar`, `apps/dashboard`, and `apps/admin` were all driven end-to-end in a real browser.

## Phase boundaries

XP/streaks/badges, authenticated in-app quest scanning, the macro-quest/leaderboard mechanic, and PostHog analytics are Phase 2/3/4 per PRD section 12 — not built. Look for `// TODO(phase-2)` / `// TODO(phase-3)` markers in `apps/app` for where they hook in.
