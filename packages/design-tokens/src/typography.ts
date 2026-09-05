export interface TypeStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: "400" | "500" | "600" | "700";
  lineHeight: number;
  letterSpacing?: number;
  uppercase?: boolean;
}

export interface TypeScale {
  displayXl: TypeStyle;
  headlineLg: TypeStyle;
  headlineLgMobile: TypeStyle;
  headlineMd: TypeStyle;
  headlineSm: TypeStyle;
  bodyLg: TypeStyle;
  bodyMd: TypeStyle;
  labelCaps: TypeStyle;
  labelSm: TypeStyle;
}

/**
 * Orbitron (headings + caps labels) + Inter (body + small labels) — the one
 * type pairing shared by both the dark and light identities. Per-style sizes
 * stay distinct (dark keeps its denser mobile scale, light keeps its larger
 * corporate scale); only the font families are unified.
 */
export const vanguardDarkType: TypeScale = {
  displayXl: { fontFamily: "Orbitron", fontSize: 32, fontWeight: "700", lineHeight: 1.1, letterSpacing: -0.04 },
  headlineLg: { fontFamily: "Orbitron", fontSize: 24, fontWeight: "700", lineHeight: 1.2, letterSpacing: -0.02 },
  headlineLgMobile: { fontFamily: "Orbitron", fontSize: 20, fontWeight: "700", lineHeight: 1.2 },
  headlineMd: { fontFamily: "Orbitron", fontSize: 18, fontWeight: "700", lineHeight: 1.3 },
  headlineSm: { fontFamily: "Orbitron", fontSize: 16, fontWeight: "600", lineHeight: 1.4 },
  bodyLg: { fontFamily: "Inter", fontSize: 15, fontWeight: "600", lineHeight: 1.5 },
  bodyMd: { fontFamily: "Inter", fontSize: 13, fontWeight: "400", lineHeight: 1.6 },
  labelCaps: { fontFamily: "Orbitron", fontSize: 12, fontWeight: "700", lineHeight: 1.0, letterSpacing: 0.08, uppercase: true },
  labelSm: { fontFamily: "Inter", fontSize: 11, fontWeight: "500", lineHeight: 1.2 },
};

export const vanguardLightType: TypeScale = {
  displayXl: { fontFamily: "Orbitron", fontSize: 48, fontWeight: "700", lineHeight: 1.1, letterSpacing: -0.02 },
  headlineLg: { fontFamily: "Orbitron", fontSize: 32, fontWeight: "600", lineHeight: 1.2, letterSpacing: -0.01 },
  headlineLgMobile: { fontFamily: "Orbitron", fontSize: 24, fontWeight: "600", lineHeight: 1.2 },
  headlineMd: { fontFamily: "Orbitron", fontSize: 20, fontWeight: "600", lineHeight: 1.4 },
  headlineSm: { fontFamily: "Orbitron", fontSize: 16, fontWeight: "600", lineHeight: 1.4 },
  bodyLg: { fontFamily: "Inter", fontSize: 18, fontWeight: "400", lineHeight: 1.6 },
  bodyMd: { fontFamily: "Inter", fontSize: 16, fontWeight: "400", lineHeight: 1.6 },
  labelCaps: { fontFamily: "Orbitron", fontSize: 14, fontWeight: "500", lineHeight: 1.0, letterSpacing: 0.05, uppercase: true },
  labelSm: { fontFamily: "Inter", fontSize: 12, fontWeight: "500", lineHeight: 1.0, letterSpacing: 0.05, uppercase: true },
};
