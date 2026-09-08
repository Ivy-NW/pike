/**
 * Flat brand palette from docs/pike_ui_design.md section 2.
 * Use `vanguardDark`/`vanguardLight` (palette.ts) for actual component
 * styling — this table is the quick-reference/semantic-rule layer.
 */
export const brand = {
  pikeBlue: "#2563EB",
  /** Smoked Gold — dark-theme value; light theme uses the deeper #7E6030 variant of the same hue, same pattern as pikeBlue. */
  pikeGold: "#9C7C4A",
  deepSlate: "#111827",
  lightGray: "#F8FAFC",
  success: "#10B981",
  danger: "#EF4444",
  purpleAccent: "#7C3AED",
} as const;

/**
 * Gold-discipline guard (doc section 2): these token keys render Pike Gold
 * and must only be used for reward/achievement/VIP/XP moments — never as a
 * general UI color. Components should route through a RewardAccent-style
 * wrapper rather than referencing these directly.
 *
 * NOTE: in packages/design-tokens/src/palette.ts the gold ramp lives under
 * the `primary`/`primaryContainer`/`onPrimaryContainer` keys (and the
 * "Champagne" gold variant under `tertiary`/`tertiaryContainer`) — `secondary`
 * is actually Pike BLUE, the primary interactive color, not gold. This list
 * previously named the blue keys by mistake; corrected to the actual gold-
 * valued keys below.
 */
export const REWARD_ONLY_COLOR_KEYS = [
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "inversePrimary",
  "tertiary",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "goldDeep",
] as const;

/** Doc section 4 restraint rule: at most one filled Pike Blue primary button per screen. */
export const MAX_PRIMARY_BUTTONS_PER_SCREEN = 1;
