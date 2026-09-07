import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Sub-processors — PIKE" };

export default function ProcessorsPage() {
  return (
    <LegalPageShell
      crumb="Legal / Privacy / Sub-processors"
      title="Sub-processor List"
      updated="8 September 2026"
      intro="These are the companies that process personal data on our behalf. Each works under a written contract meeting section 42 of the Data Protection Act, 2019, and may only use the data to provide their service to us."
    >
      <div className="legal-content__todo">
        This list is being finalised against what is actually deployed to production. Confirm each vendor before
        publishing, and keep this page in the release checklist — see <a href="/legal">/legal</a>.
      </div>
      <div className="legal-content__table-wrap">
        <table>
          <thead>
            <tr><th>Provider</th><th>What they do</th><th>Data involved</th><th>Location</th></tr>
          </thead>
          <tbody>
            <tr><td>Vercel</td><td>Application hosting and content delivery for our web properties</td><td>IP address, device type</td><td>Global edge</td></tr>
            <tr><td>[DATABASE HOST]</td><td>Application database</td><td>All service data</td><td>[REGION]</td></tr>
            <tr><td>[AUTH / OTP PROVIDER]</td><td>Phone and social login</td><td>Phone number or social ID</td><td>[REGION]</td></tr>
            <tr><td>[SMS PROVIDER]</td><td>One-time verification codes</td><td>Phone number</td><td>Kenya</td></tr>
            <tr><td>[ANALYTICS PROVIDER]</td><td>Product analytics</td><td>Pseudonymous ID, events</td><td>[REGION]</td></tr>
            <tr><td>Expo</td><td>Mobile app push notifications</td><td>Device push token</td><td>Global</td></tr>
            <tr><td>[ERROR TRACKING PROVIDER]</td><td>Crash diagnostics</td><td>Device and error data</td><td>[REGION]</td></tr>
            <tr><td>Stripe</td><td>Venue payments</td><td>Venue billing data only</td><td>[REGION]</td></tr>
            <tr><td>Safaricom (M-Pesa)</td><td>Venue payments</td><td>Venue billing data only</td><td>Kenya</td></tr>
            <tr><td>[PRINT PARTNER]</td><td>Marker printing and delivery</td><td>Venue delivery details only</td><td>Kenya</td></tr>
          </tbody>
        </table>
      </div>
      <p><strong>We do not send visitor personal data to our AI provider.</strong> It receives only venue-supplied text prompts for drafting quest copy.</p>
      <h2>Changes</h2>
      <p>
        We&apos;ll update this page and note the change date. For material additions we&apos;ll notify account holders
        in advance.
      </p>
    </LegalPageShell>
  );
}
