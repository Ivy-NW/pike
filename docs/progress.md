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

## Current Decisions

- [ADR 0002](adr/0002-deliver-phase-1-as-a-connected-core-platform.md): Phase 1 is one connected core platform.
- [ADR 0004](adr/0004-use-8th-wall-backed-webar-marker-recognition-for-v1.md): WebAR marker recognition remains the proof-of-presence path.
- [ADR 0005](adr/0005-award-identity-progress-on-authenticated-claims.md): XP, streaks, and badges are awarded on authenticated claims, not raw scans.

## Next Work

- Test the authenticated in-app scan on an Android emulator or physical device with camera permissions.
- Confirm Redis connectivity or add a local Redis fallback for development.
- Seed a small known data set for Phase 2 demos: one user, one live quest, one ready marker, one unclaimed redemption.
- Add account deletion before store submission.
- Decide whether Phase 2 needs an XP transaction ledger or whether the direct user XP counter is enough until later.
- Keep Phase 3 macro-quest and leaderboard work out of the current Phase 2 slice unless explicitly reprioritized.

