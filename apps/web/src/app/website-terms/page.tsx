import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Website Terms of Use — PIKE" };

export default function WebsiteTermsPage() {
  return (
    <LegalPageShell crumb="Legal / Website Terms" title="Website Terms of Use" updated="8 September 2026">
      <div className="legal-content__todo">
        Registered company name, number and address below are placeholders — fill them in from the actual
        certificate of incorporation before this page goes live.
      </div>
      <p>
        This website is operated by <strong>[REGISTERED COMPANY NAME]</strong>, company number [NUMBER], of
        [ADDRESS, NAIROBI].
      </p>
      <p>
        <strong>Using PIKE itself</strong> is governed by our Terms of Service — <a href="/terms">/terms</a> for
        visitors, <a href="/terms/business">/terms/business</a> for venues. These website terms cover browsing
        this site.
      </p>
      <ol>
        <li>
          <strong>Content is for information.</strong> We try to keep it accurate and current but make no promise
          that it is. Prices, features and availability change. Nothing here is an offer capable of acceptance, or
          professional advice of any kind.
        </li>
        <li>
          <strong>Our content is ours.</strong> Text, design, logos, images and code on this site belong to us or
          our licensors. You may read, share links, and quote briefly with attribution. You may not copy
          substantial parts, scrape the site, or use our brand as your own.
        </li>
        <li><strong>Third-party links</strong> are provided for convenience. We don&apos;t control or endorse those sites.</li>
        <li><strong>Availability.</strong> We may change or take down the site at any time without notice.</li>
        <li>
          <strong>Liability.</strong> To the extent permitted by law, we&apos;re not liable for loss arising from
          your use of, or reliance on, this website. Nothing limits liability for fraud, death or personal injury
          caused by negligence, or anything that can&apos;t be limited under Kenyan law.
        </li>
        <li><strong>Law.</strong> The laws of Kenya, and the courts of Kenya.</li>
      </ol>
    </LegalPageShell>
  );
}
