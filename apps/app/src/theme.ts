import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { useFonts as useSpaceGrotesk, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { useFonts as useGeist, Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold } from "@expo-google-fonts/geist";
import { useFonts as useSpaceMono, SpaceMono_400Regular, SpaceMono_700Bold } from "@expo-google-fonts/space-mono";
import { darkTheme, lightTheme, type Theme, type TypeStyle } from "@pike/design-tokens";

export type { Theme, TypeStyle };

interface ThemeContextType {
  mode: "dark" | "light";
  toggleTheme: () => void;
  setThemeMode: (mode: "dark" | "light") => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"dark" | "light">("dark");

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
  const [a] = useSpaceGrotesk({ SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold });
  const [b] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [c] = useGeist({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold });
  const [d] = useSpaceMono({ SpaceMono_400Regular, SpaceMono_700Bold });
  return a && b && c && d;
}

const WEIGHT_NAME: Record<string, string> = { "400": "Regular", "500": "Medium", "600": "SemiBold", "700": "Bold" };
const MONO_WEIGHT: Record<string, string> = { "400": "400Regular", "500": "700Bold", "600": "700Bold", "700": "700Bold" };

const FAMILY_PREFIX: Record<string, string> = {
  "Space Grotesk": "SpaceGrotesk",
  Inter: "Inter",
  Geist: "Geist",
  "Space Mono": "SpaceMono",
};

export function rnFont(style: TypeStyle) {
  const prefix = FAMILY_PREFIX[style.fontFamily] ?? "System";
  const weightSuffix = style.fontFamily === "Space Mono" ? MONO_WEIGHT[style.fontWeight] : `${style.fontWeight}${WEIGHT_NAME[style.fontWeight]}`;
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
