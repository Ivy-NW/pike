import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Legal — PIKE" };

const PAGES = [
  { href: "/privacy", label: "Privacy Policy", updated: "8 September 2026" },
  { href: "/cookies", label: "Cookie & Storage Policy", updated: "8 September 2026" },
  { href: "/privacy/processors", label: "Sub-processor List", updated: "8 September 2026" },
  { href: "/terms", label: "Terms of Service (Visitors)", updated: "8 September 2026" },
  { href: "/terms/business", label: "Customer Terms (Venues)", updated: "Not yet published" },
  { href: "/acceptable-use", label: "Acceptable Use Policy", updated: "8 September 2026" },
  { href: "/rewards", label: "Reward Terms & FAQ", updated: "8 September 2026" },
  { href: "/devices", label: "Supported Devices", updated: "8 September 2026" },
  { href: "/website-terms", label: "Website Terms of Use", updated: "8 September 2026" },
  { href: "/security", label: "Security & Vulnerability Disclosure", updated: "8 September 2026" },
  { href: "/copyright", label: "Copyright & Takedown", updated: "8 September 2026" },
  { href: "/accessibility", label: "Accessibility Statement", updated: "8 September 2026" },
  { href: "/your-data", label: "Your Data (rights request)", updated: "8 September 2026" },
  { href: "/complaints", label: "Complaints", updated: "8 September 2026" },
  { href: "/contact", label: "Contact & Legal Notices", updated: "8 September 2026" },
];

export default function LegalIndexPage() {
  return (
    <LegalPageShell
      crumb="Legal"
      title="Legal & Policies"
      updated="8 September 2026"
      intro="Everything PIKE publishes about how the service works, what we collect, and your rights — in one place for your advocate, a venue's lawyer, or the ODPC to find."
    >
      <ul className="legal-content__index-list">
        {PAGES.map((page) => (
          <li key={page.href}>
            <a href={page.href}>{page.label}</a>
            <span className="legal-content__index-date">{page.updated}</span>
          </li>
        ))}
      </ul>
      <p>
        Questions about anything here: <a href="mailto:legal@pike.app">legal@pike.app</a>. To report a problem with
        PIKE itself, see <a href="/complaints">/complaints</a>.
      </p>
    </LegalPageShell>
  );
}
