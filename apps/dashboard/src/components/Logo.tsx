/** Brand mark, see apps/web/src/components/Logo.tsx for provenance notes. */
export function Logo({ size = 28 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo.png" alt="" width={size} height={size} style={{ width: size, height: size }} aria-hidden="true" />;
}
