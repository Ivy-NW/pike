import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Cookies — PIKE" };

export default function CookiesPage() {
  return (
    <LegalPageShell
      crumb="Legal / Cookies"
      title="Cookie & Storage Policy"
      updated="8 September 2026"
      intro="PIKE uses a small amount of browser and app storage. We do not use advertising cookies, tracking pixels for ad networks, or cross-site tracking of any kind."
    >
      <h2>Strictly necessary — always on</h2>
      <div className="legal-content__table-wrap">
        <table>
          <thead>
            <tr><th>What</th><th>Why</th><th>How long</th></tr>
          </thead>
          <tbody>
            <tr><td>Session identifier</td><td>Lets a scan be completed and a reward issued to the right person</td><td>Until you close the browser, or 24 hours</td></tr>
            <tr><td>Security token</td><td>Prevents request forgery and protects your reward from being claimed by someone else</td><td>Session</td></tr>
            <tr><td>Login state</td><td>Keeps you signed in</td><td>30 days</td></tr>
            <tr><td>Camera-explainer flag</td><td>So we don&apos;t show you the same explainer twice</td><td>90 days</td></tr>
          </tbody>
        </table>
      </div>
      <p>These cannot be turned off. Without them, scanning doesn&apos;t work.</p>

      <h2>Analytics — we ask first</h2>
      <div className="legal-content__table-wrap">
        <table>
          <thead>
            <tr><th>What</th><th>Why</th><th>How long</th></tr>
          </thead>
          <tbody>
            <tr><td>Pseudonymous analytics ID</td><td>Counts unique scanners and shows us where the funnel breaks</td><td>12 months</td></tr>
            <tr><td>Performance data</td><td>Load times, scan success rate by device model</td><td>12 months</td></tr>
          </tbody>
        </table>
      </div>
      <p>We ask for your consent before setting these. If you decline, PIKE works exactly the same — we just count you as a number rather than a returning number.</p>

      <h2>Preferences</h2>
      <p>Language, and whether you&apos;ve dismissed a notice. Stored locally, never sent to us.</p>

      <h2>Managing this</h2>
      <ul>
        <li><strong>In PIKE:</strong> Settings → Privacy → Analytics</li>
        <li><strong>In your browser:</strong> clear site data for pike.app. This will lose any reward in progress.</li>
        <li><strong>In the app:</strong> uninstalling removes everything stored locally.</li>
      </ul>

      <h2>Third parties</h2>
      <p>
        Our analytics provider and error tracker set storage on our behalf, under contracts that forbid them using it
        for their own purposes. The current list is at <a href="/privacy/processors">/privacy/processors</a>.
      </p>
      <p>Questions: <a href="mailto:privacy@pike.app">privacy@pike.app</a></p>
    </LegalPageShell>
  );
}
