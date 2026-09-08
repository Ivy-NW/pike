import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Your Data — PIKE" };

export default function YourDataPage() {
  return (
    <LegalPageShell
      crumb="Legal / Your Data"
      title="Your Data"
      updated="8 September 2026"
      intro="Under the Data Protection Act, 2019 you can ask us to:"
    >
      <div className="legal-content__table-wrap">
        <table>
          <thead>
            <tr><th>Right</th><th>What it means</th></tr>
          </thead>
          <tbody>
            <tr><td>See it</td><td>Get a copy of the personal data we hold about you</td></tr>
            <tr><td>Correct it</td><td>Fix anything wrong or incomplete</td></tr>
            <tr><td>Delete it</td><td>Remove it, unless we&apos;re legally required to keep it</td></tr>
            <tr><td>Object</td><td>Tell us to stop processing based on our legitimate interests</td></tr>
            <tr><td>Restrict</td><td>Pause processing while a dispute is sorted out</td></tr>
            <tr><td>Export it</td><td>Receive it in a machine-readable format</td></tr>
            <tr><td>Withdraw consent</td><td>For anything you consented to, at any time</td></tr>
          </tbody>
        </table>
      </div>

      <h2>How</h2>
      <p><strong>In the app:</strong> Settings → Privacy → Your data. Fastest route.</p>
      <p><strong>By email:</strong> <a href="mailto:privacy@pike.app">privacy@pike.app</a></p>
      <p><strong>By post:</strong> [registered address]</p>
      <p>
        <strong>No charge. No need to explain why.</strong> We may ask you to confirm you control the phone number
        or social account, so we don&apos;t hand your data to someone else.
      </p>
      <p>
        <strong>Timing:</strong> acknowledgement within 7 days, resolution within 30 days as the Act requires. If a
        request is complex we&apos;ll tell you and explain the delay.
      </p>

      <h2>What we hold</h2>
      <p>
        Mostly less than you&apos;d expect: your phone number or social identifier, your rewards, your XP and
        streaks, and a log of which markers you scanned and when. <strong>No camera images. No GPS. No record of
        what you spent.</strong>
      </p>

      <h2>Not happy?</h2>
      <p>
        Contact us first at <a href="mailto:privacy@pike.app">privacy@pike.app</a> — most things are fixable
        quickly. You can also complain to the <strong>Office of the Data Protection Commissioner</strong> at any
        time: <a href="https://www.odpc.go.ke" rel="noreferrer">odpc.go.ke</a>.
      </p>
    </LegalPageShell>
  );
}
