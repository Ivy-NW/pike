# ADR 0007: Mirror Badges and Rewards as Soulbound Tokens on Avalanche

- Status: Accepted
- Date: 2026-07-31
- Related docs: [PIKE Soulbound Token Layer PRD](../PIKE_token_layer_PRD.md), [PIKE v1 PRD FR-7 and section 13](../PIKE_v1_PRD.md), [PIKE On-Chain Attestation PRD](../PIKE_onchain_attestation_PRD.md), [ADR 0005](0005-award-identity-progress-on-authenticated-claims.md), [ADR 0006](0006-attest-completion-hashes-to-avalanche-c-chain.md)

## Context

Two of PIKE's own documents previously ruled this out: the v1 PRD scoped FR-7 as "reputational only (no monetary value, no shared currency) — this is the v1 answer to portable rewards without fintech complexity," and the on-chain attestation PRD listed "Reward NFTs / badges / VIP-pass tokenization" among its non-goals. Both were correct at the time and for the reason given: a transferable reward token creates a secondary market for venue inventory, invites exactly the farming the redemption-cap system exists to prevent, and pulls a B2B product into consumer fintech and Apple/Google IAP scope (v1 PRD §13).

What changed is the requirement, not the reasoning. PIKE needs deployed contract addresses for gamification mechanics and tokenized incentives. The question this ADR answers is how to satisfy that without giving up the properties those non-goals were protecting.

ADR 0006 made *completions* tamper-evident but did nothing for the identity built on top of them — a user's badges, level, and reward wallet remain rows in a database PIKE alone controls, worth nothing outside the product and provable to nobody who doesn't take PIKE's word for it. Separately, a venue honoring a VIP pass gets no artifact: the entire record is PIKE marking a row as used.

## Decision

Add two contracts in `packages/contracts`, both **ERC-1155 and soulbound** — the transfer path reverts, so mint (from the zero address) and burn (to the zero address) are the only permitted balance changes:

- **`PikeAchievements`** — badges (one token ID per `BADGE_DEFINITIONS` key), level milestones, and macro-quest completions. XP itself is *not* tokenized: it changes on every claim, which is the per-event write pattern ADR 0006 already rejected as unscalable. Only the milestones XP crosses are minted.
- **`PikeRewardVouchers`** — one token ID per quest reward. Minted when a redemption reaches `claimed`, burned when the venue honors it, with the burn transaction hash stored back on the redemption row as a receipt neither party can forge or retract.

Non-transferability is what preserves FR-7: a token that cannot be transferred cannot be sold, traded, or accumulated as a currency. This is reputation with a portable proof attached, not a currency, and it keeps the feature outside store IAP scope.

Users hold tokens via **deterministic custodial addresses** derived from one backend-held HD seed at a path fixed by user ID. No wallet UX, no seed phrases, no signing prompts, no gas — the zero-install funnel is untouched, and the attestation PRD's "the visitor's browser never touches Avalanche" non-goal carries forward intact. This is custodial, and the PRD records that plainly rather than implying self-custody.

The write path reuses the attestation pipeline's shape wholesale — Redis queue, `@nestjs/schedule` batch drain, backoff retry, reconciliation sweep for orphans — because that pattern is already built and tested. On-chain state is a mirror derived from Postgres, written asynchronously, and never read back into the reward, wallet, or cap-enforcement path. Any divergence resolves in Postgres's favor.

Rollout follows ADR 0006's precedent: Fuji testnet first, mainnet only after a soak period and an external review.

## Failure Scenarios

| Scenario | Expected handling |
|---|---|
| Avalanche unreachable when a badge is awarded or a reward claimed | Mint intent stays queued and retries; the badge, wallet entry, and XP are already durable in Postgres, so every user-facing feature works unchanged |
| A mint is submitted twice (retry after an ambiguous failure) | Mint is idempotent per (user, token ID) — the batch service checks on-chain balance and the persisted tx hash before submitting, so a badge can never double-issue (FR-T1) |
| A badge is inserted in the middle of `BADGE_DEFINITIONS` | Token IDs are an explicit additive mapping in code, never derived from array position; a test asserts existing IDs never change under list mutation |
| On-chain balances drift from Postgres (dropped enqueue, silent tx failure) | Reconciliation sweep re-enqueues missing mints and reports divergence as an alerting metric (FR-T10), not a manual periodic check |
| A user deletes their account (PRD §13) | No on-chain write is required or attempted. The Postgres identity is removed and the derived address is orphaned, leaving its soulbound tokens permanently unattributable — consistent with how redemption anonymization already works |
| Custodial seed compromised | Nothing transferable exists to steal; an attacker can only mint or burn non-tradeable records. Same rotation and secrets-management bar as `ATTESTATION_WALLET_PRIVATE_KEY`, with the same standing gap (no secrets manager in the repo yet) |
| XP is corrected downward after a milestone token was minted | Open question in the PRD (section 12) — not resolved here; the current contracts have no revocation path, so a minted milestone is permanent |

## Tradeoffs

- Soulbound (rejected: transferable, and rejected: per-reward transferability flags) gives up gifting and any secondary-market story, and makes the "tokenized incentives" claim weaker to an audience that equates tokens with tradability — accepted because transferability is the single property that would reopen the farming, fintech, and IAP exposure the v1 PRD deliberately avoided. Reverting at the contract level rather than gating by permission means relaxing it later requires a redeploy and a new ADR, not a config change.
- Custodial derived addresses (rejected: user-held wallets, rejected: account abstraction) preserve the phone-number-only funnel that is the product's central advantage, at the cost of users not truly owning their achievements yet. Export to self-custody is scoped as a later phase, and the derivation scheme is chosen so that becomes additive rather than a migration.
- Mirroring Postgres (rejected: chain as source of truth) means eventual consistency and a reconciliation burden, but keeps every user-facing feature working during chain outages and prevents a contract bug from corrupting reward state.
- ERC-1155 (rejected: ERC-721 per badge) allows batched mints across many users and token IDs in one transaction, which is what keeps per-user cost near-zero, at the cost of a less familiar "NFT" framing.
- Not tokenizing XP costs the most legible on-chain gamification signal, and is accepted because per-claim writes would multiply transaction volume by completion volume for no verification benefit.

## Consequences

- Two more contract addresses to deploy, fund, monitor, and track per network, on top of `AttestationRegistry`.
- A new secret class: the custodial HD seed. Whether it shares the attestation service wallet or uses a separate key is an open question in the PRD.
- New reconciliation and coverage metrics (mint coverage, burn coverage, divergence rate) join attestation coverage as standing operational concerns.
- Positioning discipline becomes a real requirement: user-facing copy should say "proof," never "token," and PIKE should not be described as having a token, because it does not.
- Phases A–B (write and deploy contracts) touch no existing runtime path and cannot regress the current build. Phase C (backend wiring) carries real risk and should queue behind the FR-6 push-notification delivery work already in flight.

## Revisit Triggers

- Any proposal to make vouchers transferable — which must reopen the v1 PRD §13 store-policy analysis before anything else.
- Export-to-self-custody moving from "later phase" to committed work, which may require a rebind-and-reissue path since soulbound tokens do not survive an address change.
- Divergence rate between Postgres and on-chain state being anything other than zero.
- Cost-per-mint trending upward independent of batching absorbing fixed costs.
- A regulator, store reviewer, or partner reading the soulbound layer as a currency or security regardless of its non-transferability.
