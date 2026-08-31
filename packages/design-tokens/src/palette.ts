/**
 * Concrete Material-3-style token sets matching PIKE Vanguard Identity.
 *
 * Brand Palette (Derived from PIKE Logo):
 * - Cobalt Sapphire Blue: #2563eb / #1d4ed8 / #00f0ff (Cybernetic Core Gem)
 * - Imperial Champagne Gold: #eab308 / #f59e0b / #d4af37 (Crown & Wing Mantle)
 *
 * Dark: Obsidian #141314 with Sapphire & Gold neon highlights.
 * Light: Clean Ceramic #f4f6fa with deep high-contrast Slate #0f172a text,
 *        Royal Sapphire Blue, and Warm Amber Gold accents.
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
  onSurface: "#f8fafc",
  onSurfaceVariant: "#cbd5e1",
  inverseSurface: "#e2e8f0",
  inverseOnSurface: "#1e293b",
  outline: "#94a3b8",
  outlineVariant: "#475569",
  primary: "#00f0ff", // Electric Sapphire Cyan
  onPrimary: "#0f172a",
  primaryContainer: "#1e3a8a",
  onPrimaryContainer: "#93c5fd",
  inversePrimary: "#3b82f6",
  secondary: "#f59e0b", // Imperial Gold
  onSecondary: "#451a03",
  secondaryContainer: "#78350f",
  onSecondaryContainer: "#fde68a",
  tertiary: "#e2b96f",
  onTertiary: "#3d2e14",
  tertiaryContainer: "#291e0a",
  onTertiaryContainer: "#fef08a",
  error: "#f87171",
  onError: "#450a0a",
  errorContainer: "#7f1d1d",
  onErrorContainer: "#fecaca",
  background: "#141314",
  onBackground: "#f8fafc",
  success: "#10B981",
  goldDeep: "#f59e0b",
  pikeBlueGlow: "#00f0ff",
  slateGray: "#1c1b1c",
  textMuted: "#94a3b8",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",
  neumorphSurface: "#141314",
  neumorphShadowDark: "rgba(0, 0, 0, 0.75)",
  neumorphShadowLight: "rgba(255, 255, 255, 0.05)",
  neumorphInset: "#0e0e0e",
  neumorphBorder: "rgba(255, 255, 255, 0.07)",
};

export const vanguardLight: ColorTokens = {
  surface: "#f1f5f9",
  surfaceDim: "#e2e8f0",
  surfaceBright: "#ffffff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f8fafc",
  surfaceContainer: "#ffffff",
  surfaceContainerHigh: "#e2e8f0",
  surfaceContainerHighest: "#cbd5e1",
  surfaceVariant: "#e2e8f0",
  onSurface: "#0f172a", // Deep high-contrast Slate 900
  onSurfaceVariant: "#334155", // High-contrast Slate 700
  inverseSurface: "#0f172a",
  inverseOnSurface: "#f8fafc",
  outline: "#64748b",
  outlineVariant: "#cbd5e1",
  primary: "#1d4ed8", // Deep Royal Sapphire Blue
  onPrimary: "#ffffff",
  primaryContainer: "#dbeafe",
  onPrimaryContainer: "#1e3a8a",
  inversePrimary: "#3b82f6",
  secondary: "#b45309", // Warm Imperial Gold
  onSecondary: "#ffffff",
  secondaryContainer: "#fef3c7",
  onSecondaryContainer: "#78350f",
  tertiary: "#926017",
  onTertiary: "#ffffff",
  tertiaryContainer: "#fef9c3",
  onTertiaryContainer: "#713f12",
  error: "#dc2626",
  onError: "#ffffff",
  errorContainer: "#fee2e2",
  onErrorContainer: "#991b1b",
  background: "#f1f5f9",
  onBackground: "#0f172a",
  success: "#059669",
  goldDeep: "#b45309",
  pikeBlueGlow: "#2563eb",
  slateGray: "#f8fafc",
  textMuted: "#475569",
  borderSubtle: "#e2e8f0",
  borderStrong: "#cbd5e1",
  neumorphSurface: "#ffffff",
  neumorphShadowDark: "rgba(148, 163, 184, 0.35)",
  neumorphShadowLight: "#ffffff",
  neumorphInset: "#e8edf5",
  neumorphBorder: "rgba(15, 23, 42, 0.08)",
};
