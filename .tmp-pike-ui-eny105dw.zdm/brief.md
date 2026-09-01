# PIKE project-wide UI implementation brief

## Objective

Implement the composition, hierarchy, density, component language, and interaction patterns demonstrated in `docs/PIKE UI Kit (Standalone).html` across every applicable frontend in this monorepo: consumer Expo app, WebAR, business dashboard, admin, and marketing web. This is a real-application implementation, not a standalone mockup.

## Audience

- Consumers discovering and completing location-based quests and collecting rewards.
- Business operators creating quests and reviewing campaign results.
- Platform administrators reviewing businesses, activity, redemptions, and risk.
- Prospective partners and users visiting the marketing site.

## Non-negotiable constraints

1. Preserve PIKE's current color palette and semantic token system. Do not copy the reference HTML's cream/black/copper palette.
2. Canonical color and theme sources are `packages/design-tokens/src/brand.ts`, `palette.ts`, `theme.ts`, `typography.ts`, and `shape.ts`, plus `docs/pike_ui_design.md`.
3. Gold is reward-only. Use at most one filled-blue primary CTA per screen.
4. Generated `theme.css` files must not be hand-edited. If token source changes are genuinely required, regenerate via the design-token package, but prefer no token changes.
5. Preserve all current functionality, routing, data fetching, auth, API contracts, and responsive behavior.
6. Preserve unrelated dirty worktree changes, especially `apps/api/src/redemptions/redemptions.service.ts`, `.claude/`, the reference HTML, and video files.
7. Do not add external image dependencies or remote stock image URLs.

## Aesthetic direction

Adopt the UI kit's confident, utilitarian campaign-console language using PIKE's existing blue-led identity: crisp information hierarchy, dark narrow desktop navigation, quiet semantic page backgrounds, hairline cards, compact uppercase metadata, clear status pills, table/list-driven operational pages, mobile bottom navigation, and high-contrast feature cards. Keep surfaces intentionally restrained and functional, with enough breathing room to feel premium rather than dense or generic.

Use the project's established typography and radius tokens where they conflict with the reference. Translate the kit's layout and rhythm rather than literally copying its baked typography, colors, or radii.

## Memorable motif

The recurring signature should be a strong PIKE-blue quest/action rail: one unmistakable primary action per screen, supported by compact progress, reward, and status metadata. It should connect the consumer quest experience to the business/admin operational surfaces without making all products look identical.

## Surface and screen map

### Expo consumer app

Apply the kit to `apps/app/app/login.tsx`, tab shell and all tabs, dynamic quest detail and scan routes, and shared app theme/components. Cover the reference intent for onboarding, home, active quest/scan CTA, wallet/rewards, reward detail where existing navigation permits, profile, XP/streak, and leaderboard. Keep quests/map routes coherent with the same language.

### WebAR

Apply the kit to permission landing/scanning states and reward reveal/claim/install states via `apps/webar/src/App.tsx`, `pages/ScanPage.tsx`, `pages/RewardRevealPage.tsx`, `components/ArScanView.tsx`, and styling. Preserve camera and redemption behavior.

### Business dashboard

Apply the kit to auth, shell/sidebar, home, quests list, quest creation flow (templates, marker generation/upload, caps/expiry), quest detail, venues, rewards, analytics, and settings. Replace the analytics placeholder with a useful UI based on data already available or safe empty/mock presentation states that do not fabricate live business metrics. Keep unavailable features clearly framed as empty states.

### Admin

Apply the kit to login, app shell/sidebar, dashboard, businesses, venues, quests, and redemptions. Do not invent unsupported API mutations. Existing pages should reflect the reference's verification, payment, platform quest/redemption, and risk-review visual patterns where the current routes/data model support them.

### Marketing web

The reference does not specify marketing screens, so preserve existing content and brand structure while harmonizing navigation, cards, typography rhythm, controls, status/metadata treatments, and responsive spacing with the new cross-product system. Cover home, privacy, terms, coming-soon, and admin gate.

## Component language

- Desktop app shell: narrow dark sidebar, compact brand block, clear active item, restrained footer/account region.
- Mobile shell: strong top context and stable bottom tab bar with safe-area handling.
- Page headers: eyebrow/context, concise title, optional one-line description, right-aligned single primary action.
- Cards: thin semantic border, quiet surface, consistent header/body/footer rhythm; avoid excessive shadows.
- Tables/lists: compact headers, generous readable rows, useful empty/loading/error states, responsive transformation for narrow screens.
- Forms: visible labels, help/error text, obvious focus states, grouped steps, and one dominant submit action.
- Status: semantic pills with icon/text where helpful; never rely on color alone.
- Quests/rewards: progress, time/cap metadata, and reward emphasis without overusing gold.
- Charts/metrics: clean overview cards and lightweight visual summaries; use existing libraries only.

## Accessibility and responsiveness

- Maintain keyboard navigation, visible focus, form labels, semantic headings, ARIA where needed, contrast, and reduced-motion preferences.
- No horizontal overflow at common mobile widths.
- Dashboard/admin tables must remain usable on narrow screens.
- Respect safe areas in Expo and WebAR.

## Image needs

No generated imagery is required. Reuse existing local logos/assets and CSS-native decorative treatments. Do not create or source stock images.

## Verification

- Run `npm test --workspace apps/web`.
- Run `npm run build:web`, `npm run build:dashboard`, `npm run build:admin`, and `npm run build:webar`.
- Run Expo TypeScript validation with `npx tsc --noEmit -p apps/app/tsconfig.json` when feasible.
- Visually inspect representative desktop and mobile screens for every surface, not just the marketing home page.

## Output path

Modify the application in place under `C:\Users\JINX\Desktop\clones\pike`.
