import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Terms — PIKE" };

export default function TermsPage() {
  return (
    <LegalPageShell
      crumb="Legal / Terms"
      title="Terms of Service"
      updated="8 September 2026"
      intro="PIKE's terms of service will be published here before launch. This page will cover player participation, venue campaigns, reward claims, and acceptable use."
    >
      <h2>Related pages</h2>
      <ul>
        <li><a href="/acceptable-use">Acceptable Use Policy</a> — the rules that keep rewards fair</li>
        <li><a href="/rewards">Reward Terms & FAQ</a> — how claiming and redemption actually works</li>
        <li><a href="/devices">Supported Devices</a> — what your phone needs to scan a marker</li>
      </ul>
      <p>Questions in the meantime: <a href="mailto:support@pike.app">support@pike.app</a>.</p>
    </LegalPageShell>
  );
}
