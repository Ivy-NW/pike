import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Acceptable Use — PIKE" };

export default function AcceptableUsePage() {
  return (
    <LegalPageShell
      crumb="Legal / Acceptable Use"
      title="Acceptable Use Policy"
      updated="8 September 2026"
      intro="This expands section 7 of the Visitor Terms of Service. Breaking these rules can cost you your rewards and your account."
    >
      <h2>Don&apos;t fake a visit</h2>
      <p>The whole point of PIKE is proving you were actually there.</p>
      <ul>
        <li>Don&apos;t photograph, screenshot, print or copy a marker to scan it somewhere else</li>
        <li>Don&apos;t scan a marker shown to you on someone else&apos;s screen</li>
        <li>Don&apos;t use a second phone, an emulator, a virtual camera or a modified app</li>
        <li>Don&apos;t create multiple accounts</li>
      </ul>

      <h2>Don&apos;t farm rewards</h2>
      <ul>
        <li>One completion per marker per person per cooldown window. Don&apos;t work around it.</li>
        <li>Don&apos;t automate anything — no bots, no scripts, no scheduled scanning</li>
        <li>Don&apos;t sell, trade or give away rewards, codes or accounts</li>
      </ul>

      <h2>Don&apos;t damage the physical stuff</h2>
      <p>Markers are the venue&apos;s property and ours. Don&apos;t deface, cover, move or remove them.</p>

      <h2>Be decent</h2>
      <ul>
        <li>No display name that is abusive, obscene, discriminatory, impersonating, or that contains someone&apos;s contact details</li>
        <li>No harassing other users through leaderboards or any other feature</li>
        <li>Follow venue staff instructions. They can refuse service, and that&apos;s their right.</li>
      </ul>

      <h2>Don&apos;t attack the service</h2>
      <p>
        No probing, scraping, reverse-engineering, or attempting to bypass fraud controls, caps or verification.
        If you find a security flaw, tell us — see <a href="/security">/security</a>. We&apos;d much rather hear
        from you.
      </p>

      <h2>What happens</h2>
      <div className="legal-content__table-wrap">
        <table>
          <thead>
            <tr><th>Severity</th><th>What we do</th></tr>
          </thead>
          <tbody>
            <tr><td>Likely accidental</td><td>Reject the completion, tell you why</td></tr>
            <tr><td>Repeated or deliberate</td><td>Cancel unredeemed rewards, reset XP, remove from leaderboards</td></tr>
            <tr><td>Serious or persistent</td><td>Suspend, then permanently close the account</td></tr>
            <tr><td>Fraud at scale</td><td>Close the account and, where warranted, report it</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        <strong>Appeals:</strong> email <a href="mailto:support@pike.app">support@pike.app</a>. A person reviews it,
        not a system. You have that right under section 35 of the Data Protection Act, 2019 where the original
        decision was automated.
      </p>
    </LegalPageShell>
  );
}
