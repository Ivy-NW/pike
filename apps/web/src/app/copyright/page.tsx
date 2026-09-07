import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Copyright & Takedown — PIKE" };

export default function CopyrightPage() {
  return (
    <LegalPageShell crumb="Legal / Copyright" title="Copyright & Takedown" updated="8 September 2026">
      <h2>Reporting infringement</h2>
      <p>
        If you believe material displayed by PIKE — on a marker, in a quest, in an AR skin, or on this site —
        infringes your rights, email <strong><a href="mailto:legal@pike.app">legal@pike.app</a></strong> with:
      </p>
      <ol>
        <li>What the material is and where you saw it (venue name, quest name, or URL — a photo helps)</li>
        <li>What work of yours it infringes, and proof you own or control the rights</li>
        <li>Your name and contact details</li>
        <li>A statement that you believe in good faith the use isn&apos;t authorised</li>
        <li>A statement that the information is accurate</li>
      </ol>
      <p>
        <strong>We acknowledge within 3 working days.</strong> Where a claim is well-founded, we remove the
        material and require the venue to remove and destroy any printed assets carrying it.
      </p>

      <h2>For venues</h2>
      <p>
        You warranted, when you uploaded, that you own or are licensed to use the image. If we receive a valid
        complaint we may take your marker down immediately, and you indemnify us against the claim under section
        5.2 of the Customer Terms.
      </p>
      <p><strong>This is why our upload check exists.</strong> If the dashboard warns you about an image, it isn&apos;t being fussy.</p>

      <h2>Counter-notice</h2>
      <p>
        If your material was removed and you believe that was wrong, email <a href="mailto:legal@pike.app">legal@pike.app</a> explaining
        why, with evidence of your rights. We&apos;ll review and restore if the objection holds.
      </p>

      <p>Governed by the <strong>Copyright Act, 2001</strong>.</p>
    </LegalPageShell>
  );
}
