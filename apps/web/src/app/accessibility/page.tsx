import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Accessibility — PIKE" };

export default function AccessibilityPage() {
  return (
    <LegalPageShell
      crumb="Legal / Accessibility"
      title="Accessibility Statement"
      updated="8 September 2026"
      intro="We want PIKE to work for as many people as possible."
    >
      <h2>What we&apos;re aiming for</h2>
      <p>
        We work toward <strong>WCAG 2.1 Level AA</strong> on our website and app: sufficient colour contrast,
        keyboard navigation, screen-reader labelling, text that resizes, and clear focus states.
      </p>

      <h2>Where we fall short, honestly</h2>
      <p>
        <strong>Marker scanning requires sight and a steady camera.</strong> That is a real limitation of the
        technology, not an oversight. A quest cannot currently be completed by someone who is blind, and we
        don&apos;t want to pretend otherwise.
      </p>
      <p>What we do instead:</p>
      <ul>
        <li>Reward terms, quest descriptions and the reward reveal are all available as text and work with a screen reader</li>
        <li>Rewards can be redeemed by showing the reward screen, which is fully accessible</li>
        <li>
          <strong>If you can&apos;t complete a scan for accessibility reasons, email <a href="mailto:support@pike.app">support@pike.app</a></strong> and
          we will issue the reward manually. No proof required beyond telling us the venue and the quest.
        </li>
      </ul>
      <p>Other known gaps: [list from most recent accessibility audit].</p>

      <h2>Tell us</h2>
      <p>
        If something doesn&apos;t work for you: <a href="mailto:accessibility@pike.app">accessibility@pike.app</a>.
        We aim to respond within 5 working days.
      </p>
    </LegalPageShell>
  );
}
