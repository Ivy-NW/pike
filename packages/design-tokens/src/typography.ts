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

/** Space Grotesk (headings) + Inter (body) — the dark/Vanguard identity. */
export const vanguardDarkType: TypeScale = {
  displayXl: { fontFamily: "Space Grotesk", fontSize: 32, fontWeight: "700", lineHeight: 1.1, letterSpacing: -0.04 },
  headlineLg: { fontFamily: "Space Grotesk", fontSize: 24, fontWeight: "700", lineHeight: 1.2, letterSpacing: -0.02 },
  headlineLgMobile: { fontFamily: "Space Grotesk", fontSize: 20, fontWeight: "700", lineHeight: 1.2 },
  headlineMd: { fontFamily: "Space Grotesk", fontSize: 18, fontWeight: "700", lineHeight: 1.3 },
  headlineSm: { fontFamily: "Space Grotesk", fontSize: 16, fontWeight: "600", lineHeight: 1.4 },
  bodyLg: { fontFamily: "Inter", fontSize: 15, fontWeight: "600", lineHeight: 1.5 },
  bodyMd: { fontFamily: "Inter", fontSize: 13, fontWeight: "400", lineHeight: 1.6 },
  labelCaps: { fontFamily: "Space Grotesk", fontSize: 12, fontWeight: "700", lineHeight: 1.0, letterSpacing: 0.08, uppercase: true },
  labelSm: { fontFamily: "Inter", fontSize: 11, fontWeight: "500", lineHeight: 1.2 },
};

/** Geist (headings + body) + Space Mono (labels/data) — the light/Vanguard Light identity. */
export const vanguardLightType: TypeScale = {
  displayXl: { fontFamily: "Geist", fontSize: 48, fontWeight: "700", lineHeight: 1.1, letterSpacing: -0.02 },
  headlineLg: { fontFamily: "Geist", fontSize: 32, fontWeight: "600", lineHeight: 1.2, letterSpacing: -0.01 },
  headlineLgMobile: { fontFamily: "Geist", fontSize: 24, fontWeight: "600", lineHeight: 1.2 },
  headlineMd: { fontFamily: "Geist", fontSize: 20, fontWeight: "600", lineHeight: 1.4 },
  headlineSm: { fontFamily: "Geist", fontSize: 16, fontWeight: "600", lineHeight: 1.4 },
  bodyLg: { fontFamily: "Geist", fontSize: 18, fontWeight: "400", lineHeight: 1.6 },
  bodyMd: { fontFamily: "Geist", fontSize: 16, fontWeight: "400", lineHeight: 1.6 },
  labelCaps: { fontFamily: "Space Mono", fontSize: 14, fontWeight: "500", lineHeight: 1.0, letterSpacing: 0.05, uppercase: true },
  labelSm: { fontFamily: "Space Mono", fontSize: 12, fontWeight: "500", lineHeight: 1.0, letterSpacing: 0.05, uppercase: true },
};
