import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { useFonts as useOrbitron, Orbitron_400Regular, Orbitron_500Medium, Orbitron_600SemiBold, Orbitron_700Bold } from "@expo-google-fonts/orbitron";
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
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
