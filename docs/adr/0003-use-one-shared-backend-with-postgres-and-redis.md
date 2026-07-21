# ADR 0003: Use One Shared Backend With Postgres and Redis

- Status: Accepted
- Date: 2026-07-21
- Related docs: [README](../../README.md), [PIKE v1 PRD sections 9 and 10](../PIKE_v1_PRD.md#9-recommended-tech-stack)

## Context

PIKE has multiple clients but one reward economy. Venue data, quests, markers, redemptions, users, wallet entries, payment status, and admin oversight all need consistent rules. The README states that the API is wired against Postgres and Redis for auth, redemption caps, expiry, repeat-scan flags, payment-gated publishing, and oversight.

Reward eligibility and redemption caps are failure-sensitive. They cannot rely on client state because WebAR pages, dashboards, and app clients can be stale, offline, tampered with, or racing each other.

## Decision

Use one shared NestJS API backed by Postgres as the source of truth, with Redis for fast counters, cap checks, rate limits, and latency-sensitive scan or redemption paths. Shared TypeScript DTOs should define client/API contracts across WebAR, dashboard, admin, and app surfaces.

Server-side rules decide reward eligibility, cap enforcement, expiry, payment-gated publishing, and admin authorization.

## Failure Scenarios

| Scenario | Expected handling |
|---|---|
| Redis is unavailable during a redemption attempt | Fall back to conservative Postgres-backed checks or fail closed for reward issuance |
| Postgres is unavailable | Fail reward-changing actions closed and show retryable errors in clients |
| Redis and Postgres disagree on a cap | Postgres remains authoritative; Redis counters can be rebuilt or expired |
| Two visitors redeem the last available reward at the same time | Use server-side transaction or locking semantics so only one claim succeeds |
| A client sends forged completion or reward state | Ignore client eligibility claims and recompute on the API |

## Tradeoffs

- A shared backend avoids duplicate business logic across four surfaces.
- Postgres gives relational integrity for reward, venue, and account data.
- Redis improves latency but introduces cache consistency and outage handling work.
- A single API can become a bottleneck unless module boundaries stay clean.

## Consequences

- Client apps should stay thin around eligibility, caps, and payment status.
- API tests should cover cap races, expiry, payment gates, and wallet dedupe.
- Redis usage should be documented per flow so fail-open and fail-closed choices are explicit.

## Revisit Triggers

- Redemption traffic exceeds what the current API and database can handle.
- Redis consistency bugs create reward leakage or false denials.
- A future product surface needs a different backend boundary for regulatory, latency, or ownership reasons.

