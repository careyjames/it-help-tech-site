# Design Transfer Package — it-help-tech-site

**Source:** dns-tool-intel @ v26.46.13 (filesystem canonical)
**Target:** IT-Help-San-Diego/it-help-tech-site (Zola SSG, S3+CloudFront)
**Mission:** redesign the corporate site to match dns-tool's "billion-dollar think tank" aesthetic, preserve the math homepage animation + IT/HELP brand marks, port the dns-tool footer org-block, push CSP from 130 → ≥145 on Mozilla Observatory.
**Architectural decision:** Stay on Zola. Rebuild the theme from scratch on top of the existing CSP-automated S3+CloudFront pipeline. Do not migrate SSG; do not go dynamic.

---

## Package contents

| Path | What it is |
|---|---|
| `README.md` | This file. |
| `tokens/tokens.css` | Drop-in CSS variables (colors, typography, spacing) extracted from `go-server/static/css/custom.css`. New SOT for the corp-site theme. |
| `tokens/tokens.scss` | Same tokens as SCSS variables for use inside `sass/_extra.scss` / `sass/css/abridge.scss`. |
| `footer-org/_footer-org.html` | Zola/Tera-syntax adaptation of the dns-tool footer org-tree. Drop into `templates/partials/`. |
| `footer-org/_footer-org.css` | Component-scoped CSS for the org-tree (lines 7955-8314 of dns-tool custom.css, untouched semantics). |
| `footer-org/SPRITE.svg` | Inline SVG sprite with 8 symbols (`#i-building`, `#i-landmark`, `#i-briefcase`, `#i-calendar`, `#i-brain`, `#i-tools`, `#i-microchip`, `#i-shield`). Drop into base layout. |
| `footer-org/ADAPTATION_NOTES.md` | What was changed from dns-tool to fit corp-site (links/labels/icons). |
| `screenshots/` | Reference images: dns-tool home, about, communication-standards (current dns-tool look-and-feel) + current www.it-help.tech (the look being replaced). |
| `plans/csp-tightening-plan.md` | Diff of current CSP vs. target. Concrete directives to add/remove to push Observatory 130 → ≥145. |
| `plans/ia-blueprint.md` | Information architecture blueprint: nav, page hierarchy, copy positioning. |
| `plans/port-checklist.md` | Sub-agent worklist: 5 named roles with deliverables and acceptance criteria. |

---

## How to use this package (in the it-help-tech-site Replit project)

1. **Pull this branch** (`design-transfer/v1`) into the it-help-tech-site working tree.
2. **Read in this order:** `README.md` → `plans/port-checklist.md` → `plans/ia-blueprint.md` → `plans/csp-tightening-plan.md` → `tokens/tokens.css` → `footer-org/`.
3. **Apply tokens FIRST** before any template work. Tokens define the look — templates only consume them.
4. **Do not touch `infra/cloudfront/generate_policy.py` or `deploy.yml`** unless the CSP plan explicitly requires it. Both are working today.
5. **Preserve non-negotiables:** red plus sign, IT/HELP edge outline, mathematical homepage animation (`public/js/hero-logo.js`).
6. **Each sub-agent** in `port-checklist.md` should open its own PR. Don't bundle.
7. **Every PR** must run `zola build` clean and update `PROJECT_EVOLUTION_LOG.md` per the AGENTS.md protocol.

---

## Reference baselines

- **Mozilla Observatory current:** 130/100, 10/10 tests passed (screenshot in user attachments)
- **Lighthouse target:** 100/100/100/100 on `/`, `/about`, `/services`, `/dns-tool`, `/security-policy`
- **Observatory target:** ≥145 (achievable via directive tightening — see `plans/csp-tightening-plan.md`)
- **Brand non-negotiables:** AGENTS.md "Non-Negotiable Rules" section (red plus, IT/HELP outline, no trackers)

---

## Out of scope (deliberately)

- `schedule.it-help.tech` (Square Online, third-party, separate vendor's CISA failure — not ours to fix)
- SSG migration (Zola stays — see architect rationale below)
- Live/dynamic conversion (over-engineering for a 7-page brochure site, would forfeit federal A+ static posture)

---

## Architect rationale (verbatim, condensed)

> Commit to **Option 3 (stay on Zola, rebuild theme from scratch on existing S3+CloudFront+CSP automation)**. It maximizes security continuity and delivery speed while preserving future portability. Going dynamic is over-engineering for this use case. Zola is **not objectively worse** for "easy future" — Astro's DX gain doesn't justify migration cost on 7 pages with custom-tuned CSP/deploy automation. Nonces are **not required** to reach high Observatory scores; current strict hash-based CSP is already top-tier compatible. If tokens/components/content are kept framework-agnostic, a 2-year Astro migration is mostly adapter work.
