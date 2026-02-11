# Project Evolution Log

Purpose: Track meaningful AI/developer changes with enough context to roll back point-by-point.

## Entry Format
- Date (local): `YYYY-MM-DD`
- Actor: `AI`, `Developer`, or `AI+Developer`
- Scope: concise area name
- Files: explicit file list
- Change: what changed
- Why: reasoning / user goal
- Rollback: exact commit hash or PR

## Entries

### 2026-02-11
- Actor: AI+Developer
- Scope: Public brand color swatch reference page (`/brand-colors`) with noindex controls
- Files:
  - `content/brand-colors.md`
  - `static/css/brand-colors.css`
- Change: Added a dedicated, shareable brand color page with canonical swatches, token/value labels, usage notes, and brand rules; attached page-specific styling via external CSS and set page robots meta to `noindex, nofollow`.
- Why: User requested a professional public-facing swatch page for internal/external collaborator handoff that should remain accessible by URL but not indexed in search.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Brand color reference documentation
- Files:
  - `BRAND_COLORS.md`
  - `STYLE_GUIDE.md`
- Change: Added a dedicated brand color reference sheet with swatches, token names, hex/rgba values, usage guidance, and copy-ready brand rules; linked the file from the style guide key-files section.
- Why: User requested a centralized color sheet to improve brand consistency and faster matching across pages.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Schedule CTA token sync + Lighthouse render-blocking hygiene
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Introduced dedicated `--schedule-cta-*` tokens and rewired `.schedule-link` base/hover styles to consume tokens instead of hardcoded hex values. Removed five unused keyframe blocks (`gradient-shift`, `specular-sweep`, `logo-gleam`, `logo-sheen`, `shine`) from render-blocking CSS after Lighthouse insight review.
- Why: User requested final token cleanup and remediation of actionable Lighthouse findings while preserving the approved visual result.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: IT/HELP anti-purple micro-channel tune (v2)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Applied a smaller RGB channel correction to the logo blues (lower red, slightly higher green) across dark and light logo fills, preserving the same luminance hierarchy while reducing residual violet perception on Apple displays.
- Why: User still observed a subtle purplish cast in top logo edges and requested best-practice final polish rather than major recoloring.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: IT/HELP anti-purple hue correction (Apple-safe)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Rotated the IT/HELP blue ramp a few degrees cooler (same luminance band) and updated light-theme logo fills to match, reducing violet cast while preserving existing gold perimeter, hierarchy, and Safari-safe solid fill rendering.
- Why: User reported the top logo letters still read slightly purplish; objective was true-blue correction without reintroducing risky gradient text techniques.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Hero final optical-weight polish (logo blue depth, schedule restraint, pill centering)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Slightly deepened the IT/HELP blue ramp to reduce top-edge brightness, subdued Schedule CTA highlight/base blues another step so the logo remains the brightest blue element, darkened `san diego` for stronger lockup anchoring, and applied +1px bottom optical padding in the hero pill (desktop/mobile) while keeping the Apple-safe solid text-fill pipeline.
- Why: User requested a best-practice final refinement pass focused on cohesion, hierarchy, and professional finish without introducing rendering risk.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Hero hierarchy micro-tuning (blue split, plus depth, pill restraint)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Increased IT/HELP hierarchy by deepening `IT` blue while lifting `HELP`, added subtle depth shaping to the red plus via text-shadow (hue unchanged), darkened `san diego` tone for stronger anchoring, reduced hero pill gold border weight to a restrained thickness, and darkened the Schedule CTA blue one step to keep the logo as the dominant blue element.
- Why: User requested precision feedback on cohesion and asked to tighten visual hierarchy without redesigning the hero identity system.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: IT/HELP enterprise hierarchy blue split (IT darker, HELP lighter)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Shifted the logo authority blue ramp to an enterprise profile anchored on `#2F5FAF`, then split lockup hierarchy so `IT` uses the mid token while `HELP` uses the slightly lighter top token in both dark/light theme variants; retained existing gold stroke widths and `P` artifact safeguards.
- Why: User requested a more decisive, cohesive blue direction and provided a preference for `IT` darker with `HELP` subtly lighter while keeping gold perimeter treatment.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: IT/HELP deep cobalt-blue refinement (gold edge preserved)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Shifted the IT/HELP blue ramp to deeper, higher-saturation cobalt values and tuned blue depth-shadow channels (dark and light variants) so the lettering reads more decisively blue while preserving the existing gold stroke widths and per-glyph `P` stability safeguards.
- Why: User requested the strongest possible blue presentation, slightly darker than current, while keeping the gold perimeter around `IT` and `HELP`.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP blue-only darkening refinement (gold preserved)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Restored the logo blue ramp to a darker prior profile and darkened light-theme IT/HELP fill color while leaving all current gold stroke/perimeter settings unchanged.
- Why: User preferred the previous darker blue interior and requested focusing only on blue tone while keeping the current gold wrap behavior.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP richer blue + thicker gold wrap experiment
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Tuned the logo blue ramp to a richer mid-blue fill and increased IT/HELP gold perimeter stroke/closure intensity toward a pill-border-adjacent weight (dark + light variants), while retaining desktop per-glyph `P` carveout safeguards.
- Why: User requested experimentation with stronger interior blue presence and a thicker gold wrap option versus the prior thin perimeter.
- Rollback: this branch/PR (`codex/ithelp-blue-gold-balance-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP P top-spur subpixel cleanup (desktop)
- Files:
  - `templates/partials/hero_logo.html`
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Isolated the `P` in `HELP` for per-glyph desktop tuning, then snapped desktop logo sizing/offsets to integer-pixel geometry and reduced `P`-only stroke/halo intensity to suppress the persistent top spur without weakening the mobile wrap.
- Why: User-confirmed top-of-`P` artifact remained on desktop after global perimeter adjustments.
- Rollback: this branch/PR (`codex/ithelp-p-subpixel-clean-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP desktop P shoulder spur cleanup
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Added desktop-only (`min-width: 700px`) reductions for IT/HELP gold stroke and halo intensity (dark + light variants) to smooth the top shoulder of `P`, while preserving stronger mobile wrap settings.
- Why: User-reported artifact was visible on desktop at the top of `P` but not on mobile; breakpoint-scoped tuning targets the failing surface directly.
- Rollback: this branch/PR (`codex/ithelp-p-top-spur-fix-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP gold perimeter continuity pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Kept direct text-stroke rendering but strengthened perimeter continuity with a tiny centered gold smoothing halo and a subtle downward gold closure shadow (dark + light variants), while avoiding filter-based ring effects.
- Why: User feedback indicated the gold wrap around IT/HELP still looked incomplete/uneven and needed a cleaner, more continuous edge read.
- Rollback: this branch/PR (`codex/ithelp-gold-wrap-clean-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP P contour cleanup (Apple weight + stroke simplification)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Simplified IT/HELP edge treatment to direct gold text-stroke plus downward depth shadows (removed extra gold filter halos), slightly increased stroke width for cleaner full-perimeter read, and removed Apple-specific 800-weight downshift so Safari/iPhone keeps the native heavyweight glyph geometry.
- Why: User still observed dirty/janky rendering around the top of `P`; this pass prioritizes contour cleanliness over effect layering.
- Rollback: this branch/PR (`codex/ithelp-p-solid-clean-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP perimeter cleanup (P top-edge smoothing) + blue refinement
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Removed the top-edge micro highlight from IT/HELP shadow stacks, normalized gold stroke widths toward integer values, and rebalanced the gold smoothing/closure shadows so the outline reads more continuous around glyphs without rough `P` shoulder artifacting. Also nudged the logo blue ramp slightly darker for better headline fit.
- Why: User feedback confirmed the top of `P` still looked messy and requested a cleaner full-wrap gold perimeter with a better-fitting blue.
- Rollback: this branch/PR (`codex/ithelp-p-top-clean-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP horseshoe artifact cleanup + blue pop tune
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Switched wordmark stroke rendering back to `paint-order: stroke fill` to remove inner `P` horseshoe artifacts, added a downward-only gold micro-shadow for lower-edge closure, and nudged the logo blue ramp darker for stronger headline pop.
- Why: User feedback confirmed the prior pass reintroduced a `P` horseshoe artifact and still needed richer blue emphasis.
- Rollback: this branch/PR (`codex/ithelp-p-horseshoe-fix-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP perimeter closure + blue depth rebalance
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Switched IT/HELP stroke rendering to `paint-order: fill stroke` with near-1px gold strokes and a subtle downward gold micro-shadow so the perimeter reads as a complete wrap (including bottom edges). Also nudged logo blue ramp slightly darker for stronger headline presence.
- Why: User feedback showed bottom outline segments were still weak and the interior blue read too light.
- Rollback: this branch/PR (`codex/ithelp-gold-stroke-polish-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP gold stroke cleanup and solidity pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Increased IT/HELP stroke widths to near-1px values and added a tight gold smoothing halo in text-shadow to reduce jagged edges and make the gold perimeter read as a solid professional border.
- Why: User feedback confirmed the prior gold stroke was visible but still too thin/janky compared to the crisp hero pill border.
- Rollback: this branch/PR (`codex/ithelp-gold-stroke-polish-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP explicit gold stroke visibility pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Replaced IT/HELP drop-shadow perimeter ring with direct `-webkit-text-stroke` gold outlines (dark + light variants) keyed to `--accent-gold-solid`, while retaining blue fill and depth shadows.
- Why: User reported no visible gold perimeter after repeated ring-shadow passes and requested a clearly solid wrap comparable to the hero pill border.
- Rollback: this branch/PR (`codex/ithelp-explicit-gold-stroke-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP solid gold wrap visibility pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Strengthened IT/HELP perimeter ring with higher-opacity balanced drop-shadow offsets and switched ring color to the same solid gold used by the hero pill border (`#D2B56F`) so the wraparound outline is clearly visible.
- Why: User requested a more solid, obvious gold perimeter around letters comparable to the pillbox border treatment.
- Rollback: this branch/PR (`codex/ithelp-solid-gold-wrap-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP darker blue cohesion + P artifact cleanup
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Returned IT/HELP blue tokens to a deeper palette and replaced the dense directional gold text-shadow ring with a balanced drop-shadow perimeter model (dark + light variants) to smooth curved letter edges while preserving visible thin gold trim.
- Why: User feedback indicated the prior pass looked too light blue and still showed top-edge artifacting on `P`.
- Rollback: this branch/PR (`codex/ithelp-p-clean-darkblue-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP Safari artifact kill + headline emphasis pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Removed `background-clip:text` + transparent fill from IT/HELP and switched to solid blue `currentColor` fills with a cleaner, slightly thicker balanced gold perimeter shadow ring. Also brightened logo blue ramp tokens for stronger headline presence.
- Why: User feedback confirmed the `P` top artifact remained visible on both desktop and mobile and the interior blue still read too muted.
- Rollback: this branch/PR (`codex/ithelp-p-artifact-kill-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP desktop edge cleanup + blue fill pop pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Lifted the logo blue ramp for brighter interior fill, reduced inner contour heaviness, and rebalanced top/bottom gold perimeter ring weights so rounded glyph tops (notably `P`) render cleaner while keeping the thin wraparound gold strip visible.
- Why: User feedback indicated desktop still showed rough artifacts at the top of `P` and the inner blue needed more presence.
- Rollback: this branch/PR (`codex/ithelp-p-smooth-blue-pop-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP visible strip layering pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Reordered and resized the IT/HELP edge stack so a smaller inner blue contour sits above a larger gold ring (dark and light variants), producing a clearly visible thin gold strip around glyphs while keeping blue fill dominant.
- Why: User feedback remained that gold perimeter was not visible in real Safari/iPhone renderings.
- Rollback: this branch/PR (`codex/ithelp-gold-strip-visible-v2`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP gold perimeter band refinement
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Reworked IT/HELP edge treatment to a clearer perimeter gold band around each glyph (all sides) with a restrained dark outer cut, while preserving blue letter fill dominance and existing optical spacing.
- Why: User requested gold in the geographic perimeter around each letter rather than a faint top cue or yellow-dominant fill.
- Rollback: this branch/PR (`codex/ithelp-gold-band-outline-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP wraparound micro-trace refinement
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Replaced the single top gold cue with an ultra-low-alpha 360-degree sub-pixel trace around IT/HELP glyph edges (dark + light variants) while preserving blue-dominant fill and existing kerning/offset geometry.
- Why: User requested visible per-letter gold outlining without reintroducing an overall yellow/gold cast.
- Rollback: this branch/PR (`codex/ithelp-gold-outline-micro-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP de-yellow correction (blue-first with ultra-faint trace)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Reduced gold trace contribution to a single very low-alpha top cue and restored a brighter blue logo ramp so IT/HELP reads clearly blue at normal viewing distance while retaining micro-kerning/offset tuning.
- Why: User feedback showed the prior pass still looked too yellow in real-device renderings.
- Rollback: this branch/PR (`codex/ithelp-deyellow-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP blue-dominant micro-trace + kerning pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Rebalanced IT/HELP to stay clearly blue-first while retaining only a tiny gold edge cue, and introduced global micro-kerning/optical offset tuning (desktop + mobile) for tighter, more finished glyph geometry.
- Why: User feedback indicated the prior pass read too gold; objective was blue letterfill with a subtle premium trace and cleaner optical spacing.
- Rollback: this branch/PR (`codex/ithelp-blue-trace-kerning-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP micro gold-trace experiment
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Added a restrained top-biased gold micro-trace to IT/HELP letter shadow stacks (dark + light variants) while keeping core navy fill, red plus, and `san diego` unchanged.
- Why: Evaluate whether a tight gold edge cue increases perceived finish/premium quality without introducing noisy full-stroke artifacts.
- Rollback: this branch/PR (`codex/ithelp-gold-trace-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP head-anchor presence pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Re-centered on the premium-dark logo ramp, increased IT/HELP wordmark size/optical tightness, and reduced sheen back to restrained contour shadows so the text reads as the primary page anchor without changing `san diego` treatment.
- Why: User requested improvements specifically to the words `IT` and `HELP`, with stronger first-impression hierarchy and a more finished look.
- Rollback: this branch/PR (`codex/ithelp-head-anchor-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP modern-electric top-highlight variant
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Kept the premium-dark IT/HELP base depth but raised the top blue highlight and edge-light intensity slightly (dark + light variants) for a cleaner modern-electric finish without reverting to high-gloss glow.
- Why: User requested testing a brighter top-highlight direction while retaining a finished, professional navy wordmark.
- Rollback: this branch/PR (`codex/ithelp-modern-electric-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP premium-dark navy variant
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Shifted IT/HELP logo ramp to deeper navy-cobalt values and reduced gloss intensity in contour/depth shadows (dark and light theme variants) to produce a calmer, more finished premium-dark wordmark.
- Why: User requested a less shiny, deeper navy treatment to improve perceived refinement of the primary logo text.
- Rollback: this branch/PR (`codex/ithelp-premium-dark-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP wordmark refinement (crisper contour + cobalt ramp)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Tightened IT/HELP letter contour/depth shadows for cleaner edge definition and shifted logo blues to a richer cobalt ramp (dark and light theme variants) while keeping the red plus and `san diego` treatment unchanged.
- Why: Improve perceived polish and reduce the slightly gray/soft impression in the primary brand wordmark.
- Rollback: this branch/PR (`codex/ithelp-wordmark-refine-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: In-content gold CTA depth/geometry refinement
- Files:
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Rebuilt `.cta-button` styling to a modern gold relief treatment with stronger geometry (balanced height, medium radius), improved depth via layered shadows/gradient, and explicit hover/focus/active states for clearer affordance while keeping the gold role distinct from blue Schedule controls.
- Why: Align the "Book an On-Site Visit" button’s visual quality and interaction clarity with the hero control language without changing the color-role system.
- Rollback: this branch/PR (`codex/cta-button-depth-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: San Diego-to-tagline clearance refinement
- Files:
  - `static/css/late-overrides.css`
- Change: Increased hero tagline top spacing on desktop and mobile so the `san diego` descenders hold a clearer visual gap above the pill border while preserving existing lockup centering and hierarchy.
- Why: Continue vertical rhythm tuning from PR `#463` so spacing reads cleanly in real desktop and iPhone renderings.
- Rollback: this branch/PR (`codex/san-diego-descender-clearance-v1`, PR `#463`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego optical center correction (left shift)
- Files:
  - `static/css/late-overrides.css`
- Change: Shifted `san diego` slightly left at desktop and mobile breakpoints to better align with the composite `IT+HELP` glyph mass.
- Why: Screenshot review showed lockup still reading off-center even after spacing/size corrections.
- Rollback: this branch/PR (`codex/san-diego-optical-center-v3`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego vertical overshoot correction
- Files:
  - `static/css/late-overrides.css`
- Change: Reduced the prior upward shift of `san diego` to restore breathing room under `IT+HELP` while keeping the lockup tighter than the earlier baseline.
- Why: Screenshot review showed the previous pass pushed `san diego` too close to the main mark.
- Rollback: this branch/PR (`codex/san-diego-lockup-align-v2`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego lockup alignment correction (visible pass)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Made a stronger lockup adjustment by raising `san diego` closer to `IT+HELP`, reducing luminance/glow further, rebalancing desktop/mobile size ratio, and adding a slight optical center nudge for better alignment under the composite mark.
- Why: User feedback indicated previous adjustments were too subtle and still looked misaligned across desktop/mobile.
- Rollback: this branch/PR (`codex/san-diego-lockup-align-v2`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego hierarchy correction (subdued under primary mark)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Reduced `san diego` brightness/glow and lowered visual weight so it stays legible but clearly subordinate to `IT+HELP`.
- Why: User feedback showed `san diego` was reading too close to white and visually competing with the main brand text.
- Rollback: this branch/PR (`codex/plus-jiggle-logo-depth-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego lockup proportional consistency + tighter vertical relationship
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Raised `san diego` closer to `IT+HELP` and adjusted its desktop/mobile sizing so both breakpoints read as the same proportional lockup.
- Why: Remove remaining mismatch in logo representation between desktop and mobile while keeping clean hero spacing.
- Rollback: this branch/PR (`codex/plus-jiggle-logo-depth-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero pill edge cleanup + Schedule CTA depth/geometry refinement
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Removed inset-ring pill treatment in favor of a true gold border + cool translucent navy fill to eliminate inner-gap/tilt artifacts on mobile and desktop. Deepened and compacted the Schedule CTA so it reads more professional while keeping touch-target-safe nav geometry.
- Why: Improve perceived polish and readability under real iPhone rendering while keeping the control row cohesive and less visually airy.
- Rollback: this branch/PR (`codex/nav-row-schedule-depth-v6`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Plus micro-motion visibility + San Diego lockup consistency pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Increased plus micro-jitter visibility slightly (still subtle), sharpened plus edge definition, and tuned `san diego` to a steel-blue gray with tighter spacing and proportional sizing for closer desktop/mobile representation consistency.
- Why: Preserve calm polish while making the brand mark feel intentionally alive and visually consistent across devices.
- Rollback: this branch/PR (`codex/plus-jiggle-logo-depth-v1`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT+HELP color-system discipline
- Files:
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `sass/_custom.scss`
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Shifted to a cooler, restrained palette; reduced yellow drift; formalized token usage and guidance.
- Why: Increase premium/security-grade perception while preserving accessibility and Lighthouse posture.
- Rollback: PR `#421`, commit `b669dad`.

### 2026-02-07
- Actor: AI+Developer
- Scope: Hero logo edge tuning (IT/HELP)
- Files:
  - `static/css/late-overrides.css`
- Change: Reduced gold edge intensity/sheen on `IT` and `HELP` outlines by ~15-20% while preserving shape and legibility.
- Why: Keep dimensional readability for older eyes while lowering visual noise.
- Rollback: commit `7c51a15` (standalone branch/PR for targeted revert).

### 2026-02-07
- Actor: AI+Developer
- Scope: Cross-agent instruction visibility and handoff hygiene
- Files:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.cursorrules`
  - `.github/copilot-instructions.md`
  - `replit.md`
  - `README.md`
  - `STYLE_GUIDE.md`
- Change: Added canonical AI-agent instructions and pointers used by multiple tooling ecosystems; linked style/evolution docs for mandatory pre-read.
- Why: Ensure any AI agent touching the repo sees the same guardrails and records changes consistently.
- Rollback: this branch/PR (separate from base palette PR).

### 2026-02-07
- Actor: AI+Developer
- Scope: Explicit engineering philosophy and quality-gate enforcement
- Files:
  - `AGENTS.md`
  - `replit.md`
  - `STYLE_GUIDE.md`
- Change: Added non-negotiable quality philosophy and measurable acceptance gates (Lighthouse, Observatory, security, accessibility, performance, trust/psychology), with explicit "symbiotic best-practices" guidance across all systems.
- Why: Make standards explicit for all AI/dev contributors and prevent "fix later" development drift.
- Rollback: this branch/PR (separate from base palette PR).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP logo-edge micro-tune (post-merge refinement)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Applied a small follow-up reduction (about 8-10% from the previous tuned state) to IT/HELP edge and sheen alpha values while preserving thickness/geometry for readability.
- Why: Keep dimensional clarity for older eyes while reducing remaining visual shine/noise.
- Rollback: this branch/PR (`codex/ithelp-logo-edge-micro-tune`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Indigo blue token shift (no glow/glass pivot)
- Files:
  - `static/css/late-overrides.css`
  - `sass/_extra.scss`
  - `sass/css/abridge.scss`
  - `STYLE_GUIDE.md`
- Change: Shifted primary blue/link tokens from cyan-leaning web blue to a deeper indigo-leaning blue system for higher perceived depth and modernity, without adding glow effects or changing logo geometry.
- Why: Reduce "legacy/web-default blue" feel while preserving trust posture and readability.
- Rollback: this branch/PR (`codex/ithelp-indigo-blue-shift`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP and Schedule blue depth pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Kept the existing primary blue token but introduced a tonal indigo ramp on the IT/HELP letter fill and Schedule button, added subtle dimensional button treatment, and replaced cyan-leaning micro highlights with indigo-leaning highlights.
- Why: Remove remaining flat/"Windows 95" blue impression while preserving accessibility, performance, and calm authority.
- Rollback: this branch/PR (`codex/ithelp-blue-depth-pass`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP + Schedule color consistency refinement
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Split logo and Schedule into dedicated indigo depth ramps, reduced muddy/gray cast in IT/HELP lettering by tuning shadow/overlay balance, and removed logo gleam animation on the base letterforms for steadier type color.
- Why: Improve perceived quality and type-consistent blue identity while preserving trust posture and technical score gates.
- Rollback: this branch/PR (`codex/ithelp-logo-color-consistency-v2`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP logo de-silver correction
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Increased logo indigo saturation and reduced cool overlay intensity so IT/HELP letters read as blue (not silver/steel), while preserving gold edge and plus-sign treatment.
- Why: Match intended brand blue expression and improve perceived type consistency against the Schedule CTA.
- Rollback: this branch/PR (`codex/ithelp-logo-blue-de-silver`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP + Schedule hard blue alignment
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Aligned IT/HELP logo ramp directly to the Schedule button ramp and reduced cool overlay/shadow wash that desaturated the logo letters.
- Why: Deliver clear, unmistakable blue identity with immediate color parity between logo and Schedule CTA.
- Rollback: this branch/PR (`codex/ithelp-logo-button-blue-unify`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP clean typography pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Replaced multi-layer pseudo-text rendering on IT/HELP with single-layer letter rendering, retained indigo ramp fill, and kept restrained gold edge via stroke/shadow to remove ghosting/double-glyph artifacts.
- Why: Improve professional finish and color clarity while preventing visual duplication artifacts in real-world browsers/screenshots.
- Rollback: this branch/PR (`codex/ithelp-logo-clean-typography`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Safari glyph artifact fix + DNS Tool heading hierarchy cleanup
- Files:
  - `static/css/late-overrides.css`
  - `content/dns-tool.md`
  - `STYLE_GUIDE.md`
- Change: Replaced stroke-based logo edge with shadow-based edge treatment to prevent Safari glyph artifacts (notably on `P`), and removed the in-content top-level DNS Tool heading so the template `h1` is the single visible page title.
- Why: Improve rendering reliability and keep SEO/semantic heading structure clean with one `h1` per page.
- Rollback: this branch/PR (`codex/ithelp-logo-p-artifact-fix`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Blue-led cohesion refinement for IT/HELP logo
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Reduced gold edge-shadow intensity on IT/HELP lettering and increased subtle blue edge support so the logo reads clearly blue while retaining a restrained gold trim.
- Why: Improve color cohesion with the Schedule CTA and preserve a cleaner, more professional blue-first visual system.
- Rollback: this branch/PR (`codex/ithelp-color-cohesion-blue-led`).
- Gold fallback reference: `main@a3b9ea2` (PR `#430`) preserves the current gold-forward logo treatment if we decide to revert to that direction.

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP hard blue unification + heading semantics cleanup
- Files:
  - `static/css/late-overrides.css`
  - `templates/partials/hero_logo.html`
  - `STYLE_GUIDE.md`
- Change: Shifted logo and Schedule to the same stronger indigo ramp, removed `background-clip:text` logo rendering to eliminate Safari glyph artifacts, tuned logo depth shadows to stay blue-led, and changed the decorative hero logo wrapper from `h1` to a non-heading element so content pages keep one primary heading.
- Why: Deliver clear logo/button color cohesion, prevent `P`/glyph rendering artifacts, and keep SEO/accessibility heading structure cleaner.
- Rollback: this branch/PR (`codex/ithelp-blue-unify-v3`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Sonar accessibility cleanup for decorative hero mark
- Files:
  - `templates/partials/hero_logo.html`
- Change: Removed `role="img"` usage on the hero logo wrapper and marked the logo/location cluster as decorative with `aria-hidden="true"`.
- Why: Clear Sonar rule violation and keep semantic accessibility output clean.
- Rollback: this branch/PR (`codex/ithelp-blue-unify-v3`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Link-palette indigo cohesion pass (logo/button/link alignment)
- Files:
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Shifted dark/light link tokens to the same indigo hue family used by IT/HELP and Schedule, and updated phone-link override to follow shared link tokens instead of a separate cyan-leaning blue.
- Why: Remove color mismatch between logo/button and in-content links while keeping contrast-safe per-theme brightness.
- Rollback: this branch/PR (`codex/ithelp-link-blue-cohesion-v1`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Premium-electric indigo refresh + plus vertical centering
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Shifted the shared blue system to a richer electric-indigo ramp for logo/Schedule/links and moved `.logo-plus` up (`top: -0.055em`) for better vertical optical centering between `IT` and `HELP`.
- Why: Keep full color cohesion while removing the “boring/default blue” feel and tightening logo geometry.
- Rollback: this branch/PR (`codex/ithelp-premium-indigo-plus-align`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Cobalt-indigo high-chroma depth pass
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Moved the shared blue system to a stronger cobalt-indigo palette, increased top/bottom depth contrast in IT/HELP lettering shadows, and boosted Schedule CTA gradient contrast while keeping all links in the same hue family.
- Why: Address remaining “boring/default blue” perception without introducing glow-heavy effects or breaking cohesion.
- Rollback: this branch/PR (`codex/ithelp-cobalt-indigo-v2`).

### 2026-02-07
- Actor: AI+Developer
- Scope: De-purple to clean cobalt-blue pass
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Reduced purple hue bias across shared blue tokens, shifted logo/button/link palette to a cleaner cobalt-blue family, and retuned logo shadow tint channels to cool-blue values.
- Why: Correct user-reported purple cast while preserving cohesion and depth.
- Rollback: this branch/PR (`codex/ithelp-cobalt-no-purple`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Ice-cobalt energy pass
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Shifted shared blue tokens to a crisper ice-cobalt family, increased blue energy in logo/CTA gradients, and aligned link tokens to the same hue family with contrast-safe light-mode values.
- Why: Keep cohesive control while pushing toward a more exciting, less “generic” blue impression.
- Rollback: this branch/PR (`codex/ithelp-ice-cobalt-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Role-based blue depth pass (authority logo + action CTA/links)
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Introduced a role-based blue system within one hue family: deeper logo ramp for authority, brighter Schedule/link ramp for action clarity, and matching shadow/border tuning for cleaner depth.
- Why: Preserve full color cohesion while reducing “flat/boring default blue” perception and keeping trust-oriented visual psychology.
- Rollback: this branch/PR (`codex/ithelp-role-based-blue-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Signal-cobalt signature pass (higher energy, no purple cast)
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Shifted shared blue tokens to a brighter signal-cobalt family, increased logo letter depth via highlight/shadow tuning, and aligned Schedule + link ramps to the same hue family with stronger action contrast.
- Why: Keep cohesion while pushing the palette away from “boring/default blue” toward a cleaner premium look.
- Rollback: this branch/PR (`codex/ithelp-blue-signature-v5`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Royal-cobalt depth pass (bigger visible shift)
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Darkened and saturated the shared blue family to a royal-cobalt profile, deepened logo letter shadows for stronger dimensionality, and retuned Schedule/link blues to remain cohesive while reading less “default sky blue.”
- Why: Address user feedback that prior changes looked too subtle and still felt visually generic.
- Rollback: this branch/PR (`codex/ithelp-blue-royal-cobalt-v6`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Electric-cobalt dimensional pass (non-subtle)
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Switched IT/HELP letters from flat fill to a 3-stop electric-cobalt gradient fill, boosted schedule/button contrast in the same family, and retuned link blues for full-page cohesion.
- Why: Prior passes were perceived as too subtle/boring; this pass is intentionally obvious while staying performant and accessibility-safe.
- Rollback: this branch/PR (`codex/ithelp-logo-dimension-v7`).

### 2026-02-08
- Actor: AI+Developer
- Scope: DNS-aligned true blue + deep navy background pass
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Anchored IT/HELP + Schedule + links to DNS Tool’s non-purple blue family (`#58A6FF` anchor), and shifted site dark surfaces from flat black to deep navy-charcoal (`#0D1117` / `#161B22`) for cleaner contrast and less muddiness.
- Why: User requested a non-purple blue outcome and approved background changes if needed to reach a polished final look.
- Rollback: this branch/PR (`codex/ithelp-true-blue-v8`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Darken Schedule CTA on navy background
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Darkened Schedule button gradient, border, and glow/shadow intensity to fit the new deep navy surface while preserving high-contrast text and hover affordance.
- Why: User reported the Schedule button still looked too light against the darker page and wanted a darker, more polished CTA.
- Rollback: this branch/PR (`codex/ithelp-schedule-darken-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero panel translucency + icon parity + darker IT/HELP blue + vertical rhythm tune
- Files:
  - `static/css/late-overrides.css`
  - `templates/base.html`
  - `STYLE_GUIDE.md`
- Change: Darkened the IT/HELP logo blue ramp one step, made the hero “We solve tech problems” inner panel subtly translucent in dark mode (while preserving high contrast), increased home icon visual size/stroke to better match the sun glyph in the nav control row, and applied a micro-compression to hero spacing (logo block up slightly, `san diego` closer/centered under the mark, tagline/nav stack nudged upward).
- Why: User requested tighter icon parity, improved hero panel depth integration with the moving background, a less “light/boring” IT/HELP blue, and better vertical balance without losing premium whitespace.
- Rollback: this branch/PR (`codex/hero-panel-and-icon-balance-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero readability/breathing correction pass on PR #445
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Removed blur-prone treatment from the hero tagline panel, increased true dark-mode translucency so constellation particles read through cleanly, removed glow blur from tagline highlight words for sharper legibility, restored breathing space between tagline pill and nav row, and increased mobile `san diego` size/placement for better logo ratio.
- Why: User reported muddy/brown panel tone, blurred highlight words, cramped pill-to-nav spacing, and undersized mobile `san diego`.
- Rollback: this branch/PR (`codex/hero-panel-and-icon-balance-v1`), commit `58147f3` as immediate pre-fix reference.

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero control-row geometry + icon modernization
- Files:
  - `templates/base.html`
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Rebuilt the nav pill layout as fixed CSS slots (home/more/schedule/mode) so icon spacing is deterministic without manual text spaces, moved `More` + chevron into the same blue family as Schedule, added a deeper nav-shell treatment, and replaced the old filled home glyph with a cleaner outline house icon.
- Why: User reported spacing fragility and requested a tighter, more modern control row while preserving dark-mode polish and mobile tap ergonomics.
- Rollback: this branch/PR (`codex/nav-grid-modern-icon-blue-more`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero pill surface cleanup v4 (stroke ring + flat navy interior)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Replaced the gold fill-band ring with a strict 2px gold stroke, removed hover glow/bevel artifacts, and converted the interior from beveled gradient to a flatter translucent navy surface to reduce dirty/tilted edge perception on mobile and desktop.
- Why: User reported the previous pass looked worse and still felt noisy/unclean, especially on iPhone.
- Rollback: this branch/PR (`codex/hero-pill-clean-surface-v4`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero pill seam removal + Schedule CTA depth polish v5
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Moved the hero pill to a single-surface shell model (outer wrapper owns border+translucent fill, inner text layer is transparent) to eliminate inner-gap/tilt artifacts on desktop/mobile; also deepened and restrained the Schedule CTA gradient, border, and relief so it reads more premium and less toy-like.
- Why: User reported a visible inner gap/outline in the pill and requested a more professional, deeper Schedule button finish.
- Rollback: this branch/PR (`codex/hero-pill-and-schedule-polish-v5`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero pill edge-cleanup pass (remove inner seam artifact)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Removed the inner blue border/inset highlight that created a white seam on iPhone, switched to a cleaner single-surface navy translucent interior, and tightened the gold perimeter into a solid clean ring.
- Why: User reported the hero pill still looked dirty on mobile and not solid on desktop.
- Rollback: this branch/PR (`codex/hero-pill-clean-edges-v3`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero pill v2 anti-mud pass (true gold stroke + cooler translucency)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Converted hero pill perimeter to an explicit 2px gold border stroke and retuned the interior to a cooler, lighter navy-blue translucent gradient with reduced warm influence, preserving text crispness and particle visibility.
- Why: User reported the previous pill still read muddy/brown on iPhone and requested a clearer blue-translucent interior with a solid gold line.
- Rollback: this branch/PR (`codex/hero-pill-cool-blue-v2`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero tagline pill de-muddy pass (blue translucency + crisp gold perimeter)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Kept the hero pill gold frame but made it crisper and more stable, then shifted the dark-mode pill interior from warm/muddy tint to a cool navy-blue translucent gradient so constellation/particle motion remains visible while text contrast stays strong.
- Why: User reported brown/muddy pill fill and requested a blue-toned transparent interior with clear background-motion visibility, especially on mobile.
- Rollback: this branch/PR (`codex/hero-pill-blue-translucency-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego lockup de-compression and hierarchy correction
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Lowered `san diego` placement on desktop/mobile to remove the scrunched look under `IT+HELP`, and reduced its luminance/glow so it stays visibly subordinate to the primary logo text.
- Why: User feedback showed the lockup was over-tight and `san diego` was popping too close to body-white levels.
- Rollback: this branch/PR (`codex/san-diego-optical-center-v3`), commit `02ef35b` as pre-adjust reference.

### 2026-02-08
- Actor: AI+Developer
- Scope: Stronger vertical drop + stronger tonal separation for `san diego`
- Files:
  - `static/css/late-overrides.css`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Dropped `san diego` further away from `IT+HELP` on desktop and mobile (`margin-top` relaxed by ~5-6px) and darkened/desaturated the label/shadow so it no longer reads as the same visual tier as the primary mark.
- Why: User confirmed the lockup still looked too tight and that `san diego` remained too close to the IT/HELP color family.
- Rollback: this branch/PR (`codex/san-diego-drop-and-separate-v1`), previous baseline commit `8ceadfa`.

### 2026-02-08
- Actor: AI+Developer
- Scope: Cross-breakpoint centering parity + steel-gray `san diego` tone
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Unified desktop/mobile `san diego` horizontal nudge and vertical offset to the same lockup logic, then shifted `san diego` to a clearer steel gray-blue tone with softer shadow so it reads as a secondary line rather than the same brand-blue tier as `IT+HELP`.
- Why: User requested matching centering behavior across desktop/mobile and clearer color separation from the IT/HELP logo fill.
- Rollback: this branch/PR (`codex/san-diego-center-and-steel-v2`), baseline commit `bbdd35d`.

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego micro-drop spacing refinement
- Files:
  - `static/css/late-overrides.css`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Lowered `san diego` by an additional 2px on desktop and mobile (`margin-top: -11px -> -9px`) to add breathing room above the tagline pill while preserving centering and hierarchy tuning from the previous pass.
- Why: User confirmed overall direction but requested a small additional downward move because the logo lockup still felt slightly tight.
- Rollback: this branch/PR (`codex/san-diego-micro-drop-v1`), baseline commit `0aa7dac`.

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero stack rhythm rebalance (logo block -> tagline pill -> nav pill)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Lowered `san diego` another step (`margin-top: -9px -> -6px` desktop/mobile), increased logo-to-tagline spacing (`.tagline margin-top` desktop/mobile), and increased tagline-to-nav separation (`.nav-wrapper margin-top`) so the lockup reads as three clean tiers without descender collisions.
- Why: User reported the `g` descender in `san diego` still touching/crowding the gold tagline pill and requested full top-down spacing normalization.
- Rollback: this branch/PR (`codex/hero-stack-spacing-v1`), baseline commit `5901cf7`.

### 2026-02-08
- Actor: AI+Developer
- Scope: Descender clearance micro-pass (`san diego` to tagline pill)
- Files:
  - `static/css/late-overrides.css`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Increased only the `san diego` -> tagline spacing (`.tagline margin-top` +3px on desktop and mobile) to remove remaining visual collision with the `g` descender while leaving color, centering, and nav geometry untouched.
- Why: User confirmed direction but still observed the descender appearing too close to the gold tagline border.
- Rollback: this branch/PR (`codex/san-diego-descender-clearance-v1`), baseline commit `b3d6c4c`.
