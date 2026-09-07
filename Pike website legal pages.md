# PIKE — Website Legal & Information Pages

**Draft v1.0 · For legal review before publication**

> **STATUS: DRAFT.** `[SQUARE BRACKETS]` are placeholders. *Italic asides* are internal notes — delete before publishing.
>
> These are the pages your Privacy Policy and Terms already point at but which don't exist yet, plus the ones a Kenyan site should carry. Each is short by design. A wall of text nobody reads is not compliance.

---

## Site map: what goes where

**Footer, every page:**

`Privacy` · `Terms` · `Cookies` · `Acceptable Use` · `Security` · `Accessibility` · `Contact` · `Supported devices` · `Report a problem`

**Legal index page at `/legal`** listing everything below with last-updated dates. One place your advocate, a venue's lawyer, or the ODPC can find the whole set.

| Page | URL | Referenced by |
|---|---|---|
| Privacy Policy | `/privacy` | Everything |
| Cookie & Storage Policy | `/cookies` | Privacy §11, cookie banner |
| Sub-processor list | `/privacy/processors` | Privacy §7 |
| Terms of Service (Visitors) | `/terms` | App, claim flow |
| Customer Terms (Venues) | `/terms/business` | Dashboard signup |
| Acceptable Use Policy | `/acceptable-use` | Visitor ToS §7 |
| Reward Terms & FAQ | `/rewards` | Claim screen |
| Supported Devices | `/devices` | Visitor ToS §8, scan failure screen |
| Website Terms of Use | `/website-terms` | Footer |
| Security & Vulnerability Disclosure | `/security` | Footer |
| Copyright & Takedown | `/copyright` | Risk Register item 8 |
| Accessibility Statement | `/accessibility` | Footer |
| Your Data (rights request) | `/your-data` | Privacy §10 |
| Complaints | `/complaints` | Both ToS |
| Contact & Legal Notices | `/contact` | Footer |

---
---

# 1. Cookie & Storage Policy

**URL:** `/cookies` · **Effective:** [DATE]

## What we store on your device

PIKE uses a small amount of browser and app storage. **We do not use advertising cookies, tracking pixels for ad networks, or cross-site tracking of any kind.**

### Strictly necessary — always on

| What | Why | How long |
|---|---|---|
| Session identifier | Lets a scan be completed and a reward issued to the right person | Until you close the browser, or 24 hours |
| Security token | Prevents request forgery and protects your reward from being claimed by someone else | Session |
| Login state | Keeps you signed in | 30 days |
| Camera-explainer flag | So we don't show you the same explainer twice | 90 days |

These cannot be turned off. Without them, scanning doesn't work.

### Analytics — we ask first

| What | Why | How long |
|---|---|---|
| Pseudonymous analytics ID | Counts unique scanners and shows us where the funnel breaks | 12 months |
| Performance data | Load times, scan success rate by device model | 12 months |

We ask for your consent before setting these. If you decline, PIKE works exactly the same — we just count you as a number rather than a returning number.

### Preferences

Language, and whether you've dismissed a notice. Stored locally, never sent to us.

## Managing this

- **In PIKE:** Settings → Privacy → Analytics
- **In your browser:** clear site data for [DOMAIN]. This will lose any reward in progress.
- **In the app:** uninstalling removes everything stored locally.

## Third parties

Our analytics provider and error tracker set storage on our behalf, under contracts that forbid them using it for their own purposes. The current list is at `/privacy/processors`.

Questions: privacy@[DOMAIN]

---

### Cookie banner copy

*[Keep it to two lines. A modal that blocks a 90-second scan flow will destroy your funnel — show the banner on the website, and use the in-scan consent moment for the WebAR page instead.]*

> **We use a little storage to make PIKE work.** The necessary bits keep your scan and reward working. We'd also like to count visits so we can fix what's broken — only with your OK.
>
> `[ Accept all ]` `[ Necessary only ]` `[ What's this? ]`

---
---

# 2. Sub-processor List

**URL:** `/privacy/processors` · **Last updated:** [DATE]

These are the companies that process personal data on our behalf. Each works under a written contract meeting section 42 of the Data Protection Act, 2019, and may only use the data to provide their service to us.

| Provider | What they do | Data involved | Location |
|---|---|---|---|
| [HOSTING] | Application servers and database | All service data | [REGION] |
| [CDN] | Delivers the scan page and AR assets | IP address, device type | Global edge |
| [AUTH] | Phone and social login | Phone number or social ID | [REGION] |
| [SMS] | One-time verification codes | Phone number | Kenya |
| [ANALYTICS] | Product analytics | Pseudonymous ID, events | [REGION] |
| [PUSH] | App notifications | Device push token | Global |
| [ERROR TRACKING] | Crash diagnostics | Device and error data | [REGION] |
| [PAYMENTS AGGREGATOR] | Venue payments | Venue billing data only | Kenya |
| Safaricom (M-Pesa) | Venue payments | Venue billing data only | Kenya |
| [PRINT PARTNER] | Marker printing and delivery | Venue delivery details only | Kenya |

**We do not send visitor personal data to our AI provider.** It receives only venue-supplied text prompts for drafting quest copy.

**Changes:** we'll update this page and note the change date. For material additions we'll notify account holders in advance.

*[Internal: this page is a commitment. Nobody adds a vendor that touches personal data without updating it. Put it in the deployment checklist.]*

---
---

# 3. Acceptable Use Policy

**URL:** `/acceptable-use` · **Effective:** [DATE]

This expands section 7 of the Visitor Terms of Service. Breaking these rules can cost you your rewards and your account.

## Don't fake a visit

The whole point of PIKE is proving you were actually there.

- Don't photograph, screenshot, print or copy a marker to scan it somewhere else
- Don't scan a marker shown to you on someone else's screen
- Don't use a second phone, an emulator, a virtual camera or a modified app
- Don't create multiple accounts

## Don't farm rewards

- One completion per marker per person per cooldown window. Don't work around it.
- Don't automate anything — no bots, no scripts, no scheduled scanning
- Don't sell, trade or give away rewards, codes or accounts

## Don't damage the physical stuff

Markers are the venue's property and ours. Don't deface, cover, move or remove them.

## Be decent

- No display name that is abusive, obscene, discriminatory, impersonating, or that contains someone's contact details
- No harassing other users through leaderboards or any other feature
- Follow venue staff instructions. They can refuse service, and that's their right.

## Don't attack the service

No probing, scraping, reverse-engineering, or attempting to bypass fraud controls, caps or verification. If you find a security flaw, tell us — see `/security`. We'd much rather hear from you.

## What happens

| Severity | What we do |
|---|---|
| Likely accidental | Reject the completion, tell you why |
| Repeated or deliberate | Cancel unredeemed rewards, reset XP, remove from leaderboards |
| Serious or persistent | Suspend, then permanently close the account |
| Fraud at scale | Close the account and, where warranted, report it |

**Appeals:** email support@[DOMAIN]. A person reviews it, not a system. You have that right under section 35 of the Data Protection Act, 2019 where the original decision was automated.

---
---

# 4. Reward Terms & FAQ

**URL:** `/rewards` · **Effective:** [DATE]

*[Plain-language version of Visitor ToS §4. This is the page you link from the claim screen. If a visitor reads one legal page, it's this one.]*

## The one thing to know

**The venue gives you the reward. We just prove you showed up.**

PIKE verifies you were physically there and issues the reward record. The venue funds it and hands it over. That means the venue sets the terms — what it is, what you might need to buy, which days it's valid, when it runs out.

## FAQ

**What's a reward worth in cash?**
Nothing. Rewards aren't money, can't be exchanged for money, and can't be refunded. They're a promotional benefit.

**Can I give mine to a friend?**
No. Rewards are tied to your claim and can't be transferred, sold or shared. Your friend can scan the same marker and get their own.

**Can everyone at my table scan the same marker?**
Yes. Caps are per person, not per marker. Everyone gets their own reward.

**How long do I have?**
Each reward shows its own expiry before you claim it. Once it expires we can't bring it back, so check before you claim.

**Can I use it with another offer?**
Only if the venue says so. Assume no unless stated.

**The venue said the daily limit was reached.**
Venues set a maximum number of rewards per day so a promotion doesn't run away from them. If you hit the cap, the quest tells you before you complete it. Come back tomorrow.

**The venue won't honour my reward.**
Email support@[DOMAIN] with the venue, the date and the reward. We'll take it up with them. We can't force a venue to serve you and we don't pay out cash, but repeated failures get a venue removed from PIKE — and where it's our fault, we'll usually replace the reward.

**My scan failed.**
Try again with more light and the whole marker in frame. If it still fails, check `/devices` — some older handsets aren't supported. Tell us at support@[DOMAIN] and include your phone model; it genuinely helps us fix it.

**Can my reward be cancelled?**
Only if it was issued in error — a bug, a misconfigured quest, or a completion our fraud checks flag. We'll tell you why.

**What are XP, levels and streaks worth?**
Bragging rights. They're reputational only, not currency, and can't be exchanged for anything.

**Do I have to install the app?**
No. Scanning and claiming work in your browser. The app just keeps your rewards and progress in one place.

**Is there an age limit?**
Yes, 18+. Quests at venues serving alcohol require an age check.

---
---

# 5. Supported Devices

**URL:** `/devices` · **Last updated:** [DATE]

*[Internal: this page is referenced from Visitor ToS §8 and from the scan-failure screen. Populate it from real device-matrix results — do not guess. Publishing an honest failure boundary is better than a hang with no explanation. Update after every release.]*

## What you need

- A smartphone with a working rear camera
- **Android 9 or newer** with Chrome, or **iOS 14 or newer** with Safari
- Camera permission granted in your browser
- A working data or wifi connection

## Tested and working

| Brand | Models |
|---|---|
| Samsung | [A15, A25, A35, S-series — confirm from testing] |
| Tecno | [Spark 20/30, Camon 20/30 — confirm] |
| Infinix | [Hot 40/50, Note series — confirm] |
| Oppo | [A38, A58 — confirm] |
| Apple | [iPhone 11 and newer — confirm] |
| Xiaomi / Redmi | [confirm] |

## Known not to work

[itel and Tecno Pop class devices, and other entry-level handsets below our tested floor. List them specifically. "Know exactly where the product stops working and say so honestly."]

## If your scan won't work

1. **More light.** Marker AR struggles in dim rooms and in direct glare.
2. **Whole marker in frame**, roughly straight on, about arm's length.
3. **Steady phone.** Give it two seconds.
4. **Check camera permission** in your browser settings.
5. **Clean the lens.** Genuinely the fix more often than you'd think.

Still failing? Email support@[DOMAIN] with your phone model and the venue. We track failures by handset and it's how the list above gets better.

---
---

# 6. Website Terms of Use

**URL:** `/website-terms` · **Effective:** [DATE]

*[Distinct from the service terms. Covers people who just browse the site — journalists, investors, a venue owner reading the price card. Short is correct here.]*

This website is operated by **[REGISTERED COMPANY NAME]**, company number [NUMBER], of [ADDRESS, NAIROBI].

**Using PIKE itself** is governed by our Terms of Service — `/terms` for visitors, `/terms/business` for venues. These website terms cover browsing this site.

1. **Content is for information.** We try to keep it accurate and current but make no promise that it is. Prices, features and availability change. Nothing here is an offer capable of acceptance, or professional advice of any kind.
2. **Our content is ours.** Text, design, logos, images and code on this site belong to us or our licensors. You may read, share links, and quote briefly with attribution. You may not copy substantial parts, scrape the site, or use our brand as your own.
3. **Third-party links** are provided for convenience. We don't control or endorse those sites.
4. **Availability.** We may change or take down the site at any time without notice.
5. **Liability.** To the extent permitted by law, we're not liable for loss arising from your use of, or reliance on, this website. Nothing limits liability for fraud, death or personal injury caused by negligence, or anything that can't be limited under Kenyan law.
6. **Law.** The laws of Kenya, and the courts of Kenya.

---
---

# 7. Security & Vulnerability Disclosure

**URL:** `/security` · **Last updated:** [DATE]

## How we protect data

- Encryption in transit (TLS) throughout, and at rest for our databases
- Access to personal data restricted to staff who need it, and logged
- Reward eligibility and redemption caps enforced server-side, never trusted to a device
- **We collect no camera imagery, no GPS, and no payment card data** — there is far less to lose
- Written contracts and periodic access review for every processor

No system is perfectly secure. If a breach poses a real risk of harm, we notify the Office of the Data Protection Commissioner within 72 hours and affected people without undue delay, as required by section 43 of the Data Protection Act, 2019.

## Found a vulnerability?

**Please tell us. We won't take legal action against you** for good-faith research that follows the rules below.

**Email:** security@[DOMAIN] *(PGP key: [LINK], optional)*
**We'll acknowledge within 3 working days** and keep you updated.

### Please do
- Report promptly and give us reasonable time to fix it before disclosing publicly
- Use only your own accounts and test data
- Stop as soon as you've confirmed a vulnerability exists

### Please don't
- Access, modify or delete other people's data
- Run denial-of-service tests, spam, or social-engineer our staff or venues
- Physically interfere with markers or venue premises
- Demand payment as a condition of disclosure

### Out of scope
Missing best-practice headers with no demonstrable impact · rate-limiting on public marketing pages · vulnerabilities in third-party services we don't control (report those to them) · anything requiring physical access to an unlocked device.

We don't currently run a paid bounty, but we'll credit you publicly if you'd like.

---
---

# 8. Copyright & Takedown

**URL:** `/copyright` · **Effective:** [DATE]

*[Referenced by Legal Risk Register item 8. Venues upload imagery for markers and it gets physically printed and displayed in public. You need a route for a rights-holder to reach you fast.]*

## Reporting infringement

If you believe material displayed by PIKE — on a marker, in a quest, in an AR skin, or on this site — infringes your rights, email **legal@[DOMAIN]** with:

1. What the material is and where you saw it (venue name, quest name, or URL — a photo helps)
2. What work of yours it infringes, and proof you own or control the rights
3. Your name and contact details
4. A statement that you believe in good faith the use isn't authorised
5. A statement that the information is accurate

**We acknowledge within 3 working days.** Where a claim is well-founded, we remove the material and require the venue to remove and destroy any printed assets carrying it.

## For venues

You warranted, when you uploaded, that you own or are licensed to use the image. If we receive a valid complaint we may take your marker down immediately, and you indemnify us against the claim under section 5.2 of the Customer Terms.

**This is why our upload check exists.** If the dashboard warns you about an image, it isn't being fussy.

## Counter-notice

If your material was removed and you believe that was wrong, email legal@[DOMAIN] explaining why, with evidence of your rights. We'll review and restore if the objection holds.

Governed by the **Copyright Act, 2001**.

---
---

# 9. Accessibility Statement

**URL:** `/accessibility` · **Last updated:** [DATE]

We want PIKE to work for as many people as possible.

## What we're aiming for

We work toward **WCAG 2.1 Level AA** on our website and app: sufficient colour contrast, keyboard navigation, screen-reader labelling, text that resizes, and clear focus states.

## Where we fall short, honestly

**Marker scanning requires sight and a steady camera.** That is a real limitation of the technology, not an oversight. A quest cannot currently be completed by someone who is blind, and we don't want to pretend otherwise.

What we do instead:
- Reward terms, quest descriptions and the reward reveal are all available as text and work with a screen reader
- Rewards can be redeemed by showing the reward screen, which is fully accessible
- **If you can't complete a scan for accessibility reasons, email support@[DOMAIN]** and we will issue the reward manually. No proof required beyond telling us the venue and the quest.

Other known gaps: [LIST FROM AUDIT].

## Tell us

If something doesn't work for you: accessibility@[DOMAIN]. We aim to respond within 5 working days.

---
---

# 10. Your Data — rights request page

**URL:** `/your-data` · **Effective:** [DATE]

Under the Data Protection Act, 2019 you can ask us to:

| Right | What it means |
|---|---|
| **See it** | Get a copy of the personal data we hold about you |
| **Correct it** | Fix anything wrong or incomplete |
| **Delete it** | Remove it, unless we're legally required to keep it |
| **Object** | Tell us to stop processing based on our legitimate interests |
| **Restrict** | Pause processing while a dispute is sorted out |
| **Export it** | Receive it in a machine-readable format |
| **Withdraw consent** | For anything you consented to, at any time |

## How

**In the app:** Settings → Privacy → Your data. Fastest route.
**By email:** privacy@[DOMAIN]
**By post:** [ADDRESS]

**No charge. No need to explain why.** We may ask you to confirm you control the phone number or social account, so we don't hand your data to someone else.

**Timing:** acknowledgement within 7 days, resolution within 30 days as the Act requires. If a request is complex we'll tell you and explain the delay.

## What we hold

Mostly less than you'd expect: your phone number or social identifier, your rewards, your XP and streaks, and a log of which markers you scanned and when. **No camera images. No GPS. No record of what you spent.**

## Not happy?

Contact us first at privacy@[DOMAIN] — most things are fixable quickly. You can also complain to the **Office of the Data Protection Commissioner** at any time: [ODPC CONTACT / PORTAL].

---
---

# 11. Complaints

**URL:** `/complaints` · **Effective:** [DATE]

## Something went wrong — tell us

| Issue | Where |
|---|---|
| A venue didn't honour a reward | support@[DOMAIN] |
| A scan won't work | support@[DOMAIN] with your phone model |
| Your account was suspended | support@[DOMAIN] — a person reviews every appeal |
| Something about your data | privacy@[DOMAIN] |
| A quest that felt unsafe or irresponsible | support@[DOMAIN] |
| A security vulnerability | security@[DOMAIN] |
| An infringement claim | legal@[DOMAIN] |
| A billing dispute (venues) | billing@[DOMAIN] — within 30 days of the invoice |

**We acknowledge within 3 working days** and aim to resolve within 14.

## If we can't resolve it

- **Data matters:** Office of the Data Protection Commissioner — [CONTACT]
- **Consumer matters:** [relevant Kenyan consumer protection authority — confirm current body with counsel]
- **Venue and organiser disputes:** escalation and arbitration as set out in the Customer Terms, section 16
- **Courts of Kenya** remain available to you throughout

## Reporting a quest

We take this seriously. Tell us if you ever see a PIKE quest that appears aimed at under-18s, encourages drinking more or faster, promises something the venue won't deliver, or requires anything unsafe. **We remove quests like this and take it up with the venue.**

---
---

# 12. Contact & Legal Notices

**URL:** `/contact` · **Last updated:** [DATE]

**[REGISTERED COMPANY NAME]**
[REGISTERED ADDRESS, NAIROBI, KENYA]

| | |
|---|---|
| Company number | [NUMBER] |
| KRA PIN | [PIN] |
| VAT number | [NUMBER] |
| ODPC registration | [NUMBER] |
| Data Protection Officer | [NAME / ROLE] |

| Purpose | Contact |
|---|---|
| Visitor support | support@[DOMAIN] |
| Venue and organiser sales | hello@[DOMAIN] · [WHATSAPP] |
| Billing | billing@[DOMAIN] |
| Privacy and data rights | privacy@[DOMAIN] |
| Security | security@[DOMAIN] |
| Legal and copyright | legal@[DOMAIN] |
| Accessibility | accessibility@[DOMAIN] |
| Press | press@[DOMAIN] |

*[Internal: every one of these addresses must actually reach a monitored inbox before launch. A published privacy@ address that bounces is a compliance failure in itself. Aliases to a shared inbox are fine.]*

---
---

# Pre-launch checklist

- ☐ Every `[PLACEHOLDER]` filled
- ☐ Every *italic internal note* deleted
- ☐ Every email address live and monitored
- ☐ Every cross-reference URL resolves
- ☐ Supported-devices page populated from **real** device-matrix results
- ☐ Sub-processor list matches what's actually deployed
- ☐ Accessibility gaps listed from a real audit, not assumed
- ☐ Advocate has reviewed Privacy, both ToS, Acceptable Use and Copyright
- ☐ Version numbers and effective dates consistent across all pages
- ☐ `/legal` index page live with last-updated dates
- ☐ Archive of superseded versions in place
- ☐ Owner assigned for keeping these current