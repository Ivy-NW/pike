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

const toKebab = (key: string) => key.replace(/([A-Z])/g, "-$1").toLowerCase();

/**
 * Emits one `--type-{style}-*` group of vars per TypeScale entry (font-family,
 * font-size, font-weight, line-height, and letter-spacing where set), so
 * components can consume the type scale via CSS vars instead of hand-typing
 * raw font values. `uppercase` isn't emitted as a var -- it's a static,
 * compile-time-known property per style key, so a consuming .module.css class
 * just writes `text-transform: uppercase` directly rather than branching on a var.
 */
function toTypeCssVars(type: TypeScale): string {
  return Object.entries(type)
    .map(([key, style]) => {
      const kebab = toKebab(key);
      const lines = [
        `  --type-${kebab}-font-family: "${style.fontFamily}";`,
        `  --type-${kebab}-font-size: ${style.fontSize}px;`,
        `  --type-${kebab}-font-weight: ${style.fontWeight};`,
        `  --type-${kebab}-line-height: ${style.lineHeight};`,
      ];
      if (style.letterSpacing !== undefined) {
        lines.push(`  --type-${kebab}-letter-spacing: ${style.letterSpacing}em;`);
      }
      return lines.join("\n");
    })
    .join("\n");
}

/** Emits `--spacing-*` vars from the SpacingScale (doc §4 spacing tokens). */
function toSpacingCssVars(spacing: SpacingScale): string {
  return Object.entries(spacing)
    .map(([key, value]) => `  --spacing-${toKebab(key)}: ${value}px;`)
    .join("\n");
}

/**
 * Generates the CSS variable block consumed by all Next.js/Vite apps.
 * `:root` (and `[data-theme="light"]`) carries the light identity;
 * `[data-theme="dark"]` and the `prefers-color-scheme: dark` media query
 * carry the dark identity — the viewer's theme toggle stamps `data-theme`
 * on <html>, matching the Artifact theming convention used elsewhere in
 * this project. Both identities share one Orbitron/Inter font pairing and
 * one Smoked Gold accent family, differing mainly in surface brightness.
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
${toSpacingCssVars(vanguardLightSpacing)}
${toTypeCssVars(vanguardLightType)}
  --font-heading: "Orbitron", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "Orbitron", system-ui, sans-serif;
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
${toSpacingCssVars(vanguardDarkSpacing)}
${toTypeCssVars(vanguardDarkType)}
    --font-heading: "Orbitron", system-ui, sans-serif;
    --font-body: "Inter", system-ui, sans-serif;
    --font-mono: "Orbitron", system-ui, sans-serif;
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
${toSpacingCssVars(vanguardDarkSpacing)}
${toTypeCssVars(vanguardDarkType)}
  --font-heading: "Orbitron", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "Orbitron", system-ui, sans-serif;
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
