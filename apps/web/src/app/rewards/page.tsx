import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata = { title: "Reward Terms & FAQ — PIKE" };

export default function RewardsPage() {
  return (
    <LegalPageShell crumb="Legal / Rewards" title="Reward Terms & FAQ" updated="8 September 2026">
      <div className="legal-content__callout">
        <p><strong>The venue gives you the reward. We just prove you showed up.</strong></p>
        <p>
          PIKE verifies you were physically there and issues the reward record. The venue funds it and hands it
          over. That means the venue sets the terms — what it is, what you might need to buy, which days it&apos;s
          valid, when it runs out.
        </p>
      </div>

      <h2>FAQ</h2>

      <h3>What&apos;s a reward worth in cash?</h3>
      <p>Nothing. Rewards aren&apos;t money, can&apos;t be exchanged for money, and can&apos;t be refunded. They&apos;re a promotional benefit.</p>

      <h3>Can I give mine to a friend?</h3>
      <p>No. Rewards are tied to your claim and can&apos;t be transferred, sold or shared. Your friend can scan the same marker and get their own.</p>

      <h3>Can everyone at my table scan the same marker?</h3>
      <p>Yes. Caps are per person, not per marker. Everyone gets their own reward.</p>

      <h3>How long do I have?</h3>
      <p>Each reward shows its own expiry before you claim it. Once it expires we can&apos;t bring it back, so check before you claim.</p>

      <h3>Can I use it with another offer?</h3>
      <p>Only if the venue says so. Assume no unless stated.</p>

      <h3>The venue said the daily limit was reached.</h3>
      <p>
        Venues set a maximum number of rewards per day so a promotion doesn&apos;t run away from them. If you hit
        the cap, the quest tells you before you complete it. Come back tomorrow.
      </p>

      <h3>The venue won&apos;t honour my reward.</h3>
      <p>
        Email <a href="mailto:support@pike.app">support@pike.app</a> with the venue, the date and the reward.
        We&apos;ll take it up with them. We can&apos;t force a venue to serve you and we don&apos;t pay out cash,
        but repeated failures get a venue removed from PIKE — and where it&apos;s our fault, we&apos;ll usually
        replace the reward.
      </p>

      <h3>My scan failed.</h3>
      <p>
        Try again with more light and the whole marker in frame. If it still fails, check <a href="/devices">/devices</a>
        — some older handsets aren&apos;t supported. Tell us at <a href="mailto:support@pike.app">support@pike.app</a> and
        include your phone model; it genuinely helps us fix it.
      </p>

      <h3>Can my reward be cancelled?</h3>
      <p>Only if it was issued in error — a bug, a misconfigured quest, or a completion our fraud checks flag. We&apos;ll tell you why.</p>

      <h3>What are XP, levels and streaks worth?</h3>
      <p>Bragging rights. They&apos;re reputational only, not currency, and can&apos;t be exchanged for anything.</p>

      <h3>Do I have to install the app?</h3>
      <p>No. Scanning and claiming work in your browser. The app just keeps your rewards and progress in one place.</p>

      <h3>Is there an age limit?</h3>
      <p>Yes, 18+. Quests at venues serving alcohol require an age check.</p>
    </LegalPageShell>
  );
}
