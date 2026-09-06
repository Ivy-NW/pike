# PIKE verified-footfall landing page plan

Status: proposed plan based on the September 2026 commercial brief  
Scope: venue-facing marketing page in `apps/web`; content, UX, visual direction, technical architecture, performance, and validation. This document does not implement the page.

## 1. Strategic reset

PIKE is not being sold as a consumer quest app on this page. It is being sold as **verified footfall for Nairobi venues**.

The landing page must make this commercial promise clear:

> A venue prints a PIKE marker. A customer scans it inside the venue. PIKE verifies that the phone camera saw that specific physical marker. The venue pays only for verified completions beyond its free monthly allowance.

Audience allocation is deliberate:

- 95% venue owners, operators, event organisers, and commercial partners.
- 5% consumers, limited to one small route-to-`/play` strip.

The primary buyer is an owner-operator of one to three independent restaurants, bars, cafés, or lounges in Nairobi. They are time-poor, sceptical of software pitches, often reading on a mid-range Android phone over a data bundle, and accustomed to paying through M-Pesa.

## 2. Page objective and conversion model

### Primary objective

Generate qualified requests for a free venue marker.

### Primary action

**Get your free marker**

This opens a short lead form—not registration, login, or a dashboard flow.

Required fields:

- Name
- Venue name
- WhatsApp number

Optional field only if the sales process needs it:

- Neighbourhood or event name

The form posts to a stub endpoint in this phase. The UI must clearly confirm submission and explain the next contact step. Do not imply that a marker is dispatched automatically unless that fulfilment process exists.

### Secondary actions

- **Watch a 40-second scan** opens the real scan video.
- **View event packages** routes to a lightweight `/events` stub.
- **Here to play?** routes to a lightweight `/play` stub.
- WhatsApp contact appears with the final CTA.

### Navigation

Keep the header practical and short:

- How it works
- Why it is verified
- Pricing
- What you can measure
- Events
- Get your free marker

Remove business login, account creation, player waitlist, quest galleries, XP, streaks, leaderboards, and app-store messaging from this page.

## 3. Content hierarchy

Use the nine sections from the commercial brief in the exact order below. Header and footer are outside the count.

### Section 1 — Hero

Purpose: explain the payment model, physical mechanism, and low-risk entry offer within the first viewport.

Recommended copy:

**Location label:** Westlands–Parklands, Nairobi

**Headline:** Pay only when someone actually walks in.

**Supporting copy:** Print a PIKE marker for your venue. A customer points their phone at it, sees the reward, and you pay a few shillings only after the camera verifies they were standing there.

**Primary action:** Get your free marker  
**Secondary action:** Watch a 40-second scan

**Trust line:** Your first 100 verified visits are free every month · top up with M-Pesa · no contract · no developer

**Status badge:** Westlands Quest Street is live

Design:

- Copy first on mobile; real scan proof immediately after it.
- Right side on larger screens: muted, looping, `playsInline` footage of a real scan in a real venue.
- Use a lightweight poster image for first paint. Do not download the video before the page is interactive on constrained connections.
- One small annotation may identify the printed marker. Avoid floating cards, fake dashboards, glow, and decorative overlays.
- The marker and phone interaction should be understandable with the video paused.

Content caution:

- “Westlands Quest Street is live” must be confirmed as an active deployment immediately before launch. If it is not live, use “Launching in Westlands–Parklands” instead.
- “A few shillings” is supported by the KES 4–10 effective pack pricing, but the exact free and paid terms should appear nearby or link directly to pricing.

### Section 2 — How it works

Purpose: explain the entire operating model in three steps and no more.

Heading: **Print it. They scan it. You see the visit.**

1. **Print the marker** — Put the supplied poster, table card, or sticker inside your venue.
2. **Your customer scans it** — Their browser opens the experience; they do not need to install an app first.
3. **You get verified footfall** — PIKE records a completion only when the camera recognises your specific marker.

Design:

- Use one continuous horizontal rule on desktop and a vertical rule on mobile.
- Pair each step with a real object: printed card, phone camera, dashboard record.
- Each step gets one sentence. No feature-card grid and no fourth step.

### Section 3 — Anti-cheat proof

Purpose: establish why a PIKE completion is more useful than an ordinary QR scan or GPS check-in. This is a primary sales argument and should receive more space than the general product explanation.

Heading: **The camera has to see the marker in your venue.**

Core explanation:

> A static QR code can be photographed and shared. A GPS check-in can be spoofed. PIKE asks the phone camera to recognise the specific printed marker before a completion is recorded. A screenshot of the access link is not enough.

Supporting control:

> Daily redemption caps are enforced on PIKE’s servers, so a promotion stops at the limit you set.

Design:

- Use a flat three-column comparison: shared QR link, GPS pin, PIKE marker recognition.
- Show what evidence each method provides; do not use fear-based security graphics.
- A simple, factual “does not verify / approximate / verifies marker seen” comparison is preferable to icons with vague labels.
- Use the term “AR” once at most, in a supporting explanation of the reward reveal—not in the headline.

Claim discipline:

- Do not say “impossible to cheat” or promise perfect fraud prevention.
- Clarify in final copy that marker recognition verifies the marker being seen, not a person’s identity or purchase value.
- Keep server-enforced caps separate from marker verification; they solve different risks.

### Section 4 — Pricing

Purpose: make the commercial model understandable without a sales call.

Heading: **Start free. Buy visits when you need more.**

Lead offer:

- One quest
- One marker
- 100 verified completions per calendar month
- Free forever

Prepaid packs:

| Pack | Price | Verified visits | Effective price |
|---|---:|---:|---:|
| Starter | KES 2,000 | 200 | KES 10 each |
| Growth | KES 7,000 | 1,000 | KES 7 each |
| Scale | KES 25,000 | 5,000 | KES 5 each |
| Network | KES 80,000 | 20,000 | KES 4 each |

Commercial terms shown directly beneath the packs:

- Pay with M-Pesa.
- Credits expire 12 months after purchase.
- Prices exclude 16% VAT.
- An eTIMS-compliant invoice is issued for every purchase.
- No subscription and no contract.

Breakeven explanation:

> On the Growth pack, 100 verified visits cost KES 700. If one of those 100 visits would not otherwise have happened, that visit needs to contribute at least KES 700 in gross profit—not simply revenue—for the campaign to break even.

The supplied “1 in 100” line is useful, but it needs this assumption. Publishing it without the KES 700 contribution-margin condition could read as a revenue promise, which PIKE cannot measure.

Design:

- Make the free tier the visual anchor.
- Use a compact comparison table rather than four oversized pricing cards.
- Highlight Growth as the reference calculation, not as “most popular” until purchase data supports that claim.
- Repeat the free-marker CTA after the table.

Before publication, commercial/legal owners must confirm the free allowance, expiry policy, VAT treatment, eTIMS workflow, and pack prices.

### Section 5 — What the venue gets back

Purpose: show attribution strictly as footfall, never revenue.

Heading: **Know what happened after the poster went up.**

Owner-repeatable example:

> 37 people scanned your marker last week. 29 completed. 22 redeemed. 6 had also scanned at another participating venue nearby.

Label these numbers clearly as **Example weekly report** unless they come from a named, consented pilot.

Dashboard content:

- Marker scans
- Verified completions
- Reward redemptions
- Cross-venue visitors
- Date range and venue name

Do not show revenue, attributed sales, average spend, ROI, or “customers acquired.” PIKE observes the visit and reward flow, not the till transaction.

Design:

- Use a real dashboard screenshot when the listed metrics exist.
- If some fields are not implemented, use a clearly labelled product preview and track the missing data work as a launch dependency.
- Ensure the key values remain legible at 360px; use a focused crop rather than shrinking a desktop dashboard.

### Section 6 — Objections and practical answers

Purpose: answer the questions a sceptical operator asks before sharing their WhatsApp number.

Use an accessible accordion on mobile and a two-column question list on wider screens.

Questions and answer direction:

1. **Does my staff have to learn new software?** No. Their only customer-facing task is checking and honouring the reward shown on the customer’s phone.
2. **Does it work on affordable Android phones?** State the tested browser/device baseline, not a universal promise. Name supported Android Chrome versions after device testing.
3. **Can people share or fake the scan?** The camera must recognise the venue’s specific marker, and PIKE enforces redemption caps on the server.
4. **I already have a loyalty card. Why add this?** A loyalty card serves people already buying. PIKE is designed to verify responses to a specific venue promotion, including first-time visits.
5. **What customer data do you collect?** A phone number or social login is requested when a reward is claimed. No continuous location tracking is required.

ODPC language:

- Include “registered with the ODPC” only after the exact registration status and public-facing privacy wording have been verified.
- Link the data answer to the privacy policy.
- Do not imply that registration alone proves compliance with every data-protection obligation.

### Section 7 — Events band

Purpose: route event and sponsorship buyers without diluting the venue page.

Copy direction:

**Running an event instead?** Track verified completions by zone without asking attendees to install an app. Event packages start from KES 20,000.

CTA: **View event packages** → `/events`

The `/events` route is a lightweight stub in this phase, with a concise explanation and enquiry action. It is not a full event landing page.

Confirm the KES 20,000 starting price before publication.

### Section 8 — Consumer strip

Purpose: provide the required 5% consumer route and nothing more.

Copy direction:

**Here to play, not to sell?** PIKE quests begin when you scan a marker at a participating venue. See how quests, rewards, XP, and the app work on the player page. **Go to player guide →**

Link to `/play`.

The `/play` route is a lightweight stub in this phase. Do not place a player form, app-store badge, quest gallery, or player feature grid on the venue landing page.

### Section 9 — Final free-marker CTA

Purpose: convert visitors who now understand verification, price, measurement, and operational effort.

Heading: **Put your first marker to work.**

Supporting copy: Your first marker and first 100 verified visits each month are free. Tell us where to reach you and we’ll help set up the first quest.

Actions:

- Get your free marker
- Chat on WhatsApp

The WhatsApp number and prefilled message must come from configuration, not be repeated as hardcoded copy across components.

Footer:

- PIKE wordmark
- Nairobi, Kenya
- Pricing
- Events
- Player guide
- Privacy
- Terms
- WhatsApp
- Copyright

No login, fake company pages, fake press links, or player waitlist.

## 4. Visual direction

### Concept: the verified-visit ledger

The visual system should feel like a clean operational record assembled from real venue evidence: marker, phone, timestamp, completion, and price. It should be recognisably Kenyan through locations, currency, payment method, language rhythm, and real photography—not decorative safari motifs or generic “African tech” styling.

### Composition

- Mobile-first at 360px.
- Flat sections separated by generous space and hairline rules.
- Asymmetric editorial layouts may appear at tablet/desktop sizes, but mobile reading order remains copy-first.
- Use small timestamps, location labels, and verification statuses as the recurring visual language.
- Avoid repeated rounded cards. Use tables, rules, captions, and aligned data columns where the content is operational.
- No gradients, glow, decorative shadows, glass panels, or floating UI.
- Only functional focus rings may use a high-contrast outline effect.

### Typography

- Continue using the repository’s self-hosted fonts.
- Use only regular and medium weights on this page.
- Sentence case everywhere, including navigation, buttons, table headings, and labels.
- Use the display face sparingly; pricing, FAQs, and body copy should prioritise fast reading on a small screen.
- Minimum practical body size: 16px; supporting text should generally remain at least 14px.

### Colour

- Every colour must come through semantic CSS custom properties.
- Do not edit generated `theme.css` directly.
- Pike Blue: actions, links, verified states.
- Warm paper and ink: dominant surfaces and copy.
- Gold: reward reveal only, not pricing or CTAs.
- Success colour: confirmed completion/cap status only.
- Dark mode, if retained, must preserve the same hierarchy and WCAG AA contrast.

### Photography and video

Allowed:

- Real Nairobi venues
- Real PIKE markers on real tables, counters, doors, or event zones
- Real scan and reward-reveal footage
- Real dashboard captures

Not allowed:

- Existing cinematic concept artwork presented as evidence
- AI-generated venue scenes
- Generic stock hospitality photography
- People wearing headsets
- Fabricated partner imagery

If verified real assets are unavailable, use typography, a marker close-up, and faithful product UI. “Nothing” is preferable to false proof.

## 5. Copy system

### Voice

- Plain, confident, and specific.
- Written for an operator standing in their venue.
- Short sentences and visible numbers.
- Use contractions naturally.
- Explain the physical action before the underlying technology.
- Frame all measurement as footfall and reward activity.

### Banned language

Do not use:

- engagement
- platform
- digital transformation
- loyalty programme
- seamless
- unlock
- empower
- leverage
- immersive
- metaverse
- revolutionise

Also avoid “high-performance venues,” “impossible to spoof,” “revenue lift,” “increased spend,” and any invented adoption statistic.

Use “AR” no more than once on the whole page.

### Content architecture

Extract all frequently changing copy and commercial values from JSX into a typed module such as:

`apps/web/src/content/landing.ts`

This module should contain:

- hero and trust-line copy
- live/launch status wording
- pricing packs and VAT/expiry notes
- example dashboard metrics
- FAQs
- event starting price
- contact and WhatsApp copy

Commercial terms should render from one source so a price or allowance cannot drift between sections.

## 6. Technical implementation plan

Match the current repository: Next.js 14, React, TypeScript, CSS Modules, and the shared design tokens. Do not introduce Tailwind for one page.

Recommended structure:

```text
apps/web/src/
├── app/
│   ├── page.tsx
│   ├── events/page.tsx
│   ├── play/page.tsx
│   └── api/free-marker/route.ts
├── components/landing/
│   ├── LandingHeader.tsx
│   ├── VerifiedFootfallHero.tsx
│   ├── HowItWorks.tsx
│   ├── AntiCheatProof.tsx
│   ├── Pricing.tsx
│   ├── Attribution.tsx
│   ├── Objections.tsx
│   ├── AudienceRoutes.tsx
│   ├── FreeMarkerForm.tsx
│   └── LandingFooter.tsx
└── content/
    └── landing.ts
```

Use server components by default. Client components should be limited to:

- free-marker form state
- FAQ disclosure behaviour, if native `<details>` is insufficient
- deferred video playback
- mobile navigation, if required
- the single PostHog event boundary

### Lead endpoint

Add a same-origin stub route such as `POST /api/free-marker` that:

- accepts name, venue name, WhatsApp number, and optional neighbourhood;
- trims and validates values server-side;
- rate-limits or clearly marks the lack of production rate limiting;
- returns a generic success response;
- does not log the WhatsApp number in plaintext;
- includes an explicit TODO for CRM/storage integration.

The existing email-only waitlist endpoint does not fit this lead form and should not be reused.

### `/events` and `/play`

Create accessible, indexable stubs that confirm the visitor is in the correct place and provide one onward action. Keep them visually consistent, but do not build full secondary landing pages in this scope.

### Dynamic printed links

Any URL encoded into a printed marker, QR fallback, short code, or campaign material must resolve through PIKE’s dynamic-link service so its destination can change without reprinting. Marketing navigation links such as `/pricing`, `/events`, and `/play` are ordinary site routes and do not require dynamic-link indirection.

If the dynamic-link service does not yet exist, record it as a launch dependency; do not hardcode final destinations into generated print assets.

## 7. Performance plan

### Budget definition

The 500KB first-load budget should apply to compressed HTML, route JavaScript, route CSS, fonts required above the fold, and the hero poster—not the deferred video bytes. Track the video separately.

Targets:

- Marketing route first-load transfer: ≤500KB compressed.
- Time to interactive on a mid-range Android device over 4G: ≤2.5 seconds.
- No client-side fetch above the fold.
- No third-party scripts except one minimal PostHog integration.
- No font CDN or chat/heatmap widget.

### Media loading

- Convert approved photography and posters to AVIF/WebP with an appropriate fallback.
- Provide explicit intrinsic dimensions and responsive `sizes`.
- Lazy-load all images below the fold.
- Do not use the current multi-megabyte PNG files directly on the route.
- The hero should paint from a lightweight poster first.
- Load/autoplay the muted loop only after first interaction readiness and when `Save-Data` is off.
- On slow effective connections, retain the poster and expose a tap-to-play control.
- Use `preload="none"` or `metadata` until the media-loading gate allows playback.

The current one-minute MP4 is about 1.1MB and the current PNG assets are roughly 1.8–2.5MB each. They cannot be counted as unconditional first-load assets under the new budget.

### CI budget check

Add a script that runs after the production build and fails when the landing route exceeds the defined compressed transfer budget. The script should read Next.js build manifests/output, total the landing route’s shared and route-specific JS/CSS, add the generated HTML and designated hero poster/font assets, gzip or Brotli-measure them consistently, and print a per-category breakdown.

Suggested commands:

- `npm run build:web`
- `npm run test --workspace apps/web`
- `npm run check:landing-budget --workspace apps/web`

Do not use a source-directory byte count; it does not represent network transfer.

## 8. Accessibility and Android-first requirements

- Start layout decisions at 360px, then validate 390px, 768px, 1024px, and 1440px.
- Test without hover and with a coarse pointer.
- Keep tap targets at least 44px high.
- Use semantic sections and one logical heading hierarchy.
- Forms require persistent visible labels, input purpose/autocomplete attributes, inline error association, and an `aria-live` result.
- Use native `<details>/<summary>` for objections where possible.
- Video requires accessible controls, captions/transcript if speech carries information, and a poster that communicates the basic mechanism.
- Do not require motion to understand the scan flow.
- Respect reduced motion, reduced data, and high-contrast/focus states.
- Check WCAG AA contrast in both themes.
- Test on at least one low/mid-range physical Android device before launch; responsive desktop emulation alone does not validate decode, playback, or interaction cost.

## 9. Analytics

Use one PostHog integration and track only commercial decisions:

- free-marker CTA clicked, with section location
- free-marker form started
- free-marker form submitted successfully
- scan video started and completed
- pricing reached
- pack selected or enquiry started
- FAQ opened, by question key
- event route clicked
- WhatsApp contact clicked

Do not send names, venue names, phone numbers, or free-form form values to analytics.

Primary success measure: qualified free-marker enquiries.  
Secondary measures: form completion rate, video completion rate, pricing-to-form conversion, and WhatsApp contact rate.

## 10. Dependencies and claim verification

Before the page can publish, confirm:

- Westlands Quest Street deployment status
- Free tier and all prepaid pack terms
- M-Pesa top-up flow
- VAT-exclusive display and eTIMS invoicing process
- ODPC registration wording
- Which dashboard metrics are implemented and accurate
- Supported Android/browser baseline
- Event package starting price
- Public WhatsApp number and approved prefilled message
- Dynamic-link service availability for printed material
- Real Nairobi venue photography and scan footage rights
- PostHog consent/privacy implementation

Unconfirmed items should use clearly marked launch-safe alternatives, not optimistic claims.

## 11. Delivery sequence

### Phase 1 — commercial and evidence lock

- Confirm all items in the dependency list.
- Approve the exact pricing and breakeven explanation.
- Inventory real marker, scan, reward, and dashboard assets.
- Decide whether “live” or “launching” is accurate for Westlands Quest Street.

Deliverable: signed-off claims sheet and asset list.

### Phase 2 — copy and wireframes

- Finalise the typed content module before JSX layout work.
- Produce 360px mobile and 1440px desktop wireframes using final copy.
- Prototype the hero poster/video loading states and free-marker form.
- Validate the nine-section hierarchy with three to five Nairobi venue operators.

Deliverable: approved content and annotated responsive wireframes.

### Phase 3 — asset and route preparation

- Produce AVIF/WebP media variants and video poster.
- Capture or prepare the footfall dashboard evidence.
- Create `/events` and `/play` stubs.
- Create and test the same-origin lead-form stub.

Deliverable: production-ready assets, stubs, and form contract.

### Phase 4 — landing-page implementation

- Build server-first section components under `components/landing/`.
- Remove the current player waitlist, theme gallery, business-login path, and venue-account CTAs from the landing route.
- Implement the pricing table, attribution evidence, objection block, and audience bands.
- Add PostHog events without transmitting lead data.

Deliverable: responsive Next.js implementation.

### Phase 5 — performance, accessibility, and field validation

- Add the 500KB CI budget check.
- Run unit/integration tests and the production build.
- Test keyboard, headings, focus, form errors, video fallback, reduced motion, and dark mode.
- Test 360px layout and a Tecno Spark-class or comparable Android device on throttled 4G.
- Confirm page responsiveness while standing in a typical venue network environment.

Deliverable: launch report with bundle breakdown, device results, and unresolved limitations.

## 12. Definition of done

The page is ready when:

- the first viewport says “verified footfall,” explains the physical marker, shows the free offer, and provides the lead CTA;
- at least 95% of the visible page content serves venue or event buyers;
- the consumer presence is limited to the `/play` strip and evidence of the scan experience;
- pricing is entirely in KES and all commercial terms are visible;
- the anti-cheat section distinguishes marker recognition from static QR and GPS without making an absolute fraud claim;
- attribution is framed only as footfall and reward activity;
- every number is either verified or visibly labelled as an example;
- no banned words appear in rendered landing-page copy;
- no fake customer logos, testimonials, adoption counts, or revenue claims appear;
- the free-marker form collects only the approved fields and handles errors accessibly;
- `/events` and `/play` exist as focused stubs;
- real Nairobi imagery is used, or the design relies on product/marker evidence instead;
- first-load transfer is no more than 500KB under the documented calculation;
- time to interactive meets the 2.5-second target on the agreed Android/4G test setup;
- automated tests, production build, accessibility checks, and budget CI all pass.
