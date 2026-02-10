# Style Guide (Living)
Last updated: 2026-02-09

Purpose: Keep the visual system consistent and readable across the site. Update this file whenever palette, typography, or motion choices change.

## Brand Colors
- Primary Blue (shared hue anchor): `#58A6FF`  
  - Source of truth: `--brand-blue` in `static/css/late-overrides.css`
  - If changed, also update:
    - `--brand-blue-rgb` (comma RGB)
    - `--brand-blue-glow` (particle glow)
- Logo Authority Blue Ramp (deeper tone for premium trust feel):
  - Top: `#90C7FA` (`--logo-blue-top`)
  - Mid: `#4A86D8` (`--logo-blue-mid`)
  - Bottom: `#1F56A8` (`--logo-blue-bottom`)
- Schedule Indigo Depth Ramp:
  - Top: `#6CAFEF` (`--schedule-blue-top`)
  - Mid: `#3F86D8` (`--schedule-blue-mid`)
  - Bottom: `#2359A9` (`--schedule-blue-bottom`)
- Body/Utility Link Blue (same hue family, action-biased):
  - Dark mode link: `#79B8FF` (`$a1d`)
  - Dark mode hover: `#A5D0FF` (`$a2d`)
  - Light mode link: `#2B6FCD` (`$a1`)
  - Light mode hover: `#4A8EDF` (`$a2`)
- Gold Accent (reserved accent): `#C2A15A`
- Plus Red (plus symbol only): `#FF0066`
- Dark Background: `#0D1117` (primary), `#161B22` (elevated surface)
- Light Text: `#FFFFFF`
- Secondary Text: `#B2BAC5` (e.g., "SAN DIEGO")

## Usage Rules
- Keep one hue family but use role-based depth:
  - Logo = deeper authority blue.
  - Schedule/link actions = clearly actionable blue, but on dark pages prefer a darker CTA tone to avoid glowing too bright.
- IT/HELP lettering should use a 3-stop gradient fill (top/mid/bottom logo ramp) for clear dimensionality at a glance.
- Blue direction: indigo-leaning (avoid consumer "UI chrome" blues and avoid cyan drift).
- Current lock target: true non-purple blue aligned to DNS Tool `--status-info` (`#58A6FF`) as the anchor.
- High-emphasis blue surfaces (IT/HELP lettering and Schedule button) should remain in the same family even when depth differs by role.
- Standard text links (including phone/map links) should remain in-family with Schedule blue, only shifting brightness for contrast by theme.
- Current blue target: DNS-aligned true blue (non-purple), with depth from shading rather than violet tint.
- Render IT/HELP letters as a single text layer; avoid duplicated pseudo-text overlays that can create ghosting on retina and screenshot captures.
- Prefer shadow-based edge treatment for IT/HELP lettering; avoid `-webkit-text-stroke` on logo glyphs because it can introduce Safari artifacts (notably on curved letters like `P`).
- Keep logo color strategy blue-led: gold should remain a restrained edge hint only, not a dominant fill impression.
- IT/HELP lettering should favor stable depth (tonal fill + restrained edge) over attention-grabbing glow.
- Current IT/HELP finish target: blue-dominant fill with strong silhouette presence (slightly larger wordmark, restrained gloss, crisp contour).
- IT/HELP gold treatment, if used, should be a visible-but-thin perimeter strip (all sides) with blue fill still dominant at normal viewing distance.
- Apply micro-kerning and optical offsets to IT/HELP consistently across desktop and mobile; avoid relying on one breakpoint tune.
- Avoid silver/steel casts in IT/HELP lettering by keeping cool overlay alpha restrained.
- Keep logo rendering Safari-stable: use solid indigo fill + shadow depth and avoid `background-clip:text` gradients on IT/HELP glyphs.
- Gold-forward fallback snapshot (if we intentionally choose that direction): `main@a3b9ea2` from PR `#430`; use it as the restore baseline for logo color treatment.
- Use Gold in controlled doses: CTA button style and restrained logo trim only.
- Red is reserved for the plus sign.
- Avoid introducing new colors without updating this guide.
- Do not use gold as a general link/highlight color across body content.
- Keep the red plus sign unchanged; it is a core identity anchor.
- Plus symbol vertical alignment target: `top: -0.055em` on `.logo-plus` to keep optical center aligned with IT/HELP cap height.
- Plus motion should remain subtle-but-visible in normal mode (a brief micro-jitter pulse), and be disabled only when `prefers-reduced-motion` is set.
- Keep IT/HELP edge outlining for readability and depth, but tune intensity before adding thickness.
- Current target is a subdued edge treatment (~25% quieter than the original high-contrast pass) in `static/css/late-overrides.css`.
- `san diego` lockup should read as steel-blue gray (not flat gray), with a tight optical gap under IT/HELP and consistent desktop/mobile proportion.
- Keep the `san diego` size ratio to the IT/HELP mark visually consistent across breakpoints (desktop and mobile should read like the same lockup, not two different logo scales).
- `san diego` must remain visually subordinate to `IT+HELP`: lower luminance, softer glow, and lighter emphasis than primary brand text.
- Apply a small optical center nudge to `san diego` when needed so it sits centered under the composite `IT+HELP` glyph mass, not just mathematically centered text bounds.
- Keep vertical lockup breathing room: `san diego` should never touch/scrunch into `IT+HELP`; favor a slightly lower placement over over-tight stacking.
- Keep explicit descender clearance: the `g` in `san diego` should never approach the hero tagline border; preserve visible gap in both desktop and mobile lockups.
- Tone target for `san diego`: steel gray-blue (not brand-logo blue) so hierarchy stays clear even when the lockup is centered and tight.
- Hero tagline panel should remain dark-first and high-legibility, but may use light translucency in dark mode; do not make it fully transparent.
- Hero tagline panel should be translucent enough to reveal background motion subtly, but never use backdrop blur that softens tagline readability.
- Hero tagline panel interior in dark mode should stay cool navy-blue translucent; avoid warm/brown casts.
- Hero tagline gold frame should read as a crisp solid perimeter on mobile and desktop.
- Implement hero tagline perimeter as a true gold border stroke (not a warm fill band) to avoid muddy color bleed on iPhone.
- Avoid inner highlight seams on the hero pill: no inset white line, inset border ring, or inner blue edge that can read as a gap on mobile.
- Keep hero pill interior as a clean flat translucent navy surface (no faux bevel/tilt gradients) for a tighter professional finish.
- Keep hero pill as a single-surface shell (border + translucent fill on outer wrapper, transparent text layer) to prevent inner-gap artifacts.
- Highlight words inside the hero tagline (`tech problems`, `retainers`) should remain crisp; avoid glow blur on those terms.
- Keep nav icon slots symmetric; if house vs sun optical size diverges, tune glyph size/stroke, not whitespace hacks.
- Hero nav row uses fixed slot geometry (home slot, more, schedule, mode slot). Keep spacing in CSS grid; do not add manual whitespace characters in markup to fake alignment.
- `More` label + chevron should stay in the Schedule blue family for control-row cohesion.
- Schedule CTA should favor deeper, restrained blue depth (not bright toy-like highlights) with subtle professional relief.
- In-content gold CTA (`.cta-button`, e.g. "Book an On-Site Visit") should use the same geometry language as Schedule (balanced height, medium corner radius, restrained relief) while remaining gold-first for role separation.
- Keep Schedule CTA slightly shorter than icon slots so the control row height is driven by 44px-class tap targets, not by the button block.
- Home glyph should stay as a modern outline icon (Apple-style weight/rounding) at a 44px-class touch target on mobile.
- Hero vertical rhythm should use micro-adjustments only: reduce dead air above the logo and tighten `san diego` under IT+HELP, while preserving clear separation between logo block, tagline pill, and nav row.

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
