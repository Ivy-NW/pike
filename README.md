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
    └── app/          Expo React Native → consumer PWA (web export) + native shell
```

## Setup

```bash
npm install
npm run build:shared-types
npm run build:design-tokens
```

Copy `.env.example` → `apps/api/.env` and fill in `DATABASE_URL` (Neon) and `REDIS_URL` at minimum. Firebase, Stripe, and 8th Wall are optional in dev — see the `TODO(credentials)` markers below.

```bash
cd apps/api
npm run prisma:generate    # generates @prisma/client types from prisma/schema.prisma
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

## Consumer distribution: PWA (not App Store / Play Store)

The consumer app ships as an **installable PWA** (`npx expo export -p web` → `apps/app/dist-web`), not a store build. This matches the market: Kenya is ~85–90% Android, and Android Chrome has full PWA support (install prompt, camera via `getUserMedia`, web push). Skipping the stores removes review cycles, $99/yr Apple + Google fees, and store compliance work (camera justification, Data Safety form) for zero product cost — the WebAR funnel is already browser-native, and B2B revenue via Stripe is outside store-IAP scope anyway.

PWA wiring lives in `apps/app`:

- `public/manifest.webmanifest` + `public/sw.js` + icons — installability + offline shell + push/notification handlers.
- `src/lib/pwa.ts` — web-only bootstrap: injects the manifest link (Expo's static `index.html` doesn't), registers the SW, captures `beforeinstallprompt`, and subscribes to web push (VAPID key fetched from `GET /push/vapid-public-key`, subscription JSON registered via `POST /users/me/push-token`).
- `app/scan/[markerId].tsx` — platform branch: native renders the WebAR flow in a WebView; web hands off to `webar` with `?channel=app&appToken=...&returnUrl=...`, and webar's reward screen shows "Back to your wallet" (→ the PWA origin).
- `src/components/PwaInstallBanner.tsx` — install prompt UI on Home when Chrome offers it.

Backend delivery: `NotificationsService` now distinguishes web-push subscriptions (JSON tokens) from Expo/FCM tokens. Web push is live once `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT` are set (`npx web-push generate-vapid-keys --json`); FCM remains a `TODO(credentials)` stub. Run the web build: `npm run dev:app` (Expo web) or serve `apps/app/dist-web`.

## Phase boundaries

Phase 1 is implemented for feature scope. Phase 2 identity depth is now in progress: XP, levels, streaks, badges, and authenticated in-app scanning have a working first slice. The macro-quest/leaderboard mechanic and PostHog analytics remain Phase 3/4 per PRD section 12. See `docs/progress.md` and `docs/adr` for handoff status and decision history.
