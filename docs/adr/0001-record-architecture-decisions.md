# ADR 0001: Record Architecture Decisions

- Status: Accepted
- Date: 2026-07-21
- Related docs: [PIKE v1 PRD](../PIKE_v1_PRD.md), [PIKE UI design documentation](../pike_ui_design.md)

## Context

PIKE has several product surfaces, external integrations, and failure-sensitive flows: WebAR scanning, reward claiming, redemption caps, business onboarding, admin oversight, app identity, and payment-gated publishing. The PRD already contains important recommendations and open questions, but those decisions need a durable place where future implementation tradeoffs can be tracked.

The project also needs architecture notes to capture how the system should behave when dependencies fail, because venue networks, camera permission, AR recognition, payments, auth, and third-party APIs can all fail in ordinary use.

## Decision

Record architecture decisions in `docs/adr` using numbered Markdown files. Each ADR must include context, the decision, failure scenarios, tradeoffs, consequences, and revisit triggers.

## Failure Scenarios

| Scenario | Expected handling |
|---|---|
| A future decision is implemented without context | Add an ADR retroactively before or during the implementation review |
| Two documents disagree about architecture | The accepted ADR wins for implementation, and the older document should be updated or linked to the ADR |
| A decision becomes outdated | Mark the ADR as `Superseded` and link to the replacement ADR |

## Tradeoffs

- ADRs add a small amount of documentation overhead.
- ADRs reduce repeated debate and make failure-mode decisions visible before they become production incidents.
- Keeping ADRs in the repo keeps the decision history close to the code and review process.

## Consequences

- New cross-cutting decisions should be documented before or alongside implementation.
- Pull requests that alter architecture, failure behavior, or product phase boundaries should update or add an ADR.
- The ADR index becomes the fastest way to understand why the system is shaped the way it is.

## Revisit Triggers

- The ADR count becomes hard to navigate.
- The team adopts an external architecture knowledge base.
- ADRs stop being updated during implementation work.

