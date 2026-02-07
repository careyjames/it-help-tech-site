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
