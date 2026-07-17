---
name: Pike Vanguard Light
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#4d556b'
  on-tertiary: '#ffffff'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1440px
---

## Brand & Style
The design system emphasizes a high-tech, precision-engineered aesthetic tailored for mission-critical operations and technical performance. The personality is authoritative, systematic, and forward-leaning, moving away from dark-mode "stealth" towards a "laboratory-grade" clarity.

The visual style is **Corporate Modern with a Geometric edge**. It utilizes a crisp, white-dominated palette to evoke a sense of professional transparency and organization. High-contrast elements and structured layouts ensure that complex data remains legible and actionable. The aesthetic is defined by sharp utility, where form strictly follows function, utilizing subtle technological motifs like hairline borders and systematic grids.

## Colors
This design system utilizes a high-luminance palette designed for clarity. The primary surface is pure white (#FFFFFF), providing a neutral stage for high-density information. 

- **Pike Blue (#2563EB):** Used for primary actions, active states, and structural highlights. It denotes progress and interaction.
- **Pike Gold (#F59E0B):** A high-visibility accent used for warnings, critical indicators, and strategic callouts.
- **Grays:** A palette of cool slates provides structural hierarchy. Backgrounds move from white to `surface_secondary` (#F8FAFC) to create logical separation between content zones.
- **Contrast:** Typography is anchored in Slate-900 (#0F172A) to ensure maximum accessibility and a "printed" feel against the light surfaces.

## Typography
The typography strategy leverages **Geist** for its technical precision and neutral clarity in all primary reading paths. Its monolinear construction reinforces the high-tech narrative.

For technical data, status indicators, and metadata, **Space Mono** is used to provide a "terminal" or "readout" aesthetic. This distinction helps users instantly differentiate between instructional content and raw data. All labels should be set in uppercase when using Space Mono to enhance the systematic feel.

## Layout & Spacing
The layout follows a **Rigid Fluid Grid** model. While the container adapts to screen width, it strictly adheres to a 12-column structure on desktop and a 4-column structure on mobile.

- **Rhythm:** All spacing is based on a 4px baseline unit. 
- **Gutters:** Standardized at 24px to ensure breathing room between high-density data components.
- **Margins:** Desktop views utilize generous 40px outer margins to center the focus, while mobile compresses to 16px to maximize screen real estate.
- **Density:** Information density should be high but organized. Use `surface_secondary` fills to group related elements rather than relying solely on whitespace.

## Elevation & Depth
In this light-mode variant, depth is communicated through **Tonal Layering and Low-Contrast Outlines** rather than heavy shadows.

- **Surfaces:** Use `#FFFFFF` for the highest elevation (modals, active cards). Use `#F8FAFC` for the main background.
- **Borders:** Define edges with 1px solid strokes using `border_subtle` (#E2E8F0). For interactive elements, transition to `border_strong` (#CBD5E1) or Pike Blue.
- **Shadows:** Use only one level of elevation shadow: a very soft, highly diffused Slate-tinted shadow (0px 4px 20px rgba(15, 23, 42, 0.05)) for floating elements like dropdowns or tooltips.
- **Glassmorphism:** Use sparingly for navigation bars. Apply a `backdrop-filter: blur(12px)` with a `rgba(255, 255, 255, 0.8)` fill to maintain context of the content beneath.

## Shapes
The shape language is **Soft-Geometric**. By using a subtle 0.25rem (4px) base radius, the system retains a technical, structured appearance without feeling aggressively sharp or overly consumer-friendly.

- **Standard Elements:** 4px radius (Inputs, Buttons, Cards).
- **Large Components:** 8px radius (Large containers, Modals).
- **Data Points:** 0px radius for vertical accent bars or status indicators to emphasize the grid.

## Components
- **Buttons:** Primary buttons use Pike Blue with white text. Secondary buttons use a white fill with a `border_strong` stroke and Slate-900 text. Use uppercase Space Mono for button labels to reinforce the technical aesthetic.
- **Cards:** Cards should have a white background, a 1px border of `border_subtle`, and no shadow. On hover, the border shifts to Pike Blue or adds the subtle elevation shadow.
- **Input Fields:** Use `surface_secondary` for the background fill with a bottom-border only or a full subtle stroke. Focus states must use a 2px Pike Blue stroke.
- **Navigation Bars:** Top-tier navigation should be docked with a blur effect. Use Slate-900 for icons and text to ensure high contrast against the translucent background.
- **Chips/Status:** Use Pike Gold for "Warning" or "Pending" states with a light gold tinted background. Use Pike Blue for "Info" and Slate for "Neutral" tags.
- **Lists:** Use `border_subtle` separators between list items. High-contrast text for titles (Slate-900) and mid-contrast (Neutral) for descriptions.