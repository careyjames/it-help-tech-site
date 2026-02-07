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
