# ADR 0004: Use 8th Wall Backed WebAR Marker Recognition for v1

- Status: Accepted
- Date: 2026-07-21
- Related docs: [PIKE v1 PRD sections 8, 9, 14, and 15](../PIKE_v1_PRD.md#8-feature-scan-marker-webar-verification)

## Context

PIKE's core differentiator is proof of presence through camera-based marker recognition, not a plain QR scan or GPS check-in. The PRD recommends 8th Wall for v1 because it provides hosted image-target compiling, cross-browser WebAR support, managed delivery, and analytics. MindAR remains the cost-conscious fallback if 8th Wall pricing becomes a blocker at scale.

The current README notes that 8th Wall credentials are not available in this environment, so marker compiling and recognition are stubbed behind credential TODOs while the integration points are already present.

## Decision

Use a WebAR marker-recognition path backed by 8th Wall for v1. Keep QR or NFC only as an entry mechanism into the WebAR quest page, not as proof of presence. Keep the implementation behind a narrow marker compile and recognition boundary so MindAR or another engine can be evaluated later without rewriting the whole quest flow.

## Failure Scenarios

| Scenario | Expected handling |
|---|---|
| Camera permission is denied | Explain the requirement and allow retry; do not award proof-of-presence |
| Marker recognition fails for a genuine visitor | Provide a retry path and log failure signals for support and device analysis |
| 8th Wall credentials are missing in development | Use the existing stub path, clearly marked as non-production behavior |
| 8th Wall API is unavailable during marker compilation | Keep quest creation in a pending or failed state; do not publish an uncompiled marker as AR-verified |
| QR fallback opens the quest but marker recognition never occurs | Allow browsing the quest page but do not mark the quest complete |
| Photo-of-a-photo spoofing is suspected | Flag the completion and reserve high-value rewards for authenticated app flows with more signal |

## Tradeoffs

- 8th Wall reduces custom computer-vision and browser compatibility work.
- 8th Wall adds vendor dependency and usage-based cost risk.
- MindAR could reduce vendor cost but shifts target compiling, hosting, quality, and device testing onto the team.
- Keeping a boundary around marker recognition preserves future option value.

## Consequences

- Production launch requires real 8th Wall credentials and device testing on iOS Safari and Android Chrome.
- Marker recognition must not silently degrade to QR-only completion.
- Failure analytics should distinguish camera denial, recognition failure, network failure, and API failure.
- Cost monitoring should be tied to venue count, scan volume, and pay-per-redemption economics.

## Revisit Triggers

- 8th Wall pricing no longer fits the venue or redemption revenue model.
- Recognition false negatives undermine visitor trust.
- A pilot venue requires unsupported devices or environments.
- MindAR or another engine can meet recognition quality with materially lower cost and acceptable maintenance burden.

