# PIKE Progress

Last updated: 2026-07-22

This document is the handoff trail for collaborators. The PRD remains the product source of truth, while ADRs capture architecture decisions.

## Phase 1 Status

Phase 1 is functionally implemented in the current codebase:

| Area | Status | Notes |
|---|---|---|
| Shared backend | Complete | NestJS API with Prisma, Postgres, Redis integration, auth, venues, quests, markers, redemptions, admin, and waitlist |
| WebAR | Complete for dev | Marker resolve, scan page, AR recognition boundary, redemption create, and reward reveal are wired; production device testing still needed |
| App shell | Complete for Phase 1 | Consumer signup/signin, wallet, quest list, profile shell, and scan route exist |
| Business dashboard | Complete for Phase 1 | Self-registration, venue/quest creation, marker creation, payment-gated publish flow |
| Admin | Complete for Phase 1 | Separate login, sales-assisted business creation, verification/suspension, oversight views |
| External services | Stubbed or credential-dependent | Stripe is a no-op without credentials; Redis and Neon require reachable external services |

Phase 1 should be treated as complete for feature scope, with remaining work focused on runtime verification against real devices, network access, seeded data, and production credentials.

## Phase 2 Status

Phase 2 identity depth is in progress and has a working first slice:

| Area | Status | Notes |
|---|---|---|
| XP and levels | Implemented | 50 XP per first-time successful claim; levels use 100 XP bands |
| Streaks | Implemented | Server-owned UTC day streaks; increments at most once per day |
| Badges | Implemented | Fixed badge definitions in `apps/api/src/gamification/badges.ts`; earned rows stored in `user_badges` |
| Profile display | Implemented | App Profile shows XP, streaks, and badge grid |
| Home display | Implemented | App Home shows XP progress, current streak, best streak, and earned badge count |
| Authenticated in-app scan | Implemented for flow | App opens WebAR in a WebView with the app identity token; WebAR auto-claims through the app channel |
| Claim idempotency | Implemented | Repeat claims by the same user return 0 XP instead of double-awarding |

## Phase 3 Status

Phase 3 (macro-quest + leaderboard) has started with the leaderboard slice:

| Area | Status | Notes |
|---|---|---|
| Leaderboard — global | Implemented | `GET /leaderboard/global` ranks users by XP (FR-7). Stands in for the PRD's "city" board until venues carry structured city data — same ranking logic, different WHERE clause |
| Leaderboard — venue | Implemented | `GET /leaderboard/venue/:venueId` ranks users by completion count at a venue; excludes rejected + anonymized (account-deleted) redemptions |
| Leaderboard — app | Implemented | `app/leaderboard.tsx` (global board, caller's row highlighted in Pike Blue — never gold, per UI §2), reached from Profile |
| Macro-quest — backend | Implemented | `GET /users/me/macro-quest` (FR-5). New `MacroQuest`/`MacroQuestVenue`/`MacroQuestCompletion` models; progress is DERIVED from redemptions at participating venues within the window; reaching `requiredVenues` records an idempotent completion (ADR 0005). **Migration `20260725120000_add_macro_quest` is prepared but NOT yet applied to Neon** — run `prisma migrate deploy` (or `migrate dev`) before this endpoint works at runtime |
| Macro-quest — app | Implemented | Home shows a macro-quest tracker (progress bar + per-venue check dots in Pike Blue; reward shown in gold only once unlocked). `seed:phase2` now seeds a live 2-of-3-venue macro-quest |
| Macro-quest — reward | Implemented | The unlocked top-tier reward materializes in the wallet: `/users/me/wallet` now returns a discriminated union of quest and macro-quest rewards (derived from `MacroQuestCompletion`, no separate reward row). Rewards screen renders both, tagging macro rewards |
| Favorited venues (FR-6 foundation) | Implemented | New `FavoriteVenue` model (migration `20260727100000_add_favorite_venue`, **not yet applied**). `PUT/DELETE/GET /users/me/favorites` (idempotent). Map tab has a per-venue heart toggle; Profile shows the favorites list (fills its old `TODO(phase-3)`). `venueId` now exposed on quest-list items. Groundwork for FR-6 push — the FCM triggers/delivery remain to build once Firebase creds exist |

Ranking + progress + wallet-union + favorites logic unit-tested. Full apps/api suite: 38 passing.

## Current Decisions

- [ADR 0002](adr/0002-deliver-phase-1-as-a-connected-core-platform.md): Phase 1 is one connected core platform.
- [ADR 0004](adr/0004-use-8th-wall-backed-webar-marker-recognition-for-v1.md): WebAR marker recognition remains the proof-of-presence path.
- [ADR 0005](adr/0005-award-identity-progress-on-authenticated-claims.md): XP, streaks, and badges are awarded on authenticated claims, not raw scans.

## Next Work

- Test the authenticated in-app scan on an Android emulator or physical device with camera permissions.
- Confirm Redis connectivity or add a local Redis fallback for development.
- Seed a small known data set for Phase 2 demos: one user, one live quest, one ready marker, one unclaimed redemption.
- ~~Add account deletion before store submission.~~ Done (2026-07-25) — `DELETE /users/me` (ConsumerAuthGuard, 204) deletes the user (XP/streak inline, badges via cascade) and **anonymizes** their redemptions (nulls `userId`) so the FR-13 audit trail and on-chain attestation hashes survive de-identified. Wired to the Profile "Delete my account" button behind a destructive confirm. Unit-tested (`users.service.spec.ts`). Web-fallback deletion path (PRD §13, Google-acceptable) still outstanding.
- Decide whether Phase 2 needs an XP transaction ledger or whether the direct user XP counter is enough until later.
- Phase 3 done (leaderboard + macro-quest + macro-quest reward materialization, 2026-07-25). Remaining Phase 3 polish: a city-scoped leaderboard once venues carry structured city data.
- FR-6 started (favorited venues foundation, 2026-07-27). Remaining FR-6: FCM device-token registration + the streak-expiry and new-quest-at-favorited-venue triggers/delivery (needs a Firebase project + creds; can follow the existing Stripe/8th-Wall credential-stub pattern).
- **Two migrations are prepared but NOT yet applied to Neon** — `20260725120000_add_macro_quest` and `20260727100000_add_favorite_venue`. Run `npm run prisma:deploy --workspace apps/api` (or a Render deploy) before these endpoints work at runtime.
- `prisma generate` now runs on `postinstall` and as part of `build` (apps/api) to prevent the stale-client drift that broke compilation earlier. No git hook (no husky in repo) — run `npm install` or `prisma generate` after pulling a schema change if deps don't reinstall.

