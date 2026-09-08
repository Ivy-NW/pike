import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { useFonts as useOrbitron, Orbitron_400Regular, Orbitron_500Medium, Orbitron_600SemiBold, Orbitron_700Bold } from "@expo-google-fonts/orbitron";
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { darkTheme, lightTheme, brand, type Theme, type TypeStyle } from "@pike/design-tokens";

/**
 * PIKE_UI_Design_Doc §4: a consistent 20px corner radius on buttons, cards,
 * bottom sheets, and map elements, in BOTH light and dark mode. This is
 * intentionally a local constant rather than `theme.radius.card` — that
 * shared token is mode-dependent (`shape.ts`'s light scale is the sharp,
 * low-radius style built for the landing page/dashboard, not this app).
 */
export const RADIUS_CARD = 20;

export type { Theme, TypeStyle };

interface ThemeContextType {
  mode: "dark" | "light";
  toggleTheme: () => void;
  setThemeMode: (mode: "dark" | "light") => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"dark" | "light">("light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setThemeMode = (newMode: "dark" | "light") => {
    setMode(newMode);
  };

  return React.createElement(
    ThemeContext.Provider,
    { value: { mode, toggleTheme, setThemeMode } },
    children
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}

/** Holds the splash screen until every weight used by both theme identities has loaded. */
export function useAppFonts() {
  const [a] = useOrbitron({ Orbitron_400Regular, Orbitron_500Medium, Orbitron_600SemiBold, Orbitron_700Bold });
  const [b] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  return a && b;
}

const WEIGHT_NAME: Record<string, string> = { "400": "Regular", "500": "Medium", "600": "SemiBold", "700": "Bold" };

const FAMILY_PREFIX: Record<string, string> = {
  Orbitron: "Orbitron",
  Inter: "Inter",
};

export function rnFont(style: TypeStyle) {
  const prefix = FAMILY_PREFIX[style.fontFamily] ?? "System";
  const weightSuffix = `${style.fontWeight}${WEIGHT_NAME[style.fontWeight]}`;
  return {
    fontFamily: prefix === "System" ? undefined : `${prefix}_${weightSuffix}`,
    fontSize: style.fontSize,
    lineHeight: Math.round(style.fontSize * style.lineHeight),
    letterSpacing: style.letterSpacing ? style.letterSpacing * style.fontSize : undefined,
    textTransform: style.uppercase ? ("uppercase" as const) : undefined,
  };
}

export function useTheme(): Theme & { font: (s: TypeStyle) => ReturnType<typeof rnFont>; toggleTheme: () => void } {
  const { mode, toggleTheme } = useThemeMode();
  const baseTheme = mode === "light" ? lightTheme : darkTheme;
  return { ...baseTheme, mode, font: rnFont, toggleTheme };
}

/**
 * Semantic color layer for apps/app only (docs/pike_ui_design.md §2/§4).
 *
 * `packages/design-tokens/src/palette.ts` names the gold ramp `primary` and
 * the blue ramp `secondary` -- the opposite of what those names suggest, and
 * the source of the gold-as-default-UI-color bug this hook exists to
 * prevent. Screens in this app should reach for `action`/`reward`/`arGlow`
 * below instead of `theme.colors.primary`/`secondary` directly, so the
 * *meaning* of the color is explicit at every call site.
 *
 * - `action` -- Pike Blue. The one interactive/primary UI color. Max one
 *   filled action button per screen (see `MAX_PRIMARY_BUTTONS_PER_SCREEN`).
 * - `reward` -- Pike Gold. Reserved exclusively for reward/XP/badge/VIP
 *   moments -- never navigation, chrome, or a default active/selected state.
 * - `arGlow` -- Purple Accent. The AR-recognition moment and badge-earned
 *   rows only (doc §7.2/§7.4).
 */
export function useSemanticColors() {
  const theme = useTheme();
  const c = theme.colors;
  return {
    action: c.secondary,
    onAction: c.onSecondary,
    actionContainer: c.secondaryContainer,
    onActionContainer: c.onSecondaryContainer,
    reward: c.primary,
    onReward: c.onPrimary,
    rewardContainer: c.primaryContainer,
    onRewardContainer: c.onPrimaryContainer,
    arGlow: brand.purpleAccent,
  };
}
