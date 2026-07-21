/** Rounded-outline icon set, hand-rolled (UI doc §3: no heavy gaming-style icons). */
type IconProps = { size?: number; color?: string };

const base = {
  fill: "none",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CameraIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
      <circle cx="12" cy="13" r="3.4" />
    </svg>
  );
}

export function FlagIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M6 3v18" />
      <path d="M6 4.5c2.4-1.4 4.6-1.4 7 0s4.6 1.4 7 0v8c-2.4 1.4-4.6 1.4-7 0s-4.6-1.4-7 0Z" />
    </svg>
  );
}

export function GiftIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M4 13h16" />
      <path d="M12 9v11" />
      <path d="M12 9C9.5 9 8 7.8 8 6.2A2.2 2.2 0 0 1 10.2 4C11.8 4 12 6.5 12 9Z" />
      <path d="M12 9c2.5 0 4-1.2 4-2.8A2.2 2.2 0 0 0 13.8 4C12.2 4 12 6.5 12 9Z" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function CoinIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.3 14.8c.4.9 1.3 1.4 2.5 1.4 1.7 0 2.8-.9 2.8-2.1 0-1.3-1-1.8-2.9-2.2-1.8-.4-2.6-1-2.6-2.1 0-1.2 1.1-2 2.6-2 1.1 0 2 .5 2.4 1.3" />
      <path d="M12 7.3v9.4" />
    </svg>
  );
}

export function ShieldIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M12 3.5 19 6.3v5.4c0 4.6-3 8.3-7 9.3-4-1-7-4.7-7-9.3V6.3l7-2.8Z" />
      <path d="m9 12.2 2 2 4-4.4" />
    </svg>
  );
}

export function AnalyticsIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M5 20V11" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </svg>
  );
}

export function BoltIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M13 2.5 4.5 14h6L9.5 21.5 18 10h-6l1-7.5Z" />
    </svg>
  );
}

export function LockIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

export function AppleIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.3.8-1.2 1.1-2.4 1.1-2.4-.1 0-2.3-.9-2.3-3.5v-.5Z" />
      <path d="M14.3 5.6c.6-.8 1-1.9.9-3-.9.1-2 .6-2.6 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2-.5 2.7-1.3Z" />
    </svg>
  );
}

export function PlayIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M5 3.6c0-.6.6-1 1.2-.7l13 8.4c.5.3.5 1.1 0 1.4l-13 8.4c-.6.3-1.2-.1-1.2-.7V3.6Z" />
    </svg>
  );
}

export function SunIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <circle cx="12" cy="12" r="4.3" />
      <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18 6l-1.9 1.9M7.9 16.1 6 18M18 18l-1.9-1.9M7.9 7.9 6 6" />
    </svg>
  );
}

export function MoonIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...base}>
      <path d="M20.5 14.7A8.6 8.6 0 1 1 9.3 3.5a7 7 0 0 0 11.2 11.2Z" />
    </svg>
  );
}
