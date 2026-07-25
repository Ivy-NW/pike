# ADR 0006: Attest Completion Hashes to Avalanche C-Chain

- Status: Accepted
- Date: 2026-07-25
- Related docs: [PIKE On-Chain Attestation PRD](../PIKE_onchain_attestation_PRD.md), [PIKE v1 PRD section 8.5 and FR-13](../PIKE_v1_PRD.md), [ADR 0003](0003-use-one-shared-backend-with-postgres-and-redis.md)

## Context

Section 8.5 of the parent PRD treats camera-based marker recognition as the core fraud barrier for quest completions, but the *record* of a completion — a `Redemption` row in Postgres — can still be altered after the fact by a bug, an insider, or a compromised admin account, with no independent way to detect it. The parent PRD leaves "who owns fraud review for flagged completions" as an open question (section 14). The on-chain attestation PRD scopes a narrow addition: hash every completion event, batch those hashes into a Merkle tree, and write only the batch root to a public chain, so a fraud reviewer has something to check the database against that PIKE itself can't quietly rewrite.

This is additive to, not a revision of, ADR 0003: Postgres remains the source of truth for redemption logic, caps, and expiry. This ADR only concerns the new verification layer bolted on top, and the new class of dependency and risk it introduces — a public blockchain, a backend-held private key as a new secret class, gas as a recurring operating cost, and a new external-outage failure mode — none of which ADR 0003 covers.

## Decision

Add an asynchronous, batched attestation pipeline in the existing NestJS API: every `Redemption` row (including rejected/flagged ones, not just claimed) gets a keccak256 hash of its non-PII fields (marker/venue/quest ID, session signal, timestamp) computed synchronously at creation time. A Redis-backed queue triggers a scheduled batch job (`@nestjs/schedule`, not a job-queue library — this is a periodic drain, not per-job retry logic) that builds a Merkle tree from queued hashes and submits the root to a minimal `AttestationRegistry` smart contract on Avalanche, deployed to Fuji testnet for the initial rollout and promoted to C-Chain mainnet only after a soak period. Each redemption's Merkle proof is stored back in Postgres so any single completion can be verified independently. The batch window/threshold is admin-editable at runtime via a database-backed config row, not env vars, so it can change without a deploy. A guarded admin endpoint (`GET /admin/attestations/:redemptionId/verify`) lets a fraud reviewer check a completion's stored hash, proof, and the live on-chain root in one call.

The wallet that submits batch roots is backend-held only, funded and monitored like any other operating cost, and never exposed to any client, dashboard user, or venue owner.

## Failure Scenarios

| Scenario | Expected handling |
|---|---|
| Avalanche RPC is unreachable during a batch submit | Batch marked `failed`, retried on a backoff schedule; visitor-facing reward flow is entirely unaffected since attestation is fully asynchronous |
| Redis drops a queued redemption id (enqueue call fails) | The hash is already durable in Postgres by then; a reconciliation sweep re-enqueues any orphaned row |
| A batch's transaction is submitted but the process crashes before confirming | `txHash` is persisted immediately on submission; retry always checks for an existing tx before ever resubmitting, avoiding a double-submit from the same wallet |
| A batch never confirms even after the configured retry budget | Individual completion records move to `attestationStatus: failed`, surfaced to the coverage metric (Phase C) rather than left ambiguously "pending" forever |
| Backend wallet key is compromised | Same rotation/secrets-management bar as any other backend credential (`ADMIN_JWT_SECRET`, etc.) — no special blockchain exception, and no real funds are at risk during the Fuji-testnet phase |
| Someone tampers with a `Redemption` row's hash, its stored Merkle proof, or the batch's stored root directly in Postgres | The verification endpoint independently recomputes the hash from the row's own fields, re-verifies the proof, and re-fetches the live on-chain root — any of the three checks failing surfaces as a mismatch |

## Tradeoffs

- Batching keeps on-chain cost roughly flat as completion volume scales, at the cost of review "freshness" being bounded by the batch window rather than per-completion (the PRD's own open question 1).
- A minimal smart contract registry (chosen over writing the root as raw self-transaction calldata) makes roots indexable via event logs and gives a cleaner path to a future public verification surface, at the cost of a contract to write, test, and deploy before Phase A can ship — accepted because the contract is deliberately tiny (one function, one event, `Ownable`-gated) and tested with Hardhat in `packages/contracts`.
- Fuji testnet first (rejected: going straight to mainnet) avoids risking real funds or writing bad data to a permanent public ledger while the pipeline is new, at the cost of a separate mainnet-promotion step later — accepted since that step is a pure config change (RPC URL, chain ID, contract address), not a code change.
- `@nestjs/schedule` (rejected: BullMQ) keeps the dependency surface small since the retry requirement here is batch-level, not per-job — accepted at the cost of a coarser retry granularity than a full job-queue system would give.

## Consequences

- New ops responsibility: funding and monitoring a service wallet (Fuji test AVAX during Phase A, real AVAX after mainnet promotion), and deploying/tracking a smart contract address per network.
- New dependency surface: `viem`, `merkletreejs` in `apps/api`; `hardhat`, `@nomicfoundation/hardhat-toolbox-viem`, `@openzeppelin/contracts` in the new `packages/contracts` workspace.
- This is the first `apps/api` module with unit test coverage (Jest, scoped to `src/attestation/**`) — the hashing/Merkle logic and batch retry/no-double-submit behavior are the parts most worth testing, per the PRD's own emphasis on tamper-evidence being the actual point of the feature.
- Attestation coverage and cost-per-completion become standing metrics to track (Phase C), not just a launch-time check.

## Revisit Triggers

- Cost-per-completion trends upward as venue/completion volume scales, independent of batching absorbing fixed costs.
- Attestation coverage (per Phase C's metric) drops below a threshold without an obvious transient cause.
- Fraud review matures enough (per the parent PRD's still-open "who owns fraud review" question) to need sub-batch-window latency, which would push toward smaller/more frequent batches or a different triggering model.
- A decision is made to expose a public, unauthenticated version of the verification tool (parent PRD open question 3) — the event-log-based registry contract was chosen partly to keep this option open cheaply.
