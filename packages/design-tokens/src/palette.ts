/**
 * Concrete Material-3-style token sets matching PIKE Logo Identity.
 *
 * Brand Palette (Directly extracted from PIKE Logo):
 * - Imperial Champagne Gold: #d4af37 / #f59e0b / #eab308 (Crown & Wing Mantle)
 * - Cobalt Sapphire Blue: #2563eb / #1d4ed8 / #3b82f6 (Central Diamond Gem)
 *
 * Dark: Obsidian Titanium #0c0c0e with Imperial Gold & Sapphire Blue glow.
 * Light: Clean Ceramic #f4f6fa with Pure White cards, Deep Slate #0f172a text,
 *        and Sapphire & Gold tactile accents.
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
  surface: "#0c0c0e",
  surfaceDim: "#0c0c0e",
  surfaceBright: "#232328",
  surfaceContainerLowest: "#070708",
  surfaceContainerLow: "#121215",
  surfaceContainer: "#17171b",
  surfaceContainerHigh: "#202025",
  surfaceContainerHighest: "#292930",
  surfaceVariant: "#202025",
  onSurface: "#fbfaf8", // Crisp Ivory White
  onSurfaceVariant: "#a1a1aa", // Refined Slate
  inverseSurface: "#e4e4e7",
  inverseOnSurface: "#18181b",
  outline: "#71717a",
  outlineVariant: "#3f3f46",
  primary: "#f59e0b", // Imperial Gold
  onPrimary: "#18181b",
  primaryContainer: "#78350f",
  onPrimaryContainer: "#fde68a",
  inversePrimary: "#d97706",
  secondary: "#3b82f6", // Sapphire Gem Blue
  onSecondary: "#ffffff",
  secondaryContainer: "#1e3a8a",
  onSecondaryContainer: "#bfdbfe",
  tertiary: "#d4af37", // Champagne Gold
  onTertiary: "#1c1917",
  tertiaryContainer: "#451a03",
  onTertiaryContainer: "#fef08a",
  error: "#f87171",
  onError: "#450a0a",
  errorContainer: "#7f1d1d",
  onErrorContainer: "#fecaca",
  background: "#0c0c0e",
  onBackground: "#fbfaf8",
  success: "#10B981",
  goldDeep: "#f59e0b",
  pikeBlueGlow: "#3b82f6",
  slateGray: "#18181b",
  textMuted: "#a1a1aa",
  borderSubtle: "rgba(212, 175, 55, 0.15)",
  borderStrong: "rgba(212, 175, 55, 0.35)",
  neumorphSurface: "#141417",
  neumorphShadowDark: "rgba(0, 0, 0, 0.85)",
  neumorphShadowLight: "rgba(255, 255, 255, 0.04)",
  neumorphInset: "#0a0a0c",
  neumorphBorder: "rgba(212, 175, 55, 0.18)",
};

export const vanguardLight: ColorTokens = {
  surface: "#f4f6fa",
  surfaceDim: "#e2e8f0",
  surfaceBright: "#ffffff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f8fafc",
  surfaceContainer: "#ffffff",
  surfaceContainerHigh: "#e8edf5",
  surfaceContainerHighest: "#cbd5e1",
  surfaceVariant: "#e8edf5",
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
  background: "#f4f6fa",
  onBackground: "#0f172a",
  success: "#059669",
  goldDeep: "#b45309",
  pikeBlueGlow: "#1d4ed8",
  slateGray: "#ffffff",
  textMuted: "#475569",
  borderSubtle: "rgba(15, 23, 42, 0.08)",
  borderStrong: "rgba(15, 23, 42, 0.16)",
  neumorphSurface: "#ffffff",
  neumorphShadowDark: "rgba(15, 23, 42, 0.12)",
  neumorphShadowLight: "#ffffff",
  neumorphInset: "#e8edf5",
  neumorphBorder: "rgba(15, 23, 42, 0.08)",
};
