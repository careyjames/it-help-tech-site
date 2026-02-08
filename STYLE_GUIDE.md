# Style Guide (Living)
Last updated: 2026-02-08

Purpose: Keep the visual system consistent and readable across the site. Update this file whenever palette, typography, or motion choices change.

## Brand Colors
- Primary Blue (shared hue anchor): `#3E98FF`  
  - Source of truth: `--brand-blue` in `static/css/late-overrides.css`
  - If changed, also update:
    - `--brand-blue-rgb` (comma RGB)
    - `--brand-blue-glow` (particle glow)
- Logo Authority Blue Ramp (deeper tone for premium trust feel):
  - Top: `#71B8FF` (`--logo-blue-top`)
  - Mid: `#3A7EE6` (`--logo-blue-mid`)
  - Bottom: `#1B469B` (`--logo-blue-bottom`)
- Schedule Indigo Depth Ramp:
  - Top: `#89CCFF` (`--schedule-blue-top`)
  - Mid: `#4AA3FF` (`--schedule-blue-mid`)
  - Bottom: `#2E73E7` (`--schedule-blue-bottom`)
- Body/Utility Link Blue (same hue family, action-biased):
  - Dark mode link: `#9DD7FF` (`$a1d`)
  - Dark mode hover: `#C9E9FF` (`$a2d`)
  - Light mode link: `#2372DE` (`$a1`)
  - Light mode hover: `#3A8AEE` (`$a2`)
- Gold Accent (reserved accent): `#C2A15A`
- Plus Red (plus symbol only): `#FF0066`
- Dark Background: `#0B0B0B`
- Light Text: `#FFFFFF`
- Secondary Text: `#B2BAC5` (e.g., "SAN DIEGO")

## Usage Rules
- Keep one hue family but use role-based depth:
  - Logo = deeper authority blue.
  - Schedule/link actions = brighter action blue.
- Blue direction: indigo-leaning (avoid consumer "UI chrome" blues and avoid cyan drift).
- High-emphasis blue surfaces (IT/HELP lettering and Schedule button) should remain in the same family even when depth differs by role.
- Standard text links (including phone/map links) should remain in-family with Schedule blue, only shifting brightness for contrast by theme.
- Current blue target: signal-cobalt with stronger clarity/energy, no purple cast, and no neon glow.
- Render IT/HELP letters as a single text layer; avoid duplicated pseudo-text overlays that can create ghosting on retina and screenshot captures.
- Prefer shadow-based edge treatment for IT/HELP lettering; avoid `-webkit-text-stroke` on logo glyphs because it can introduce Safari artifacts (notably on curved letters like `P`).
- Keep logo color strategy blue-led: gold should remain a restrained edge hint only, not a dominant fill impression.
- IT/HELP lettering should favor stable depth (tonal fill + restrained edge) over attention-grabbing glow.
- Avoid silver/steel casts in IT/HELP lettering by keeping cool overlay alpha restrained.
- Keep logo rendering Safari-stable: use solid indigo fill + shadow depth and avoid `background-clip:text` gradients on IT/HELP glyphs.
- Gold-forward fallback snapshot (if we intentionally choose that direction): `main@a3b9ea2` from PR `#430`; use it as the restore baseline for logo color treatment.
- Use Gold in controlled doses: CTA button style and restrained logo trim only.
- Red is reserved for the plus sign.
- Avoid introducing new colors without updating this guide.
- Do not use gold as a general link/highlight color across body content.
- Keep the red plus sign unchanged; it is a core identity anchor.
- Plus symbol vertical alignment target: `top: -0.055em` on `.logo-plus` to keep optical center aligned with IT/HELP cap height.
- Keep IT/HELP edge outlining for readability and depth, but tune intensity before adding thickness.
- Current target is a subdued edge treatment (~25% quieter than the original high-contrast pass) in `static/css/late-overrides.css`.

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

## Change Tracking
- AI agent entry point is `AGENTS.md`.
- Log visual-system changes in `PROJECT_EVOLUTION_LOG.md`.
- Each entry should include: date, actor (AI/dev), files changed, rationale, and rollback notes.

## Key Files
- Hero/logo styles: `static/css/late-overrides.css`
- Palette + component tokens: `sass/_extra.scss`
- Theme link colors: `sass/css/abridge.scss`
- Logo markup: `templates/partials/hero_logo.html`
- Hero logo behavior: `static/js/hero-logo.js`
- Evolution log: `PROJECT_EVOLUTION_LOG.md`
