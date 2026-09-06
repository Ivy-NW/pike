# PIKE UI responsive QA

Use the existing seeded local environment for authenticated dashboard/admin routes. Start the API and run `npm run seed:phase2 --workspace apps/api`, then sign in with the development accounts printed by the seed script. This keeps all operational screens backed by the real local API instead of fabricated production metrics.

Check each authenticated route at 1440px, 768px, and 375px. At narrow widths, confirm the bottom navigation remains above the safe area, tables transform into readable row cards, there is no horizontal page overflow, and the single filled-blue action remains visually dominant.

WebAR exposes deterministic fixtures only while Vite is in development mode (`import.meta.env.DEV`). They never run in a production build:

- `/scan/demo?demo=scan` — active camera/scan composition
- `/scan/demo?demo=error` — recoverable scan failure
- `/scan/demo?demo=unavailable` — paused quest
- `/reward/demo?demo=signin` — populated reward and claim form
- `/reward/demo?demo=claimed` — successful reward, XP, and badge state
- `/reward/demo?demo=rejected` — verification failure
- `/reward/demo?demo=error` — invalid or expired reward link

For Expo, run the app against the same seeded API and inspect login plus every tab at a compact phone viewport and a tablet viewport. Confirm scrollable content clears the bottom safe area, the scan route hides tab chrome, and long quest/reward names wrap without clipping.
