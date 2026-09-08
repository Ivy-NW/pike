import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Privacy — PIKE" };

export default function PrivacyPage() {
  return (
    <LegalPageShell
      crumb="Legal / Privacy"
      title="Privacy Policy"
      updated="8 September 2026"
      intro="PIKE's full privacy policy will be published here before launch. Unauthenticated web-flow visitors are identified only at claim time, with no location tracking beyond the marker-scan event itself."
    >
      <h2>Related pages</h2>
      <ul>
        <li><a href="/cookies">Cookie & Storage Policy</a> — what we store on your device and why</li>
        <li><a href="/privacy/processors">Sub-processor List</a> — who processes data on our behalf</li>
        <li><a href="/your-data">Your Data</a> — how to see, correct, export or delete what we hold</li>
      </ul>
      <p>Questions in the meantime: <a href="mailto:privacy@pike.app">privacy@pike.app</a>.</p>
    </LegalPageShell>
  );
}
