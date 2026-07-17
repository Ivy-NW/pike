export interface RadiusScale {
  sm: number;
  DEFAULT: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
  /** Doc section 4 "20px corner radius" rule, applied to cards/sheets/primary buttons. */
  card: number;
}

export interface SpacingScale {
  unit: number;
  containerPadding: number;
  elementGap: number;
  sectionMargin: number;
  stackSm: number;
  stackMd: number;
}

/** Soft/rounded — matches the dark app mockups (rounded-xl/2xl cards, pill CTAs). */
export const vanguardDarkRadius: RadiusScale = { sm: 4, DEFAULT: 8, md: 12, lg: 16, xl: 24, full: 9999, card: 20 };
export const vanguardDarkSpacing: SpacingScale = { unit: 4, containerPadding: 20, elementGap: 12, sectionMargin: 28, stackSm: 8, stackMd: 14 };

/** Sharp/corporate — matches the light dashboard/landing mockups (hairline borders, low radius). */
export const vanguardLightRadius: RadiusScale = { sm: 2, DEFAULT: 4, md: 6, lg: 8, xl: 12, full: 9999, card: 8 };
export const vanguardLightSpacing: SpacingScale = { unit: 4, containerPadding: 16, elementGap: 16, sectionMargin: 24, stackSm: 8, stackMd: 16 };
