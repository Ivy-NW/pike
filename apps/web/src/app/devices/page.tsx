import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Supported Devices — PIKE" };

export default function DevicesPage() {
  return (
    <LegalPageShell crumb="Legal / Devices" title="Supported Devices" updated="8 September 2026">
      <h2>What you need</h2>
      <ul>
        <li>A smartphone with a working rear camera</li>
        <li><strong>Android 9 or newer</strong> with Chrome, or <strong>iOS 14 or newer</strong> with Safari</li>
        <li>Camera permission granted in your browser</li>
        <li>A working data or wifi connection</li>
      </ul>

      <h2>Tested and working</h2>
      <div className="legal-content__todo">
        This matrix must be populated from real device-matrix test results before launch — not guessed. Update it
        after every release that touches the scan flow.
      </div>
      <div className="legal-content__table-wrap">
        <table>
          <thead>
            <tr><th>Brand</th><th>Models</th></tr>
          </thead>
          <tbody>
            <tr><td>Samsung</td><td>[confirm from testing — e.g. A-series, S-series]</td></tr>
            <tr><td>Tecno</td><td>[confirm from testing — e.g. Spark, Camon]</td></tr>
            <tr><td>Infinix</td><td>[confirm from testing — e.g. Hot, Note series]</td></tr>
            <tr><td>Oppo</td><td>[confirm from testing]</td></tr>
            <tr><td>Apple</td><td>[confirm from testing — e.g. iPhone 11 and newer]</td></tr>
            <tr><td>Xiaomi / Redmi</td><td>[confirm from testing]</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Known not to work</h2>
      <p>[List entry-level handsets confirmed below the tested floor here, by brand and model.]</p>

      <h2>If your scan won&apos;t work</h2>
      <ol>
        <li><strong>More light.</strong> Marker AR struggles in dim rooms and in direct glare.</li>
        <li><strong>Whole marker in frame</strong>, roughly straight on, about arm&apos;s length.</li>
        <li><strong>Steady phone.</strong> Give it two seconds.</li>
        <li><strong>Check camera permission</strong> in your browser settings.</li>
        <li><strong>Clean the lens.</strong> Genuinely the fix more often than you&apos;d think.</li>
      </ol>
      <p>
        Still failing? Email <a href="mailto:support@pike.app">support@pike.app</a> with your phone model and the
        venue. We track failures by handset and it&apos;s how the list above gets better.
      </p>
    </LegalPageShell>
  );
}
