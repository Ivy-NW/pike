/**
 * Stylized "P" doubling as a location pin / compass waypoint (UI doc §5) -- no wordmark
 * needed at icon size. Single inline SVG, no external asset fetch.
 */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 2c-6.6 0-12 5.1-12 11.4C4 21 16 30 16 30s12-9 12-16.6C28 7.1 22.6 2 16 2Z"
        fill="var(--pike-blue)"
      />
      <path
        d="M13 9.5h4.4c2.6 0 4.2 1.4 4.2 3.7 0 2.3-1.6 3.8-4.2 3.8H15v3.7h-2V9.5Zm2 1.7v4h2.2c1.4 0 2.3-.8 2.3-2s-.9-2-2.3-2H15Z"
        fill="white"
      />
    </svg>
  );
}

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Logo size={size + 6} />
      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: size, letterSpacing: "-0.01em" }}>
        PIKE
      </span>
    </div>
  );
}
