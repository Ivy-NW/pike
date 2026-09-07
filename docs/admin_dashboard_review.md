# Admin Dashboard — Structural & Backend Review

Status: implemented · September 2026

Companion to `docs/pike_ui_design.md` §7.7 (which covers the visual/interaction redesign of
`apps/admin`). This doc covers what changed structurally in `apps/api`'s admin surface, why,
and what's still open.

---

## Context

`apps/admin` talks to a handful of `/admin/*` endpoints in `apps/api`. Auditing that surface
alongside the UI redesign turned up a flat permission model, no record of who took which
action, unbounded list endpoints, no self-service account recovery for admins, and two
fully-built backend capabilities (`AdminAttestationsController`, the admin-gate attempt log)
with no admin UI at all. All of the findings below were implemented, not just written up.

---

## C1a. RBAC / flat admin role

**Before**: `Admin` was `id/email/passwordHash/createdAt` — every admin had identical, full
access, including the two actions with real platform-wide/financial consequence (suspending a
business, editing on-chain attestation batch config).

**Now**:
- `Admin.role: AdminRole` (`super_admin | admin`, default `admin`). Migration
  `20260907120000_admin_rbac_audit_log_and_password_reset`.
- `scripts/seed-admin.ts` seeds the first account as `super_admin` — there must always be at
  least one.
- The admin JWT payload carries `adminRole` alongside the existing token-type discriminator
  (`TokenService.AdminTokenPayload`); `AdminAuthGuard` sets `req.adminRole` from it.
- `SuperAdminGuard` (`apps/api/src/auth/guards/super-admin.guard.ts`) gates
  `POST /admin/businesses/:id/suspend` and `PATCH /admin/attestations/config` — every other
  admin route stays open to any admin.
- `apps/admin` stores the admin's role alongside their email (`lib/auth.ts`) and disables the
  Suspend button and the batch-config save button in the UI for non-super-admins. This is a
  convenience, not the boundary — the guard is the real check.

**Open**: promoting a second admin to `super_admin` currently requires direct DB access
(Prisma Studio or a script) — there's no admin-facing role-management UI. Fine at current team
size; add one if the admin roster grows.

## C1b. No audit trail on admin actions

**Before**: `verifyBusiness`, `suspendBusiness`, `createBusiness`, and the attestation
`updateConfig` mutated state with no record of which admin did it, beyond Postgres's own row
timestamps.

**Now**: `AdminAuditLog` (adminId, action, targetType, targetId, metadata, createdAt), written
via `AdminAuditLogService.record(...)` from all four call sites above. Readable via
`GET /admin/audit-log` (paginated) and the new Audit log admin page.

**Open**: writes happen inline in each controller method rather than through a decorator/
interceptor, so a new mutating endpoint won't get audited automatically — whoever adds one
needs to remember to call `record(...)`. Worth revisiting as an interceptor if the admin
surface grows past a handful of mutating routes.

## C1c. No pagination on admin list endpoints

**Before**: `listBusinesses`/`listVenues`/`listQuests` returned every row unbounded;
`listRedemptions`/`listAdminGateAttempts` hard-capped at `take: 500` with no way to see past
that cap.

**Now**: a shared cursor-pagination helper (`apps/api/src/common/pagination.dto.ts`) backs all
five endpoints — each now returns `{ items, nextCursor }` (safe to change since `/admin/*` has
exactly one consumer). Businesses and Redemptions got a "Load more" control wired into their
admin pages, since those two already do client-side search/filtering that would otherwise
silently stop covering rows past the first page. Venues, Quests, and the Gate log fetch a
single page at a higher limit (100) for now — see the matching follow-up in
`docs/pike_ui_design.md` §9.

**Side effect caught while doing this**: the admin Dashboard overview page used
`businesses.length`/`venues.length` from these same list calls as its "Total businesses"/
"Total venues" stat-card numbers. Once those endpoints are paginated, that would have silently
started under-reporting past the first page. Added `GET /admin/stats` (exact `count()` queries)
so the overview page's numbers stay correct regardless of how the list endpoints paginate.

**Also caught**: `BusinessesService.listAll` was returning full `Business` rows — including
`passwordHash`, `emailVerificationToken`, and `passwordResetToken` — straight to the admin
frontend. Fixed as part of this change (`omitSensitive` now applied); see C1d below for the
same class of leak on the `Admin` model.

## C1d. No admin self-service account recovery

**Before**: admins are seeded via `scripts/seed-admin.ts` with no password-reset path — a
locked-out admin needed direct DB/script access. Business accounts already had one.

**Now**: `Admin.passwordResetToken`/`passwordResetExpiresAt` (same migration as C1a/C1b),
`AuthService.forgotAdminPassword`/`resetAdminPassword` mirroring the business flow exactly
(log-only reset link — neither flow has a real email provider wired up yet, both carry the
same `TODO(credentials)` marker). New `POST auth/admin/forgot-password` /
`POST auth/admin/reset-password` routes, reusing the existing generic `ForgotPasswordDto`/
`ResetPasswordDto`. `apps/admin` gained `/forgot-password` and `/reset-password` pages and a
"Forgot?" link on the login form.

**Related fix**: `AuthService`'s shared `omitPasswordHash` helper only ever stripped
`passwordHash`, so `loginBusiness`/`registerBusiness`/`verifyBusinessEmail` (and now
`loginAdmin`) were leaking `emailVerificationToken`/`passwordResetToken`/
`passwordResetExpiresAt` straight into response bodies — a pre-existing leak on the business
side that would have applied to the new `Admin` reset fields immediately. The helper now strips
all four sensitive keys wherever present.

## C1e. Guard duplication

**Before**: `AdminAuthGuard`, `BusinessAuthGuard`, and `ConsumerAuthGuard` were three
independent, near-identical "check Bearer header, verify token, attach an id to the request"
implementations.

**Now**: `apps/api/src/auth/guards/token-auth.guard.ts` exports `createTokenAuthGuard(...)`, a
factory (the same mixin pattern `@nestjs/passport`'s `PassportStrategy(Strategy)` uses) that
each of the three guards extends with a few lines of config. No controller decorator anywhere
else changed — same guard class names, same request fields (`req.adminId`, `req.businessId`,
`req.userId`), same error messages. Verified by a clean `Nest application successfully
started` boot with every route mapped, confirming Nest's DI resolves constructor injection
through the extended mixin class correctly.

---

## C2. Quick wins: exposing already-built backend capability

Two backend capabilities existed with zero admin UI before this pass:

- **`AdminAttestationsController`** (on-chain redemption verification + runtime batch config)
  → new **Attestations** admin page: paste a redemption id to get a pass/fail chain-verification
  result, plus an editable batch-window/threshold/max-retries form (super-admin only, confirm-
  gated).
- **`GET /admin/admin-gate-attempts`** (marketing-site admin-gate abuse log) → new **Gate log**
  admin page with an all/success/failed filter, same tab-bar pattern as Redemptions.

Both were additive: new pages + new `lib/api.ts` methods, no changes to the existing endpoint
logic (beyond the pagination and audit-log wiring described above).

---

## Still open (not addressed in this pass)

- **No admin role-management UI** — promoting/demoting `super_admin` requires DB access (C1a).
- **Audit log has no query filters yet** (by admin, by action type) — currently a flat
  newest-first list. Add filters once the log has enough volume to need them.
- **Guard duplication fix is structural only** — a fourth role type would still mean a fourth
  thin subclass, which is the intended shape, not a shortcut that needs revisiting.
- **Venues/Quests/Gate-log "Load more"** — see `docs/pike_ui_design.md` §9.
