# Architecture Decision Records

This folder records architecture decisions for PIKE. Use ADRs when a choice affects system behavior, failure handling, scaling, data ownership, security, product phase boundaries, or operational tradeoffs.

The current product and design source documents are:

- [PIKE v1 PRD](../PIKE_v1_PRD.md)
- [PIKE UI design documentation](../pike_ui_design.md)

## Rules

- Keep ADRs in `docs/adr`.
- Use filenames like `0001-short-decision-title.md`.
- Use the next sequential number for each new ADR.
- Keep statuses to `Proposed`, `Accepted`, `Deprecated`, or `Superseded`.
- Include failure scenarios and tradeoffs for every meaningful technical decision.
- Write code and documentation without emojis.
- Prefer plain ASCII Markdown unless an existing source requires otherwise.

## Decision Log

| ADR | Status | Date | Decision |
|---|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Accepted | 2026-07-21 | Record architecture decisions in `docs/adr` |
| [0002](0002-deliver-phase-1-as-a-connected-core-platform.md) | Accepted | 2026-07-21 | Deliver Phase 1 as one connected core platform |
| [0003](0003-use-one-shared-backend-with-postgres-and-redis.md) | Accepted | 2026-07-21 | Use one shared backend with Postgres and Redis |
| [0004](0004-use-8th-wall-backed-webar-marker-recognition-for-v1.md) | Accepted | 2026-07-21 | Use 8th Wall backed WebAR marker recognition for v1 |
| [0005](0005-award-identity-progress-on-authenticated-claims.md) | Accepted | 2026-07-22 | Award identity progress on authenticated claims |
| [0006](0006-attest-completion-hashes-to-avalanche-c-chain.md) | Accepted | 2026-07-25 | Attest completion hashes to Avalanche C-Chain |
| [0007](0007-mirror-badges-and-rewards-as-soulbound-tokens.md) | Accepted | 2026-07-31 | Mirror badges and rewards as soulbound tokens on Avalanche |

## Suggested Next ADRs

These are the strongest places to pick up from the existing docs:

- External integration failure modes for Firebase Auth, Stripe, and 8th Wall credentials.
- WebAR fallback behavior when camera permission, marker recognition, or network calls fail.
- Fraud review ownership for flagged completions in v1.
- Account deletion, privacy retention, and store review compliance.
- Marker compilation and print asset generation pipeline.
- PostHog event taxonomy and analytics boundaries for Phase 4.
- Design token enforcement, especially keeping Pike Gold reserved for reward states.
- Typography lock-in: Space Grotesk vs Sora with Inter.
- XP transaction ledger if Phase 2 needs full auditability.
