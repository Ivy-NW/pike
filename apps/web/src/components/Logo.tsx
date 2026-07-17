/**
 * Brand mark (docs/logo/pike logo design no background.png) -- transparent PNG,
 * used as-is per UI doc §4/step 4: this is brand identity, not UI chrome, so it's
 * the one element exempt from the "gold is reward-only" rule. Holds up on both
 * light and dark surfaces (verified against #F8FAFC and #0F172A).
 */
export function Logo({ size = 32 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo.png" alt="" width={size} height={size} style={{ width: size, height: size }} aria-hidden="true" />;
}

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Logo size={size + 10} />
      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: size, letterSpacing: "-0.01em" }}>
        PIKE
      </span>
    </div>
  );
}
