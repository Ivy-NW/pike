# PIKE landing page content and design plan

Status: proposed direction for `apps/web`  
Scope: content strategy, information architecture, visual direction, UX behavior, and implementation sequence. No production code changes are included in this phase.

## 1. What the landing page must do

The page should make one idea obvious within the first screen:

> PIKE helps venues turn an in-person visit into a short phone-based quest that ends in a controlled reward for a future visit.

The primary audience is the venue owner or operator deciding whether PIKE is useful, credible, and easy to launch. Players are a secondary audience with a separate waitlist action near the end of the page.

The page should answer, in order:

1. What is PIKE?
2. What does a visitor actually do?
3. Why would that help my venue?
4. What can I customize and control?
5. Is it practical and trustworthy?
6. What can I do next?

Primary conversion: create a business account or begin a venue pilot.  
Secondary conversion: watch the existing product demo.  
Player conversion: join the player waitlist.

## 2. Current-page audit

### What is worth keeping

- The real product loop is strong: spot a marker, scan in the browser, complete a quest, unlock a reward.
- The warm neutral palette is more ownable than generic blue-on-white SaaS styling.
- The hero venue photograph gives the product a physical, real-world setting.
- Experience themes are PIKE's most distinctive visual and product idea.
- The business dashboard preview connects the playful visitor experience to operator control.
- The current page is accessible in its basic structure and already supports responsive layouts and reduced motion.

### What currently feels generated or generic

- The page contains ten major sections, several of which repeat the same promise in slightly different language. This produces length without adding conviction.
- Much of the copy is emotionally pleasant but not concrete: “make every visit worth coming back for,” “find something unexpected,” and “the clever part stays out of the way” do not explain the product by themselves.
- The repeated pattern of eyebrow, oversized headline, three or four cards, and decorative mockup is a recognizable template rather than a narrative.
- The category-pill strip looks like a social-proof strip but contains no customers or evidence. It should not occupy prime space.
- The “Technical advantage” section is too engineering-led for the main buying journey. “Immutable proof of presence” and generic chart tiles add complexity before value has been established.
- “Real-time scan and conversion data” currently overstates the product: richer dashboard analytics are still listed as coming soon in `docs/progress.md`.
- Several visuals are cinematic concept images. They communicate theme range, but together they can read as AI portfolio art rather than evidence of a working product.
- The gold landing-page accent is being used for general primary actions, although the design system reserves gold for rewards. Pike Blue should carry interface actions; gold should appear at the reward moment only.
- Repeated tilted cards, floating overlays, scroll reveals, numbered lists, and oversized headings compete for attention. The page needs one memorable device, not several.
- Business and player messaging are interwoven for most of the page, leaving the primary conversion audience unclear.

## 3. Recommended creative direction

### Concept: “The venue field guide”

Treat the page like a documented visit rather than a software feature catalogue. One fictional-but-clearly-labelled example quest, “The Hidden Table,” becomes the thread connecting the marker in the venue, the visitor's phone, the reward, and the venue dashboard.

The feeling should sit between a premium hospitality editorial and a practical field guide:

- documentary photography and close-up physical details;
- captions, timestamps, annotations, and small operational notes;
- generous warm space with occasional deep-slate chapters;
- a restrained waypoint/marker graphic that recurs through the journey;
- product UI shown only when it explains a real step;
- no gradient blobs, floating glass cards, fake logo walls, or ornamental dashboards.

### Memorable device

Use one continuous “quest trail” through the page: a thin route line and numbered waypoint marks connect the physical marker, browser scan, reward, and return visit. It should behave like editorial annotation, not a glowing game HUD.

### Typography

- Keep Orbitron for the wordmark, hero display, short section headings, step numbers, and small technical labels.
- Use Inter for paragraphs, proof points, controls, captions, and longer explanatory headings.
- Prefer sentence case. Avoid all-caps except for compact labels of three words or fewer.
- Keep line lengths between roughly 45 and 70 characters for core copy.

### Color

- Warm off-white is the dominant page surface.
- Deep Slate is used for the visitor journey and the closing conversion chapter.
- Pike Blue is used for primary actions, links, route markers, and active UI states.
- Smoked Gold appears only when a reward is earned or displayed.
- Purple appears only if an actual AR interaction is being demonstrated.

### Imagery

- Retain the current hero venue image for the first iteration, but crop it around the visitor, phone, and physical marker.
- Prefer real screenshots from the existing WebAR and dashboard flows over fabricated UI.
- Extract two or three clean frames from `pike-webar-demo.mp4` if their resolution is sufficient.
- Keep the themed images as explicitly labelled “example quest directions,” not implied customer work.
- Longer term, replace the hero with an original mini-shoot: wide venue context, marker close-up, visitor scan, and staff redemption. Consistent lighting and the same venue/person across all four images will make the story feel authored.
- Do not use stock-photo services or add more generic AI lifestyle imagery.

## 4. New page structure and content

Reduce the page from ten major sections to seven. Each section must introduce one new piece of information.

### 1. Header: two clear paths

Purpose: orient business visitors without turning navigation into a product sitemap.

Content:

- Logo
- Links: How it works, For venues, Quest examples
- Utility link: Business login
- Primary action: Create a venue quest

Remove the “How it works” dropdown. Three visible anchors are easier to scan and feel more deliberate. Keep the theme toggle only if dark mode is a product requirement for the marketing site; otherwise move it to the footer and reduce header clutter.

### 2. Hero: explain the product before selling the feeling

Purpose: state the category, mechanism, and outcome without requiring the visitor to infer them.

Recommended copy direction:

**Eyebrow:** Browser-based quests for real-world venues

**Headline:** Turn a visit into a reason to return.

**Body:** PIKE lets guests scan a marker, play a short quest, and unlock a reward you control—right inside your venue, with no app needed for the first play.

**Primary action:** Create a venue quest  
**Secondary action:** Watch the 1-minute demo

**Practical note:** Set up the quest, print the marker, choose the reward.

Visual composition:

- Use the venue photo as the dominant proof of context.
- Add one compact, grounded annotation pointing to the real marker.
- Replace the current three floating cards with a single phone/demo frame or a real video poster.
- Show one gold reward accent only at the end of the phone flow.

Do not place broad social proof immediately beneath the hero until real customers, partners, or pilot metrics exist.

### 3. One visit, shown end to end

Purpose: make the experience understandable in under 20 seconds of scrolling.

Heading: **One marker. One minute. One more reason to come back.**

Use a horizontal sequence on desktop and a vertical sequence on mobile:

1. **Spot** — “A marker at the table, entrance, exhibit, or counter invites the guest in.”
2. **Scan** — “The quest opens in the phone browser. No download before the first play.”
3. **Play** — “A short, venue-themed prompt turns the space into part of the challenge.”
4. **Return** — “The guest saves a venue-set reward for a future visit.”

Design this as one continuous scene with the quest-trail device. Avoid four equal feature cards. Include the target “under 90 seconds” only as a product goal or demo timing, not as a live performance claim unless measured.

### 4. Why a venue would use it

Purpose: translate the experience into operator value.

Heading: **A loyalty mechanic guests can actually remember.**

Use three editorial proof blocks, each supported by a concrete product control:

- **Create a return trigger** — The reward is for the next visit, not another generic discount at checkout.
- **Make the venue part of the game** — Marker recognition ties the moment to a physical place and a themed experience.
- **Stay in control** — Choose the reward, availability, expiry, and redemption cap.

Below the three blocks, include a compact “Good fit for” line: cafés, museums, attractions, campuses, gyms, and live events. This replaces the current pseudo-social-proof strip and labels categories honestly.

### 5. Quest examples: show personality, not a gallery template

Purpose: demonstrate that the mechanic stays consistent while each venue can feel distinct.

Heading: **The PIKE flow stays familiar. The story belongs to the venue.**

Retain three concepts, but give each a useful micro-brief:

- **The Hidden Table** / café / find a detail in the room / next-visit treat
- **A Doorway Through Time** / museum / reveal an artifact story / return-pass perk
- **The Impossible Shot** / sports venue / complete a skill prompt / concession reward

Label them “concept quest,” not “start quest,” unless they are interactive demos. On desktop, use one large featured example and two smaller supporting examples instead of three identical tall cards. This gives the section hierarchy and avoids the generated gallery look.

### 6. Operator setup and trust

Purpose: answer “Can my team run this?” and “Can people abuse it?” in one practical section.

Heading: **Built to run from the venue, not from an agency.**

Left side: a real dashboard screenshot or faithful product capture.  
Right side: three setup steps.

1. Create the quest and choose a theme.
2. Upload or select a marker and print it.
3. Set the reward rules and publish.

Add a short factual trust row:

- Marker recognition verifies the specific physical target.
- Reward caps and expiry are enforced by the server.
- The first quest works in a supported mobile browser.
- No continuous location tracking is required for the scan flow.

Avoid leading with blockchain, “immutable” records, fraud percentages, ROI, or “laboratory-grade” language. Those details belong in security documentation or a buyer FAQ unless a real enterprise sales need proves otherwise.

### 7. Honest launch invitation and split conversion

Purpose: replace fabricated proof with transparent momentum and give each audience a relevant action.

Opening line: **PIKE is opening its first venue partnerships.**

Business panel:

- Heading: “Bring a quest to your venue.”
- Body: “Create an account to build your first quest, or contact us if you want help planning a pilot.”
- Primary action: Create a business account
- Secondary action: Email the PIKE team

Player panel:

- Heading: “Want to be first to play?”
- Body: “Join the player list and we’ll tell you when new quests open.”
- Action: Join the player waitlist

Keep the footer concise. Remove links to empty “coming soon” company pages until there is meaningful content behind them; retain legal links, contact, business login, accessibility, and copyright.

## 5. Voice and copy rules

### Voice

- Clear before clever.
- Warm and observant, not breathless.
- Specific about actions, places, time, and controls.
- Confident about what exists; transparent about what is pre-launch.
- Written for a busy venue operator, not a Web3 or AR engineer.

### Use more often

- scan a marker
- opens in the browser
- choose the reward
- set a daily cap
- save it for the next visit
- café, museum, attraction, campus, gym, event
- first venue partners / pilot

### Avoid

- seamless, revolutionary, cutting-edge, next-generation
- high-performance venues
- bridge the physical and digital worlds
- unlock engagement
- impossible to spoof
- real-time analytics, unless the exact live capability is shown
- immutable proof of presence on the main marketing page
- multiple variants of “worth coming back for” across the same page

### Content-quality test

Every paragraph should contain at least one concrete noun or action unique to PIKE. If the same paragraph could sell a generic loyalty platform, event app, or marketing agency, rewrite it.

## 6. Interaction and responsive behavior

- Use purposeful motion only for the single scan-to-reward demonstration and small waypoint transitions.
- Remove broad staggered entrances from category tags, feature tiles, and every section heading.
- Keep all essential explanation visible without interaction.
- On mobile, make the end-to-end visit sequence the main story; do not compress desktop dashboard art until labels become unreadable.
- Replace tiny fake dashboard text with a real crop, an enlarged detail, or a simplified faithful diagram.
- Respect reduced-motion preferences by showing the final reward state without timed animation.
- Keep one filled Pike Blue action per viewport wherever practical.

## 7. Implementation plan

### Phase 1 — content and evidence

- Confirm the primary business CTA wording: self-serve account versus assisted pilot.
- Inventory which dashboard and WebAR states are production-real.
- Capture real desktop and mobile product screens.
- Review every numerical or technical claim against `docs/progress.md` and the implemented product.
- Finalize copy in a content-first document before changing layout.

Deliverable: approved page copy and evidence list.

### Phase 2 — information architecture and low-fidelity layout

- Reduce the route to the seven sections above.
- Create desktop and mobile wireframes using real copy lengths.
- Test the first five seconds: category, audience, product loop, and CTA must all be clear.
- Test the first 30 seconds: a viewer should be able to retell the visitor journey without reading the technical section.

Deliverable: annotated wireframes and responsive content order.

### Phase 3 — visual system and asset production

- Build the field-guide composition and waypoint motif.
- Correct the action/reward color roles: blue for actions, gold for rewards.
- Establish a consistent photography crop and treatment.
- Create a real demo poster and product captures.
- Decide whether the existing concept images remain or are replaced by an original venue shoot.

Deliverable: high-fidelity desktop and mobile design.

### Phase 4 — frontend implementation

- Refactor `apps/web/src/app/page.tsx` and split sections into focused components.
- Replace or retire `SocialProofStrip`, `TechnicalAdvantage`, and overlapping trust/value sections.
- Reuse current working account, login, and waitlist destinations.
- Use semantic sections, correct heading order, useful image alternatives, keyboard focus, and reduced-motion behavior.
- Preserve performance by serving correctly sized local assets and avoiding autoplay video on mobile.

Deliverable: responsive Next.js page with passing component tests.

### Phase 5 — validation

- Run visual QA at 360, 390, 768, 1024, and 1440 pixel widths.
- Test light and dark modes if both remain supported.
- Test keyboard navigation, screen-reader landmarks, contrast, and reduced motion.
- Verify all CTA destinations and waitlist success/error states.
- Ask five target users to answer: “What is PIKE?”, “Who is it for?”, and “What would you do next?” after a brief page scan.

Deliverable: launch-ready page and a short findings log.

## 8. Measurement plan

Track only events tied to meaningful decisions:

- hero business CTA click
- demo start and completion
- how-it-works section reached
- business CTA click after operator section
- business registration completed
- player waitlist submitted
- contact/pilot email click

Primary success measure: qualified business registrations from landing-page sessions.  
Secondary measures: demo completion rate and player-waitlist conversion.  
Do not optimize for scroll depth alone; a clearer page may convert with less scrolling.

## 9. Definition of done

The redesign is ready when:

- a first-time visitor can explain PIKE in one sentence after viewing the hero;
- the page has one clear primary audience and one primary conversion path;
- no customer, metric, analytics, or security claim exceeds the implemented product;
- each section adds new information rather than restating the promise;
- product proof is real or explicitly labelled as a concept;
- Pike Blue is used for actions and Smoked Gold is reserved for rewards;
- desktop and mobile layouts feel composed, not merely stacked;
- accessibility and performance checks pass;
- the final page feels rooted in an actual venue visit rather than a SaaS component library.
