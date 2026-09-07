import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Complaints — PIKE" };

export default function ComplaintsPage() {
  return (
    <LegalPageShell
      crumb="Legal / Complaints"
      title="Complaints"
      updated="8 September 2026"
      intro="Something went wrong — tell us."
    >
      <div className="legal-content__table-wrap">
        <table>
          <thead>
            <tr><th>Issue</th><th>Where</th></tr>
          </thead>
          <tbody>
            <tr><td>A venue didn&apos;t honour a reward</td><td><a href="mailto:support@pike.app">support@pike.app</a></td></tr>
            <tr><td>A scan won&apos;t work</td><td><a href="mailto:support@pike.app">support@pike.app</a> with your phone model</td></tr>
            <tr><td>Your account was suspended</td><td><a href="mailto:support@pike.app">support@pike.app</a> — a person reviews every appeal</td></tr>
            <tr><td>Something about your data</td><td><a href="mailto:privacy@pike.app">privacy@pike.app</a></td></tr>
            <tr><td>A quest that felt unsafe or irresponsible</td><td><a href="mailto:support@pike.app">support@pike.app</a></td></tr>
            <tr><td>A security vulnerability</td><td><a href="mailto:security@pike.app">security@pike.app</a></td></tr>
            <tr><td>An infringement claim</td><td><a href="mailto:legal@pike.app">legal@pike.app</a></td></tr>
            <tr><td>A billing dispute (venues)</td><td><a href="mailto:billing@pike.app">billing@pike.app</a> — within 30 days of the invoice</td></tr>
          </tbody>
        </table>
      </div>
      <p><strong>We acknowledge within 3 working days</strong> and aim to resolve within 14.</p>

      <h2>If we can&apos;t resolve it</h2>
      <ul>
        <li><strong>Data matters:</strong> Office of the Data Protection Commissioner — <a href="https://www.odpc.go.ke" rel="noreferrer">odpc.go.ke</a></li>
        <li><strong>Consumer matters:</strong> [relevant Kenyan consumer protection authority — confirm current body with counsel]</li>
        <li><strong>Venue and organiser disputes:</strong> escalation and arbitration as set out in the Customer Terms, section 16</li>
        <li><strong>Courts of Kenya</strong> remain available to you throughout</li>
      </ul>

      <h2>Reporting a quest</h2>
      <p>
        We take this seriously. Tell us if you ever see a PIKE quest that appears aimed at under-18s, encourages
        drinking more or faster, promises something the venue won&apos;t deliver, or requires anything unsafe.{" "}
        <strong>We remove quests like this and take it up with the venue.</strong>
      </p>
    </LegalPageShell>
  );
}
