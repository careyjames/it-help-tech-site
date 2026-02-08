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
