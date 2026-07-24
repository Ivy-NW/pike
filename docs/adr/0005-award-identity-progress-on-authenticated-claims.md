# ADR 0005: Award Identity Progress on Authenticated Claims

- Status: Accepted
- Date: 2026-07-22
- Related docs: [PIKE v1 PRD section 12](../PIKE_v1_PRD.md#12-phased-build-plan), [ADR 0002](0002-deliver-phase-1-as-a-connected-core-platform.md)

## Context

Phase 2 adds identity depth: XP, level, streak counter, badges, and authenticated in-app quest scanning. These rewards must be tied to a real PIKE consumer identity rather than to an anonymous scan session, because WebAR scan sessions can be refreshed, retried, or replayed.

Reward claiming is also a failure-sensitive path. A browser refresh, WebView retry, or repeated tap must not award XP multiple times for the same redemption. High-value rewards still require the authenticated app channel, and rejected scans must never award progress.

## Decision

Award XP, streak progress, and badges when a redemption is claimed by an authenticated consumer account. Do not award identity progress at raw marker-recognition time.

The first Phase 2 model is deliberately simple: each first-time successful claim awards 50 XP, levels are calculated in 100 XP bands, streaks advance at most once per UTC day, and badge definitions live in code. The claim path is idempotent: if the same user claims the same redemption again, the API returns the existing claim with `xpAwarded: 0` and no new badges.

Claim binding and gamification awards happen in one Prisma transaction so retry behavior is predictable.

## Failure Scenarios

| Scenario | Expected handling |
|---|---|
| User refreshes the reward screen after a successful claim | Return the existing claim and do not award XP again |
| Two claim requests race for the same redemption | Only one request binds the redemption and awards progress |
| A different user attempts to claim an already claimed redemption | Reject the claim |
| The scan was rejected before claim | Reject the claim and do not award progress |
| A high-value reward is claimed from the guest WebAR channel | Reject and require the app channel |
| Badge creation is retried after a partial client failure | Use unique badge keys per user and skip duplicate badge rows |

## Tradeoffs

- Code-defined badges are simple and reviewable, but changing badge criteria requires a deploy.
- Flat XP is easy for users to understand, but it does not yet model different quest difficulty or reward value.
- UTC streak days are consistent and server-owned, but they may feel slightly off for users far from UTC.
- A transaction protects the first Phase 2 claim path without adding a separate XP ledger yet.

## Consequences

- Clients can safely retry claim requests.
- The reward reveal UI can show `xpAwarded` and new badges from the claim response.
- The app profile and home screens can derive Phase 2 identity progress from `/users/me`.
- A future XP transaction ledger can supersede the current direct user XP counter when auditability becomes more important.

## Revisit Triggers

- Venues need different XP values per quest or reward tier.
- Support needs a full audit trail for every XP adjustment.
- Users need local-time-zone streak behavior.
- Badge criteria need to become configurable by admins or operations.

