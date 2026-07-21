# ADR 0002: Deliver Phase 1 as a Connected Core Platform

- Status: Accepted
- Date: 2026-07-21
- Related docs: [README](../../README.md), [PIKE v1 PRD section 12](../PIKE_v1_PRD.md#12-phased-build-plan)

## Context

The PRD revised the original sequence from isolated slices to one connected Phase 1 release. The current project structure already reflects this: WebAR, app shell, business dashboard, admin, shared backend, shared types, Postgres, and Redis all exist as one core platform.

The product reason is that PIKE is only usable by real businesses when a venue can create a quest, publish it, and a visitor can complete and claim it end to end. A WebAR scan without business self-service is not enough, and a dashboard without a working visitor flow is not enough.

## Decision

Phase 1 will deliver WebAR, app shell, business dashboard, admin, and the shared backend as one connected platform. XP, streaks, badges, authenticated in-app scanning, macro-quests, leaderboards, richer analytics, and AI quest copy generation remain deferred to later phases.

## Failure Scenarios

| Scenario | Expected handling |
|---|---|
| A surface ships without the end-to-end quest flow working | Treat it as incomplete for Phase 1, even if the surface is locally functional |
| Scope pressure pulls Phase 2 mechanics into Phase 1 | Defer behind `TODO(phase-2)` or a backlog item unless needed for the end-to-end v1 loop |
| App runtime verification is blocked by device availability | Keep app shell scope narrow and document the verification gap until a simulator or device test is completed |
| Admin or dashboard behavior drifts from API rules | Keep server-side authorization and publish/redeem gates as the source of truth |

## Tradeoffs

- This increases coordination cost because all surfaces must agree on shared types and backend contracts.
- It lowers product risk because the first release proves the actual business loop.
- Deferring XP, streaks, and macro-quests protects the launch from gamification scope creep.

## Consequences

- Phase 1 work should prioritize the venue-create to visitor-redeem loop.
- Shared API contracts matter more than local UI completeness.
- Later product depth must fit the platform contracts established in Phase 1.

## Revisit Triggers

- A pilot customer only needs one surface and cannot wait for the connected release.
- The connected release blocks launch for reasons unrelated to the core quest loop.
- Phase 2 mechanics become required for reward trust or retention, rather than just engagement depth.

