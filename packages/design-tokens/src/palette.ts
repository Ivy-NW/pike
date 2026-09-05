/**
 * Concrete Material-3-style token sets matching PIKE Logo Identity.
 *
 * Unified Brand Signature (Consistent across Dark and Light mode):
 * - Smoked Gold (Hero Brand Accent) — a desaturated brass pulled from the
 *   logo's mid-tone, deliberately restrained rather than a bright amber:
 *   Dark: #9C7C4A / #b79a5e
 *   Light: #7E6030 / #8C6B34 (deeper version of the same hue, for contrast)
 * - Cobalt Sapphire Blue (Diamond Crystal Accent):
 *   Dark: #3b82f6
 *   Light: #2563eb
 *
 * Both modes share one warm-neutral (non-blue) gray ramp so they read as one
 * system at different brightness rather than two different color schemes.
 * Dark: true black #000000 with Smoked Gold & Sapphire Blue glow.
 * Light: warm off-white #F6F4EF with warm-white cards, warm charcoal
 *        #1F1A14 text, and the same Smoked Gold & Sapphire Blue glow.
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
  surface: "#000000",
  surfaceDim: "#000000",
  surfaceBright: "#1e1e1e",
  surfaceContainerLowest: "#000000",
  surfaceContainerLow: "#0a0a0a",
  surfaceContainer: "#121212",
  surfaceContainerHigh: "#1a1a1a",
  surfaceContainerHighest: "#292929",
  surfaceVariant: "#1a1a1a",
  onSurface: "#ece7df", // Warm Ivory
  onSurfaceVariant: "#8f867a", // Warm Muted Taupe
  inverseSurface: "#e4e0d8",
  inverseOnSurface: "#000000",
  outline: "#5c5449",
  outlineVariant: "#2b2822",
  primary: "#9C7C4A", // Smoked Gold
  onPrimary: "#14100a",
  primaryContainer: "#2e2410",
  onPrimaryContainer: "#d9c19a",
  inversePrimary: "#7E6030", // = light-theme primary
  secondary: "#3b82f6", // Sapphire Gem Blue
  onSecondary: "#ffffff",
  secondaryContainer: "#1e3a8a",
  onSecondaryContainer: "#bfdbfe",
  tertiary: "#b79a5e", // Champagne variant of Smoked Gold
  onTertiary: "#14100a",
  tertiaryContainer: "#2a2110",
  onTertiaryContainer: "#ead9b0",
  error: "#f87171",
  onError: "#450a0a",
  errorContainer: "#7f1d1d",
  onErrorContainer: "#fecaca",
  background: "#000000",
  onBackground: "#ece7df",
  success: "#10B981",
  goldDeep: "#9C7C4A",
  pikeBlueGlow: "#3b82f6",
  slateGray: "#000000",
  textMuted: "#8f867a",
  borderSubtle: "rgba(156, 124, 74, 0.15)",
  borderStrong: "rgba(156, 124, 74, 0.35)",
  neumorphSurface: "#0d0d0d",
  neumorphShadowDark: "rgba(0, 0, 0, 0.9)",
  neumorphShadowLight: "rgba(255, 255, 255, 0.03)",
  neumorphInset: "#000000",
  neumorphBorder: "rgba(156, 124, 74, 0.18)",
};

export const vanguardLight: ColorTokens = {
  surface: "#F6F4EF",
  surfaceDim: "#E8E4DA",
  surfaceBright: "#ffffff",
  surfaceContainerLowest: "#FFFDF8",
  surfaceContainerLow: "#F8F6F1",
  surfaceContainer: "#FFFDF8",
  surfaceContainerHigh: "#EDE8DD",
  surfaceContainerHighest: "#D8D0C0",
  surfaceVariant: "#EDE8DD",
  onSurface: "#1F1A14", // Warm Charcoal
  onSurfaceVariant: "#6B6255", // Warm Mid-Gray
  inverseSurface: "#000000", // mirrors dark-theme surface
  inverseOnSurface: "#F6F4EF", // mirrors light-theme surface
  outline: "#8A8171",
  outlineVariant: "#D8D0C0",
  primary: "#7E6030", // Smoked Gold, deepened for light-mode contrast
  onPrimary: "#ffffff",
  primaryContainer: "#F0E3C2",
  onPrimaryContainer: "#4A3818",
  inversePrimary: "#9C7C4A", // = dark-theme primary
  secondary: "#2563eb", // Sapphire Gem Blue
  onSecondary: "#ffffff",
  secondaryContainer: "#dbeafe",
  onSecondaryContainer: "#1e3a8a",
  tertiary: "#8C6B34", // Champagne variant of Smoked Gold
  onTertiary: "#ffffff",
  tertiaryContainer: "#F2E6C8",
  onTertiaryContainer: "#4A3818",
  error: "#dc2626",
  onError: "#ffffff",
  errorContainer: "#fee2e2",
  onErrorContainer: "#991b1b",
  background: "#F6F4EF",
  onBackground: "#1F1A14",
  success: "#059669",
  goldDeep: "#7E6030",
  pikeBlueGlow: "#2563eb",
  slateGray: "#ffffff",
  textMuted: "#6B6255",
  borderSubtle: "rgba(126, 96, 48, 0.15)",
  borderStrong: "rgba(126, 96, 48, 0.35)",
  neumorphSurface: "#FFFDF8",
  neumorphShadowDark: "rgba(31, 26, 20, 0.12)",
  neumorphShadowLight: "#ffffff",
  neumorphInset: "#EDE8DD",
  neumorphBorder: "rgba(126, 96, 48, 0.18)",
};
