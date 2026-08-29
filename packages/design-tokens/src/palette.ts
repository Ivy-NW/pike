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
  surface: "#141314",
  surfaceDim: "#141314",
  surfaceBright: "#3a3939",
  surfaceContainerLowest: "#0e0e0e",
  surfaceContainerLow: "#1c1b1c",
  surfaceContainer: "#201f20",
  surfaceContainerHigh: "#2b2a2a",
  surfaceContainerHighest: "#353435",
  surfaceVariant: "#353435",
  onSurface: "#e5e2e2",
  onSurfaceVariant: "#c8c5cb",
  inverseSurface: "#e5e2e2",
  inverseOnSurface: "#313030",
  outline: "#929095",
  outlineVariant: "#47464b",
  primary: "#c8c5cc",
  onPrimary: "#303035",
  primaryContainer: "#1b1b20",
  onPrimaryContainer: "#848389",
  inversePrimary: "#5f5e64",
  secondary: "#d3fbff",
  onSecondary: "#00363a",
  secondaryContainer: "#00eefc",
  onSecondaryContainer: "#00686f",
  tertiary: "#cfc5ba",
  onTertiary: "#352f28",
  tertiaryContainer: "#201b14",
  onTertiaryContainer: "#8b8379",
  error: "#ffb4ab",
  onError: "#690005",
  errorContainer: "#93000a",
  onErrorContainer: "#ffdad6",
  background: "#141314",
  onBackground: "#e5e2e2",
  success: "#10B981",
  goldDeep: "#f59e0b",
  pikeBlueGlow: "#00f0ff",
  slateGray: "#1c1b1c",
  textMuted: "#929095",
  borderSubtle: "rgba(255,255,255,0.05)",
  borderStrong: "rgba(255,255,255,0.1)",
  neumorphSurface: "#141314",
  neumorphShadowDark: "rgba(0, 0, 0, 0.65)",
  neumorphShadowLight: "rgba(255, 255, 255, 0.05)",
  neumorphInset: "#0e0e0e",
  neumorphBorder: "rgba(255, 255, 255, 0.06)",
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
