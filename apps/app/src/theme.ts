import { useColorScheme } from "react-native";
import { useFonts as useSpaceGrotesk, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { useFonts as useGeist, Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold } from "@expo-google-fonts/geist";
import { useFonts as useSpaceMono, SpaceMono_400Regular, SpaceMono_700Bold } from "@expo-google-fonts/space-mono";
import { darkTheme, lightTheme, type Theme, type TypeStyle } from "@pike/design-tokens";

export type { Theme, TypeStyle };

/** Holds the splash screen until every weight used by both theme identities has loaded. */
export function useAppFonts() {
  const [a] = useSpaceGrotesk({ SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold });
  const [b] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [c] = useGeist({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold });
  const [d] = useSpaceMono({ SpaceMono_400Regular, SpaceMono_700Bold });
  return a && b && c && d;
}

const WEIGHT_NAME: Record<string, string> = { "400": "Regular", "500": "Medium", "600": "SemiBold", "700": "Bold" };

/** Space Mono only ships 400/700 — snap in-between weights to the nearest available one. */
const MONO_WEIGHT: Record<string, string> = { "400": "400Regular", "500": "700Bold", "600": "700Bold", "700": "700Bold" };

const FAMILY_PREFIX: Record<string, string> = {
  "Space Grotesk": "SpaceGrotesk",
  Inter: "Inter",
  Geist: "Geist",
  "Space Mono": "SpaceMono",
};

/** Converts a cross-platform TypeStyle (see @pike/design-tokens) into RN Text style props —
 * RN has no font-weight synthesis for custom fonts, so family+weight must resolve to one
 * of the exact loaded font names above, and lineHeight must be absolute px, not a multiplier. */
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

export function useTheme(): Theme & { font: (s: TypeStyle) => ReturnType<typeof rnFont> } {
  const scheme = useColorScheme();
  const theme = scheme === "light" ? lightTheme : darkTheme;
  return { ...theme, font: rnFont };
}
