import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Security — PIKE" };

export default function SecurityPage() {
  return (
    <LegalPageShell crumb="Legal / Security" title="Security & Vulnerability Disclosure" updated="8 September 2026">
      <h2>How we protect data</h2>
      <ul>
        <li>Encryption in transit (TLS) throughout, and at rest for our databases</li>
        <li>Access to personal data restricted to staff who need it, and logged</li>
        <li>Reward eligibility and redemption caps enforced server-side, never trusted to a device</li>
        <li><strong>We collect no camera imagery, no GPS, and no payment card data</strong> — there is far less to lose</li>
        <li>Written contracts and periodic access review for every processor</li>
      </ul>
      <p>
        No system is perfectly secure. If a breach poses a real risk of harm, we notify the Office of the Data
        Protection Commissioner within 72 hours and affected people without undue delay, as required by section 43
        of the Data Protection Act, 2019.
      </p>

      <h2>Found a vulnerability?</h2>
      <p>
        <strong>Please tell us. We won&apos;t take legal action against you</strong> for good-faith research that
        follows the rules below.
      </p>
      <p>
        <strong>Email:</strong> <a href="mailto:security@pike.app">security@pike.app</a>
        <br />
        <strong>We&apos;ll acknowledge within 3 working days</strong> and keep you updated.
      </p>

      <h3>Please do</h3>
      <ul>
        <li>Report promptly and give us reasonable time to fix it before disclosing publicly</li>
        <li>Use only your own accounts and test data</li>
        <li>Stop as soon as you&apos;ve confirmed a vulnerability exists</li>
      </ul>

      <h3>Please don&apos;t</h3>
      <ul>
        <li>Access, modify or delete other people&apos;s data</li>
        <li>Run denial-of-service tests, spam, or social-engineer our staff or venues</li>
        <li>Physically interfere with markers or venue premises</li>
        <li>Demand payment as a condition of disclosure</li>
      </ul>

      <h3>Out of scope</h3>
      <p>
        Missing best-practice headers with no demonstrable impact · rate-limiting on public marketing pages ·
        vulnerabilities in third-party services we don&apos;t control (report those to them) · anything requiring
        physical access to an unlocked device.
      </p>

      <p>We don&apos;t currently run a paid bounty, but we&apos;ll credit you publicly if you&apos;d like.</p>
    </LegalPageShell>
  );
}
