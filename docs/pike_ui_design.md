# PIKE — UI Design Documentation
**Visual identity, component system, and screen specifications**
Status: Draft · July 2026

---

## 1. Design Positioning

PIKE's visual identity is deliberately positioned away from two default traps for a gamified product:

- **Typical gaming aesthetics** — neon greens, purple gradients, heavy UI chrome.
- **Corporate SaaS dashboards** — dense tables, cold gray-on-white, no warmth.

**Reference points**: Apple, Nike, Airbnb, and Pokémon GO — premium, spatial, and rewarding. **Not**: Discord or Twitch.

The design has to work across two very different surfaces at once — a zero-install WebAR page loaded cold at a venue, and a persistent home-base app someone opens daily — so the system below is built to hold together across both rather than being tuned for just one.

---

## 2. Color Palette

| Color | Hex | Usage |
|---|---|---|
| Pike Blue | `#2563EB` light / `#3b82f6` dark | Primary interface color — navigation, maps, core UI |
| Pike Gold (Smoked Gold) | `#7E6030` light / `#9C7C4A` dark | Reserved for rewards only — coins, achievements, VIP, XP. Never used as a primary UI color. A desaturated brass pulled from the logo's mid-tone, deliberately restrained rather than a bright amber |
| Dark-mode background | `#000000` (true black) | The dark theme's surface color — see Section 6; not a slate/navy dark, full black with gold and blue glow |
| Off-White | `#F6F4EF` | Light-mode cards, backgrounds, spacing (warm, not blue-tinted) |
| Success | `#059669` light / `#10B981` dark | Quest completed, reward unlocked |
| Danger | `#dc2626` light / `#f87171` dark | Expired, failed, warnings |
| Purple Accent | `#7C3AED` | Reserved for AR interactions and special/legendary events |

(Source of truth for all hex values: `packages/design-tokens/src/palette.ts`, shared by every app in the monorepo. This table previously listed a `#111827` "Deep Slate" dark background and a `#EF4444` danger color that matched neither theme's actual token — corrected above; Section 6 already had the true-black dark background right, this table just hadn't caught up to it.)

**On CSS variable names**: each app (`apps/web`, `apps/dashboard`, `apps/admin`) layers its own semantic variable aliases over this one shared palette — e.g. the landing page uses `--landing-action`, the dashboard uses `--action`, both resolving to the same Pike Blue hex per theme. This is intentional per-surface naming, not drift: it lets each app name its tokens for its own component vocabulary while staying pinned to one canonical color source. If a value ever needs to change, it changes once in `palette.ts`.

**The single most important discipline in this palette: keep gold exclusive to rewards.** The moment gold appears anywhere else in the interface — a button, a nav icon, a section header — it stops signaling "you've earned something" and the entire reward system loses its visual punch. This isn't a style-guide suggestion; it should be enforced at the component level (e.g. a `<RewardAccent>` wrapper that's the only place gold is allowed to render), so it can't quietly leak into a future screen someone builds without reading this doc.

---

## 3. Typography & Iconography

- **Headings**: Orbitron — modern, geometric, gamified-tech display face, distinctive at large sizes and on caps labels.
- **Body**: Inter, for reliable readability across dense UI.
- **Icons**: rounded outline sets only (Lucide, Phosphor, Material Symbols Rounded) — no heavy gaming-style icons.
- **Border radius**: a large, consistent 20px across buttons, cards, bottom sheets, and map elements, so the whole interface reads as soft rather than boxy.

The Orbitron/Inter pairing is shared by both the light and dark identity — one type system across the whole platform, not a per-theme split.

---

## 4. Spacing & Component Tokens

| Token | Value | Applies to |
|---|---|---|
| Corner radius | 20px | Buttons, cards, bottom sheets, map pins/callouts |
| Card padding | 14–16px | All card components |
| Section gap | 16–20px | Vertical rhythm between content blocks |
| Bottom nav | 5 icons, outline style | Home, Map, Quests, Rewards, Profile |
| Primary button | Pike Blue fill, white text, 20px radius | One per screen max — see restraint note below |

**Restraint rule**: at most one Pike Blue filled ("primary") action per screen. Everything else is a secondary/outline button or a plain text link. A screen with three blue buttons flattens the hierarchy the color is supposed to create.

---

## 5. Signature Element: Experience Themes

The most distinctive idea in the system: **venues can reskin the visual flavor of their quests** — a pirate theme for an aquarium, a cyberpunk theme for a gaming convention, a safari theme for a wildlife park — while navigation, controls, and interaction patterns remain unmistakably PIKE.

This gives venues creative flexibility without fragmenting the platform's usability, and it's the feature most likely to make PIKE feel different from a generic loyalty app in a screenshot. Treat it as the platform's signature, not an optional add-on.

**What a theme is allowed to change**: quest card artwork, AR skin/character, accent illustration style, reward-reveal animation flavor.
**What a theme must never change**: navigation position/icons, button placement, color roles (gold still means reward, blue still means primary action), typography, spacing.

**Logo mark**: a stylized "P" built to double as a location pin, a compass, and a quest waypoint — simple enough to be recognizable at icon size without the wordmark, and consistent with the exploration theme across every venue skin.

---

## 6. Motion & Dark Mode

**Motion** carries a lot of the premium feel: XP bars filling, coins spinning, cards lifting slightly on interaction, a reward chest opening with confetti on quest completion.

These should stay **purposeful and restrained** — reserved for moments that matter (completion, unlock, level-up) rather than applied everywhere, or the interface starts to feel busy instead of alive. As a rule of thumb: if a motion effect fires on every screen load, it's overused; if it fires only when the user earns something, it's doing its job.

**Dark mode is not a simple color inversion:**

| Element | Light | Dark |
|---|---|---|
| Background | `#F6F4EF` (warm off-white) | `#000000` (true black) |
| Cards | Warm white | `#0d0d0d`–`#292929` (stepped near-black elevation) |
| Pike Blue | `#2563EB` | `#3b82f6` |
| Gold (Smoked Gold) | `#7E6030` | `#9C7C4A` — reads richer against the dark background |

Both modes share the same warm-neutral (non-blue) gray ramp and the same Smoked Gold hue family, just at different lightness/contrast — the two themes are meant to read as one system, not two different color schemes. Reward moments (the Reward and Map screens especially) already lean on dark, high-contrast layouts in the mockups below — this works in the platform's favor, since gold has more visual weight against true black than against light gray.

---

## 7. Screen Specifications

### 7.1 Home (app home base)
**Purpose**: daily-open screen; the identity dashboard.

| Zone | Content |
|---|---|
| Header | Logo mark, app name, streak count (flame icon, gold) |
| XP bar | Level number + current/next-level XP, Pike Blue fill |
| Active quest card | Quest name, one-line objective, progress dots |
| Nearby venues | 2-up card row, thumbnail + venue name |
| Bottom nav | Home (active), Map, Quests, Rewards, Profile |

### 7.2 Quest / AR Scan
**Purpose**: the marker-recognition moment — camera-first, minimal HUD.

- Full-bleed camera viewport, dark background regardless of light/dark mode setting (camera content dominates).
- Minimal overlay: a target reticle/frame guiding the visitor to the marker, one-line instruction text ("point your camera at the marker").
- On recognition: AR skin renders (theme-dependent per section 5), brief Purple Accent glow signals the special AR moment, then transitions to reward reveal.
- No navigation chrome visible during active scanning — this is the one screen where the bottom nav should disappear, to keep focus on the camera.

### 7.3 Map
**Purpose**: discovery — where quests and partner venues are.

- Full-screen map, Pike Blue pins for available quests, muted gray pins for visited/completed venues.
- Bottom sheet (20px radius, swipe-up) lists nearby venues with distance and quest availability.
- Leaderboard access lives here or on Profile — venue-level leaderboard ties naturally to the map context.

### 7.4 Reward
**Purpose**: the payoff moment — deliberately the highest-contrast, most gold-forward screen in the app.

- Dark elevated card (Section 6's dark-mode card range, `#0d0d0d`–`#292929`) hosting the reward, per the dark-mode reward-moment note in section 6.
- Gold coin/reward icon, reward name in gold, expiry date in muted gray.
- Badge-earned row (if applicable) in Purple Accent.
- Single primary CTA: "Claim reward" (Pike Blue).
- Soft app-install prompt beneath the CTA for unauthenticated web-flow users ("save your reward and start earning XP") — this is the funnel moment described in the PRD's user journey.

### 7.5 Profile
**Purpose**: identity, history, and settings.

- Avatar/initials, level, total XP, streak history.
- Badge grid (earned + locked/grayed-out states).
- Reward wallet (unredeemed + expired history tab).
- Favorited venues list (drives push notification triggers).
- Account settings, including the in-app account deletion path required for App Store compliance.

### 7.6 Business Dashboard (`apps/dashboard`)

Unlike 7.1–7.5 above, this is a desktop web app for venue owners/operators, not a screen in the consumer mobile app — a denser, internal-tool surface (own `--radius-md`, no bottom nav, no XP/streak chrome). It shares the same Orbitron/Inter type system and color tokens as every other surface, and borrows several presentation patterns directly from the marketing landing page (`apps/web`) rather than inventing its own — documented here so they don't drift apart again.

**Sidebar identity.** The wordmark next to the logo is just "Business Portal" — the standalone "PIKE" line was dropped since the logo mark already carries that identity, and one line reads cleaner than two of uneven weight. Account identity (business name) and the theme toggle live together at the bottom of the rail as a small grouped chip (`.sidebar-footer-identity`, a `surface-container-low` background pill), not as plain small text in the corner — both were easy to miss at the old size/contrast.

**One primary action per screen.** Section 4's restraint rule applies here exactly as written. The sidebar's persistent "Create quest" link is global chrome, not a page-level primary — it gets its own tonal treatment (`color-mix(in srgb, var(--action) 12%, transparent)` fill, not a filled `.primary`) so it never competes with a page's own single primary:

| Page | The one primary action |
|---|---|
| Home | none (overview only) — "Add venue" is `.secondary`; per-venue quest creation moved to each venue's own detail page (see below) |
| Home, zero venues | "Add venue" (empty state) |
| Venue detail (`/venues/[venueId]`) | "Create quest", scoped to that venue |
| Quests list | "Create quest" — shown once, either in the header (once quests exist) or the empty state (before that), never both |
| Settings | Payment-method save (gates quest publishing) — the profile-save button is `.secondary` |
| Rewards / Analytics / new-quest / new-venue | Each already has exactly one primary |

**Patterns adopted from the landing page** (`apps/web/src/components/landing/Landing.module.css`) — the *patterns* were ported, not the CSS Modules or `--landing-*` variable names; dashboard keeps its own token aliases (`--action`, `--border-subtle`, `--surface-container-lowest`, etc.):

- **Metrics strip** (a hybrid of `.ledger`, the Attribution section's `3px` accent-top-border framing and bold heading-font numbers, and `.factStrip`, a row of stats divided by vertical rules): three metrics side by side in one bordered container rather than a stack of rows or three disconnected boxes — Home's "Active quests / Venues / Total quests" row.
- **Corner icon badge** (from `.stepCard`/`.stepIcon`): a filled, circular/rounded icon badge overlapping a card's top edge (`top: -16px`), used on Home's venue cards. Cards sit in a responsive grid (`repeat(auto-fill, minmax(300px,1fr))`) with a deliberately larger row-gap than column-gap (`32px`/`20px`) — the badge pokes 16px above its own card, so anything tighter causes it to overlap the card in the row above.
- **Tighter heading type**: page titles use `font-weight: 600` (not browser-default bold) with `letter-spacing: -0.02em` and a responsive `clamp()`, echoing (at a smaller, denser scale) the landing page's heading treatment (`font-weight:500`, `letter-spacing:-.035em` to `-.045em`).
- **Always-on soft card shadow**: cards previously only gained a shadow on `:hover`; a much quieter version now applies at rest too, the same warm-black, negative-spread shadow shape used throughout the landing page, scaled down for a denser tool.

**Venue drill-down.** Each Home venue card is a full `<Link>` to `/venues/[venueId]`, previewing only its first 3 quests (with a "+N more" line beneath) rather than the full list — the per-venue detail page shows every quest in the same table layout as the main Quests list, scoped to that venue, with "Create quest" as its one primary action.

**Gold stays reward-only here too** — this app's only uses of the gold/`--primary` token are the reward-tier badge and two reward-icon accents on the Rewards page; the discipline from Section 2 applies to this surface exactly as it does everywhere else.

### 7.7 Admin Dashboard (`apps/admin`)

Platform-oversight tool for PIKE staff, not for businesses or consumers — there is no self-registration; the only path in is the marketing site's obscured secret-code gate (`apps/web`'s admin-gate flow), followed by this app's own email/password login. Unindexed (`noindex, nofollow`) and never linked publicly. Six operational pages (Dashboard, Businesses, Venues, Quests, Redemptions, Free marker leads) plus three added alongside this section (Attestations, Gate log, Audit log — see `docs/admin_dashboard_review.md`).

**Shares one interaction layer with the Business Dashboard.** Same token system, same Orbitron/Inter pairing, same hand-rolled icon set, and — since both apps kept drifting apart before this pass reconciled them — the identical sidebar (theme-aware, collapsible, identity-chip footer), toast, and modal/confirm-dialog patterns documented in §7.6. Treat the two internal tools as one component vocabulary going forward: a pattern added to one belongs in the other unless there's a content reason it doesn't apply (see below). The admin sidebar previously stayed permanently dark (`#111827`) regardless of the theme toggle; it's now the same translucent, theme-following rail as the Business Dashboard, with the account chip showing the signed-in admin's email instead of a business name.

**Where it differs from the Business Dashboard, deliberately:**
- No persistent "Create X" sidebar CTA — admin has no single dominant creation action the way "Create quest" is for a business (its only create flow, sales-assisted business onboarding, lives inline on the Businesses page instead).
- No metrics-ledger or corner-icon-badge card patterns — admin's content is list/table-first (six of nine pages are just filterable tables), not a card gallery, so those patterns have nothing to attach to here.
- **No gold anywhere.** This surface has zero reward-tier UI, so `--primary` (gold) never appears — not even for a "warning" accent, which used gold before this pass and has been moved to `--error` to stop implying "you've earned something" on a flagged-redemption stat card. The `.badge-warning` utility class still exists in admin's globals.css using gold and is currently unused; if a future page adopts it, restyle it off gold first.

**One primary action per page:**

| Page | The one primary action |
|---|---|
| Dashboard | none — overview only; row-level "Approve" actions are `.secondary` |
| Businesses | "Create" (sales-assisted onboarding form) — per-row "Mark verified"/"Suspend" are `.secondary`/`.danger`, not `.primary` (this page previously rendered a second filled-primary button per matching row, competing with the page's real primary — fixed) |
| Venues, Quests, Redemptions, Gate log, Audit log | none — read-only tables |
| Attestations | "Save changes" (batch config), gated behind a confirm dialog since it affects production attestation timing |
| Leads | none — read-only |

**Destructive/high-consequence actions get a confirm dialog and are logged.** Suspending a business and editing attestation batch config now go through a `ConfirmDialog` (the shared `.modal` pattern) before submitting, and both are recorded to an admin audit log (`docs/admin_dashboard_review.md` C1b) with which admin did it and when. Suspending a business and editing batch config are also restricted to the `super_admin` role tier (`docs/admin_dashboard_review.md` C1a) — every other admin action stays open to any admin account.

---

## 8. Companion Visuals

Interactive mockups for the Home and Reward screens, and the end-to-end user-journey flow (scan → quest → claim → app), were produced earlier in this conversation and should be treated as the visual reference alongside this doc. Not yet mocked up: Quest/AR Scan, Map, Profile, and an Experience Themes reskin example — flagged as follow-ups below.

## 9. Open Follow-Ups

- Mock up the Quest/AR Scan and Map screens to match this spec.
- Produce one Experience Themes reskin (e.g. pirate theme) of the Home screen to visually prove "navigation stays PIKE, flavor changes."
- Define the badge grid's locked-state visual treatment (grayscale vs. outline-only vs. silhouette).
- Admin's Venues, Quests, and Gate log pages fetch a single higher-limit page (100) rather than a "Load more" control — fine at current row counts, but Businesses and Redemptions already needed pagination first and the other three will eventually need the same treatment (see `docs/admin_dashboard_review.md` C1c).
- The unused `.badge-warning` utility in `apps/admin/src/app/globals.css` still styles itself with gold; restyle it off `--primary` before any page adopts it, to keep this app's "no gold" rule intact.