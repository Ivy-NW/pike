import { vanguardDark, vanguardLight, type ColorTokens } from "./palette";
import { vanguardDarkType, vanguardLightType, type TypeScale } from "./typography";
import {
  vanguardDarkRadius,
  vanguardDarkSpacing,
  vanguardLightRadius,
  vanguardLightSpacing,
  type RadiusScale,
  type SpacingScale,
} from "./shape";

export type ThemeMode = "light" | "dark";

export interface Theme {
  mode: ThemeMode;
  colors: ColorTokens;
  type: TypeScale;
  radius: RadiusScale;
  spacing: SpacingScale;
}

export const darkTheme: Theme = {
  mode: "dark",
  colors: vanguardDark,
  type: vanguardDarkType,
  radius: vanguardDarkRadius,
  spacing: vanguardDarkSpacing,
};

export const lightTheme: Theme = {
  mode: "light",
  colors: vanguardLight,
  type: vanguardLightType,
  radius: vanguardLightRadius,
  spacing: vanguardLightSpacing,
};

export const themes: Record<ThemeMode, Theme> = { light: lightTheme, dark: darkTheme };

/** kebab-case CSS custom property names for a color token map, e.g. onSurfaceVariant -> --on-surface-variant */
function toCssVars(colors: ColorTokens, prefix = ""): string {
  return Object.entries(colors)
    .map(([key, value]) => {
      const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `  --${prefix}${kebab}: ${value};`;
    })
    .join("\n");
}

/**
 * Generates the CSS variable block consumed by all three Next.js apps.
 * `:root` (and `[data-theme="light"]`) carries the light/corporate identity;
 * `[data-theme="dark"]` and the `prefers-color-scheme: dark` media query
 * carry the dark/Vanguard identity — the viewer's theme toggle stamps
 * `data-theme` on <html>, matching the Artifact theming convention used
 * elsewhere in this project.
 */
export function generateThemeCss(): string {
  return `:root, [data-theme="light"] {
${toCssVars(vanguardLight)}
  --radius-sm: ${vanguardLightRadius.sm}px;
  --radius: ${vanguardLightRadius.DEFAULT}px;
  --radius-md: ${vanguardLightRadius.md}px;
  --radius-lg: ${vanguardLightRadius.lg}px;
  --radius-xl: ${vanguardLightRadius.xl}px;
  --radius-full: ${vanguardLightRadius.full}px;
  --radius-card: ${vanguardLightRadius.card}px;
  --font-heading: "Geist", system-ui, sans-serif;
  --font-body: "Geist", system-ui, sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${toCssVars(vanguardDark)}
    --radius-sm: ${vanguardDarkRadius.sm}px;
    --radius: ${vanguardDarkRadius.DEFAULT}px;
    --radius-md: ${vanguardDarkRadius.md}px;
    --radius-lg: ${vanguardDarkRadius.lg}px;
    --radius-xl: ${vanguardDarkRadius.xl}px;
    --radius-full: ${vanguardDarkRadius.full}px;
    --radius-card: ${vanguardDarkRadius.card}px;
    --font-heading: "Space Grotesk", system-ui, sans-serif;
    --font-body: "Inter", system-ui, sans-serif;
    --font-mono: "Space Grotesk", system-ui, sans-serif;
  }
}

[data-theme="dark"] {
${toCssVars(vanguardDark)}
  --radius-sm: ${vanguardDarkRadius.sm}px;
  --radius: ${vanguardDarkRadius.DEFAULT}px;
  --radius-md: ${vanguardDarkRadius.md}px;
  --radius-lg: ${vanguardDarkRadius.lg}px;
  --radius-xl: ${vanguardDarkRadius.xl}px;
  --radius-full: ${vanguardDarkRadius.full}px;
  --radius-card: ${vanguardDarkRadius.card}px;
  --font-heading: "Space Grotesk", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "Space Grotesk", system-ui, sans-serif;
}
`;
}

/**
 * Pre-hydration inline script: reads the persisted choice (localStorage
 * "pike-theme") or falls back to system preference, then stamps
 * `data-theme` on <html> before first paint to avoid a flash of the wrong
 * theme. Identical across all three Next.js apps — import rather than
 * duplicate the literal JS.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('pike-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
