import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Contact — PIKE" };

export default function ContactPage() {
  return (
    <LegalPageShell crumb="Legal / Contact" title="Contact & Legal Notices" updated="8 September 2026">
      <div className="legal-content__todo">
        Registered entity details below (company number, KRA PIN, VAT, ODPC registration, DPO) are placeholders.
        Fill them in with the real, verified values before publishing — a wrong or fabricated registration number
        here is itself a compliance problem.
      </div>
      <p>
        <strong>[REGISTERED COMPANY NAME]</strong>
        <br />[REGISTERED ADDRESS, NAIROBI, KENYA]
      </p>

      <div className="legal-content__table-wrap">
        <table>
          <tbody>
            <tr><th>Company number</th><td>[NUMBER]</td></tr>
            <tr><th>KRA PIN</th><td>[PIN]</td></tr>
            <tr><th>VAT number</th><td>[NUMBER]</td></tr>
            <tr><th>ODPC registration</th><td>[NUMBER]</td></tr>
            <tr><th>Data Protection Officer</th><td>[NAME / ROLE]</td></tr>
          </tbody>
        </table>
      </div>

      <div className="legal-content__table-wrap">
        <table>
          <thead>
            <tr><th>Purpose</th><th>Contact</th></tr>
          </thead>
          <tbody>
            <tr><td>Visitor support</td><td><a href="mailto:support@pike.app">support@pike.app</a></td></tr>
            <tr><td>Venue and organiser sales</td><td><a href="mailto:hello@pike.app">hello@pike.app</a></td></tr>
            <tr><td>Billing</td><td><a href="mailto:billing@pike.app">billing@pike.app</a></td></tr>
            <tr><td>Privacy and data rights</td><td><a href="mailto:privacy@pike.app">privacy@pike.app</a></td></tr>
            <tr><td>Security</td><td><a href="mailto:security@pike.app">security@pike.app</a></td></tr>
            <tr><td>Legal and copyright</td><td><a href="mailto:legal@pike.app">legal@pike.app</a></td></tr>
            <tr><td>Accessibility</td><td><a href="mailto:accessibility@pike.app">accessibility@pike.app</a></td></tr>
            <tr><td>Press</td><td><a href="mailto:press@pike.app">press@pike.app</a></td></tr>
          </tbody>
        </table>
      </div>
      <p>Every address above must reach a monitored inbox before launch. Aliases to a shared inbox are fine.</p>
    </LegalPageShell>
  );
}
