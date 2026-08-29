/**
 * Concrete Material-3-style token sets, sourced directly from the
 * `docs/ui designs/pike_vanguard(_light)/DESIGN.md` companion systems that
 * every screen mockup in `docs/ui designs/` is actually built against
 * (confirmed by hex-matching the mockups' Tailwind configs).
 *
 * "Vanguard" = dark mode, techno-adventurer identity (Space Grotesk + Inter,
 * soft rounded, glass-card, neon glow).
 * "Vanguard Light" = light mode, laboratory-grade corporate identity
 * (Geist + Space Mono, sharp corners, bento/hairline-border).
 *
 * Dark/light is a full identity switch in this system, not a palette
 * inversion — applied uniformly across every surface (app, landing,
 * dashboards), per user decision on 2026-07-17.
 */
export interface ColorTokens {
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  outline: string;
  outlineVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  inversePrimary: string;
  /** Gold. Reward-only — see REWARD_ONLY_COLOR_KEYS in brand.ts. */
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  success: string;
  /** Gold. Reward-only. */
  goldDeep: string;
  pikeBlueGlow: string;
  slateGray: string;
  textMuted: string;
  borderSubtle: string;
  borderStrong: string;
  neumorphSurface: string;
  neumorphShadowDark: string;
  neumorphShadowLight: string;
  neumorphInset: string;
  neumorphBorder: string;
}

export const vanguardDark: ColorTokens = {
  surface: "#0b1326",
  surfaceDim: "#0b1326",
  surfaceBright: "#31394d",
  surfaceContainerLowest: "#060e20",
  surfaceContainerLow: "#131b2e",
  surfaceContainer: "#171f33",
  surfaceContainerHigh: "#222a3d",
  surfaceContainerHighest: "#2d3449",
  surfaceVariant: "#2d3449",
  onSurface: "#dae2fd",
  onSurfaceVariant: "#c3c6d7",
  inverseSurface: "#dae2fd",
  inverseOnSurface: "#283044",
  outline: "#8d90a0",
  outlineVariant: "#434655",
  primary: "#b4c5ff",
  onPrimary: "#002a78",
  primaryContainer: "#2563eb",
  onPrimaryContainer: "#eeefff",
  inversePrimary: "#0053db",
  secondary: "#ffb95f",
  onSecondary: "#472a00",
  secondaryContainer: "#ee9800",
  onSecondaryContainer: "#5b3800",
  tertiary: "#d2bbff",
  onTertiary: "#3f008e",
  tertiaryContainer: "#8343f4",
  onTertiaryContainer: "#f7edff",
  error: "#ffb4ab",
  onError: "#690005",
  errorContainer: "#93000a",
  onErrorContainer: "#ffdad6",
  background: "#0b1326",
  onBackground: "#dae2fd",
  success: "#10B981",
  goldDeep: "#B45309",
  pikeBlueGlow: "#4F46E5",
  slateGray: "#1E293B",
  textMuted: "#64748B",
  borderSubtle: "rgba(255,255,255,0.08)",
  borderStrong: "#434655",
  neumorphSurface: "#131b2e",
  neumorphShadowDark: "rgba(0, 0, 0, 0.75)",
  neumorphShadowLight: "rgba(255, 255, 255, 0.08)",
  neumorphInset: "#0a1020",
  neumorphBorder: "rgba(255, 255, 255, 0.09)",
};

export const vanguardLight: ColorTokens = {
  surface: "#f8f9ff",
  surfaceDim: "#cbdbf5",
  surfaceBright: "#f8f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#eff4ff",
  surfaceContainer: "#e5eeff",
  surfaceContainerHigh: "#dce9ff",
  surfaceContainerHighest: "#d3e4fe",
  surfaceVariant: "#d3e4fe",
  onSurface: "#0b1c30",
  onSurfaceVariant: "#434655",
  inverseSurface: "#213145",
  inverseOnSurface: "#eaf1ff",
  outline: "#737686",
  outlineVariant: "#c3c6d7",
  primary: "#004ac6",
  onPrimary: "#ffffff",
  primaryContainer: "#2563eb",
  onPrimaryContainer: "#eeefff",
  inversePrimary: "#b4c5ff",
  secondary: "#855300",
  onSecondary: "#ffffff",
  secondaryContainer: "#fea619",
  onSecondaryContainer: "#684000",
  tertiary: "#4d556b",
  onTertiary: "#ffffff",
  tertiaryContainer: "#656d84",
  onTertiaryContainer: "#eef0ff",
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  background: "#f8f9ff",
  onBackground: "#0b1c30",
  success: "#10B981",
  goldDeep: "#B45309",
  pikeBlueGlow: "#4F46E5",
  slateGray: "#1E293B",
  textMuted: "#64748B",
  borderSubtle: "#E2E8F0",
  borderStrong: "#CBD5E1",
  neumorphSurface: "#e9f0fc",
  neumorphShadowDark: "rgba(163, 177, 198, 0.6)",
  neumorphShadowLight: "#ffffff",
  neumorphInset: "#dde6f4",
  neumorphBorder: "rgba(255, 255, 255, 0.8)",
};
