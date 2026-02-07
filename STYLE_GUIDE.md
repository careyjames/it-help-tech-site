# Style Guide (Living)
Last updated: 2026-02-07

Purpose: Keep the visual system consistent and readable across the site. Update this file whenever palette, typography, or motion choices change.

## Brand Colors
- Primary Blue (logo + navigation CTA): `#2B6FC8`  
  - Source of truth: `--brand-blue` in `static/css/late-overrides.css`
  - If changed, also update:
    - `--brand-blue-rgb` (comma RGB)
    - `--brand-blue-glow` (particle glow)
- Gold Accent (reserved accent): `#C2A15A`
- Plus Red (plus symbol only): `#FF0066`
- Dark Background: `#0B0B0B`
- Light Text: `#FFFFFF`
- Secondary Text: `#B2BAC5` (e.g., "SAN DIEGO")

## Usage Rules
- Use Primary Blue for links, logo text, and navigation CTA (Schedule).
- Use Gold in controlled doses: CTA button style and restrained logo trim only.
- Red is reserved for the plus sign.
- Avoid introducing new colors without updating this guide.
- Do not use gold as a general link/highlight color across body content.

## Accessibility
- Minimum contrast ratio for normal text: 4.5:1 (WCAG).
- Re-run Lighthouse when changing the palette or text colors.

## Typography
- Logo: heavy system display (`SF Pro Display` / system stack).
- Body: site default; keep headings bold and legible.

## Motion
- Particles: subtle motion, visible but not distracting.
- Particle colors: mostly Primary Blue with ~30% Gold accents for sparkle.
- Constellation canvas: subtle drifting nodes + connecting lines behind the hero logo only.
- Constellation layout seed: golden-angle (Fibonacci/phyllotaxis-inspired) distribution for an intentional mathematical pattern.
- Light mode: increase constellation/particle contrast so motion remains visible on white backgrounds.
- Mobile light mode: on touch/narrow viewports, increase constellation contrast and link visibility so geometry reads clearly.
- Mobile dark mode: on narrow viewports, boost constellation visibility based on site theme state (`html:not(.switch)`), not OS color-scheme.
- Mobile dark layering: place constellation above particles on narrow dark viewports so line geometry remains visible.
- Mobile dark rendering: use sparse Fibonacci neighbor links (`+1,+2,+3,+5`) instead of full mesh links to avoid dense webbing.
- Respect `prefers-reduced-motion`: disable decorative hero motion effects when reduction is requested.
- Avoid aggressive glitch effects; prioritize clarity and polish.

## Key Files
- Hero/logo styles: `static/css/late-overrides.css`
- Palette + component tokens: `sass/_extra.scss`
- Theme link colors: `sass/css/abridge.scss`
- Logo markup: `templates/partials/hero_logo.html`
- Hero logo behavior: `static/js/hero-logo.js`
