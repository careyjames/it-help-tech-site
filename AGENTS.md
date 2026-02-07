# AGENTS.md

## Mandatory Read (All AI Agents)

If you are an AI coding or automation agent (Codex, Replit Agent, Claude Code, Cursor, Copilot, Anti-Gravity, or similar), read these files before making any edits:

1. `STYLE_GUIDE.md`
2. `PROJECT_EVOLUTION_LOG.md`
3. `replit.md` (for build/deploy pipeline constraints)

Do not make style or UX edits until those files are read.

## Engineering Philosophy (Hard Quality Bar)

Build clean from the foundations up. Do not defer quality for later cleanup.

- This project is expected to be materially better than typical web builds.
- Changes must preserve or improve quality from all angles: speed, security, accessibility, code clarity, and conversion psychology.
- Prefer simple, durable architecture over short-term hacks.
- If a change introduces debt, stop and redesign before merging.
- Treat best practices as a symbiotic system: true quality is reached when all participating angles support each other (security, performance, accessibility, UX psychology, maintainability, and operations).
- We want to be different by pursuing that fully integrated standard, not isolated metric wins.

## Acceptance Gates (Required)

Every meaningful UI/platform change should meet these targets unless explicitly waived by the owner:

- Lighthouse: target perfect scores (100/100/100/100) on key pages and no regression accepted without written rationale.
- Mozilla Observatory/security posture: target A+ and score >=120.
- Security best practices: maintain strict CSP, safe headers, no trackers/cookies/framework bloat.
- Accessibility: WCAG-compliant contrast and readable typography, including for older users.
- Performance discipline: avoid layout shift, avoid unnecessary JS, keep CSS override layers intentional and non-duplicative.
- Trust/psychology: interface should signal calm authority, competence, and clarity without visual noise.

If a gate cannot be met, document the reason and rollback path in both PR notes and `PROJECT_EVOLUTION_LOG.md`.

## Non-Negotiable Rules

- Preserve Lighthouse and Observatory posture. Do not add scripts, trackers, or CSP-hostile inline changes.
- Preserve accessibility: WCAG contrast and clear text legibility, especially for older users.
- Keep brand intent:
  - Red plus sign stays.
  - IT/HELP edge outline stays, but should be tuned for clarity without harsh glow.
- Avoid duplicate CSS selectors and dead override blocks; Sonar must stay clean.
- Do not introduce new palette colors ad hoc. Use existing tokens first.

## Required Update Process For Visual Changes

When changing palette, hero/logo styling, nav/CTA styling, or readability treatment:

1. Update source styles in the canonical file(s), not random one-off duplicates.
2. Update `STYLE_GUIDE.md` if any visual rule or token meaning changes.
3. Add an entry to `PROJECT_EVOLUTION_LOG.md` with:
   - date
   - actor
   - files touched
   - rationale
   - rollback reference (commit/PR)
4. Run `zola build` before opening or updating a PR.

## Canonical Files

- Visual system: `static/css/late-overrides.css`
- Theme/link tokens: `sass/css/abridge.scss`
- Component/interaction tokens: `sass/_extra.scss`
- Project style rules: `STYLE_GUIDE.md`
- Change history: `PROJECT_EVOLUTION_LOG.md`
