---
name: Pike Vanguard
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#d2bbff'
  on-tertiary: '#3f008e'
  tertiary-container: '#8343f4'
  on-tertiary-container: '#f7edff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  pike-blue-glow: '#4F46E5'
  gold-deep: '#B45309'
  slate-gray: '#1E293B'
  text-muted: '#64748B'
  success-neon: '#10B981'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 20px
  element-gap: 12px
  section-margin: 28px
  stack-sm: 8px
  stack-md: 14px
---

## Brand & Style

The design system embodies a **"Techno-Adventurer"** persona. It balances the high-stakes excitement of a gaming environment with the reliability of a premium fintech application. The target audience is urban explorers and tech-savvy "quest-seekers" who value both digital prestige (XP, levels) and physical rewards.

The visual style is a fusion of **Corporate Modern** and **Cyber-Minimalism**. It utilizes a "Dark Mode First" philosophy to mimic gaming consoles and AR interfaces, using high-contrast "neon" accents to guide the eye toward interactive elements.

- **Immersive Surfaces:** Deep, layered navy backgrounds provide a sense of infinite depth, essential for an AR-centric experience.
- **Luminous Accents:** Use of glows and gradients to simulate light-emitting interfaces, making rewards and achievements feel valuable and "earned."
- **High-Tech Precision:** Sharp typography and technical grid overlays convey accuracy and trustworthiness in location-based verification.

## Colors

The palette is engineered for high legibility in outdoor AR environments and high-impact immersion in-app.

- **Primary (Pike Blue):** Used for primary actions, progress bars, and map pins. It represents the "utility" and "guidance" of the app.
- **Secondary (Gold):** Specifically reserved for achievements, rewards, and high-value currency. It should never be used for standard UI actions.
- **Tertiary (Purple):** Used for "Legendary" status items or secondary navigational paths to distinguish them from standard quests.
- **Neutral (Deep Slate):** The foundational surface color. It provides a non-distracting background that allows the vibrant blue and gold to pop.
- **Glows:** Use `pike-blue-glow` for shadow-based illumination on interactive elements to create a "tactile light" effect.

## Typography

The dual-font system separates **Data/Identity** from **Utility/Context**.

- **Space Grotesk (The "Identity" Font):** Used for headings, numbers, XP values, and brand labels. Its geometric nature evokes a futuristic, technical vibe. Use `label-caps` for eyebrows and section headers to give a structured, "heads-up display" (HUD) feel.
- **Inter (The "Utility" Font):** Handles all body text, descriptions, and functional UI labels. It ensures maximum readability for quest instructions and venue details.
- **Weight Strategy:** Use Bold (700) for all primary headings to maintain a strong hierarchy against the dark background.

## Layout & Spacing

The system follows a **4px base grid** with a primary layout rhythm based on **14px increments** (14, 28, 56) to create a distinct, non-standard visual cadence.

- **Grid:** A 12-column fluid grid is used for dashboard views, while mobile screens utilize a single column with a fixed **20px horizontal margin**.
- **The "Rail" Pattern:** For lists of quests or rewards, use a horizontal "rail" (carousel) with `12px` gaps to encourage lateral exploration without vertical fatigue.
- **Vertical Rhythm:** Use `28px` (2 units of 14px) to separate major content sections. Use `14px` for internal card padding and spacing between related UI components.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Luminous Shadows** rather than traditional gray shadows.

- **Surface Tiers:**
    - `Level 0 (#0F172A)`: Main app background.
    - `Level 1 (#1E293B)`: Cards, stat boxes, and navigation bars.
    - `Level 2 (#2A3B54)`: Pop-overs, active states, and nested badges.
- **Interactive Glows:** Primary buttons must feature a drop shadow with 30-35% opacity in their respective brand color (Blue or Gold) to simulate a physical neon light reflecting on the surface.
- **AR Overlays:** Use a subtle `repeating-linear-gradient` (scanlines) on AR-related containers to visually differentiate between physical camera views and digital UI layers.

## Shapes

The shape language is **"Geometric-Soft."** It uses generous rounding for containers to feel approachable and modern, while maintaining sharp internal logic.

- **Containers:** Large cards and banners use `rounded-lg` (1.25rem / 20px).
- **UI Components:** Buttons and status pills must use the **Pill-shaped** (999px) execution to emphasize their interactive and friendly nature.
- **Identity Elements:** Profile avatars and map pins are strictly **Circular (50%)** to contrast against the rectangular grid.

## Components

### Buttons
- **Primary:** Pill-shaped, `pike-blue` background, white text, with a blue glow shadow.
- **Reward/Claim:** Pill-shaped, `pike-gold` background, white or `gold-deep` text, with a gold glow shadow.
- **Ghost:** White border (1px), transparent background, for secondary actions.

### Cards
- **Feature Card:** `slate-gray` background, `20px` radius, subtle `1px` border using `Level 2` color.
- **Reward Card:** Incorporates a `radial-gradient` from the center to create a spotlight effect on the reward icon.

### Stat Chips (XP/Levels)
- Compact pills with `pike-blue-glow` at 10% opacity for the background and high-contrast text. Use `label-caps` for the label.

### Form Fields
- Dark backgrounds (`#0F172A`) with a subtle `1px` border. Active state transitions the border to `pike-blue` with a soft outer glow.

### AR Elements
- Recognition markers should feature an animated "corner frame" bracket style using the `Space Grotesk` technical labels.