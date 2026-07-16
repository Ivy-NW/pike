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
| Pike Blue | `#2563EB` | Primary interface color — navigation, maps, core UI |
| Pike Gold | `#F59E0B` | Reserved for rewards only — coins, achievements, VIP, XP. Never used as a primary UI color |
| Deep Slate | `#111827` | Main dark color, dark-mode text |
| Light Gray | `#F8FAFC` | Cards, backgrounds, spacing |
| Success | `#10B981` | Quest completed, reward unlocked |
| Danger | `#EF4444` | Expired, failed, warnings |
| Purple Accent | `#7C3AED` | Reserved for AR interactions and special/legendary events |

**The single most important discipline in this palette: keep gold exclusive to rewards.** The moment gold appears anywhere else in the interface — a button, a nav icon, a section header — it stops signaling "you've earned something" and the entire reward system loses its visual punch. This isn't a style-guide suggestion; it should be enforced at the component level (e.g. a `<RewardAccent>` wrapper that's the only place gold is allowed to render), so it can't quietly leak into a future screen someone builds without reading this doc.

---

## 3. Typography & Iconography

- **Headings**: Space Grotesk or Sora — modern, friendly, distinctive at large sizes.
- **Body**: Inter, for reliable readability across dense UI.
- **Icons**: rounded outline sets only (Lucide, Phosphor, Material Symbols Rounded) — no heavy gaming-style icons.
- **Border radius**: a large, consistent 20px across buttons, cards, bottom sheets, and map elements, so the whole interface reads as soft rather than boxy.

**Open design note**: Space Grotesk/Sora paired with Inter is a strong, legible system, but it's also become a common default across consumer and AI-adjacent apps launched recently. It's usable for v1, but worth revisiting once the brand has room to differentiate further — right now the palette and the signature mark (section 5) are doing more of the distinctive work than the typography is.

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
| Background | `#F8FAFC` | `#0F172A` |
| Cards | White | `#1E293B` |
| Pike Blue | `#2563EB` | `#2563EB` (constant across both modes for brand consistency) |
| Gold | `#F59E0B` | Reads richer against the dark background |

Reward moments (the Reward and Map screens especially) already lean on dark, high-contrast layouts in the mockups below — this works in the platform's favor, since gold has more visual weight against slate than against light gray.

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

- Dark slate card (`#111827`) hosting the reward, per the dark-mode reward-moment note in section 6.
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

---

## 8. Companion Visuals

Interactive mockups for the Home and Reward screens, and the end-to-end user-journey flow (scan → quest → claim → app), were produced earlier in this conversation and should be treated as the visual reference alongside this doc. Not yet mocked up: Quest/AR Scan, Map, Profile, and an Experience Themes reskin example — flagged as follow-ups below.

## 9. Open Follow-Ups

- Mock up the Quest/AR Scan and Map screens to match this spec.
- Produce one Experience Themes reskin (e.g. pirate theme) of the Home screen to visually prove "navigation stays PIKE, flavor changes."
- Decide on the Space Grotesk/Sora + Inter pairing question raised in section 3 before locking the type system.
- Define the badge grid's locked-state visual treatment (grayscale vs. outline-only vs. silhouette).