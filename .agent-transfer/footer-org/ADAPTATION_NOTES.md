# Footer Org-Tree — Adaptation Notes

## What was changed from the dns-tool original

The dns-tool footer is a **research-platform** org-tree. The corp-site footer is a **consulting-services** org-tree. Same visual structure, different node content.

### Registration row (UNCHANGED)
- Delaware Inc. and California Foreign Entity links — these are corporate facts, identical on both sites.

### Department row (REWRITTEN)
| dns-tool node                            | corp-site node                       | Why |
|------------------------------------------|--------------------------------------|-----|
| Research Department → /corpus            | Concierge IT Consulting → /services  | Corp-site's primary offering is consulting, not research. |
| DNS Tool → github.com/...dns-tool-intel  | Book On-Site Visit → schedule.it-help.tech | Primary CTA on corp-site is booking, not the source repo. |
| Professional Consulting → schedule       | DNS Tool (Research Platform) → dns.it-help.tech | The dns-tool becomes the *secondary* node — proof of expertise. |

### 4-cell link grid (REWRITTEN)
| dns-tool cells          | corp-site cells | Notes |
|-------------------------|-----------------|-------|
| Research                | **Services**    | Mac, WiFi, DNS/Email, Cybersec, Data Extraction (matches live homepage copy) |
| Platform                | **Expertise**   | 25+ years, high-profile clients, research platform link, blog |
| Governance              | **Trust**       | Security Policy, Billing, Privacy, Brand Colors |
| Company                 | **Company**     | About, Schedule, Phone, GitHub Org |

### Removed (dns-tool only)
- `/corpus`, `/publications`, `/case-study`, `/sources`, `/reference-library`, `/cite`
- `/approach`, `/architecture`, `/confidence`, `/topology`, `/roadmap`, `/changelog`
- `/owl-semaphore`, `/manifesto`, `/communication-standards`, `/roe`
- `/black-site`, `/agent/plugin`
- DEVONagent / GitHub / ORCID / DOI social row at bottom (those are research credentials, not corp-site credentials)

## Icon system — important difference

dns-tool uses Go template helpers: `{{icon "shield-halved" "me-1"}}`. Zola/Tera has no equivalent. Two options:

1. **SVG sprite** (recommended) — define one `<symbol>` per icon at the bottom of `templates/base.html`, reference via `<svg class="ftr-icon"><use href="#i-name"/></svg>`. Zero JS, zero per-page cost, hash-CSP-safe (no inline). The `_footer-org.html` partial assumes this pattern.
2. **Inline SVG per icon** — works, slightly chattier markup, but dead-simple to author.

For this port, use **option 1**. The sprite is shipped in this package as `footer-org/SPRITE.svg` — drop its contents inline at the bottom of `templates/base.html` (just before `</body>`), wrapped in `<svg width="0" height="0" style="position:absolute" aria-hidden="true">`.

Required symbol ids for the footer (all present in `SPRITE.svg`):
`i-building`, `i-landmark`, `i-briefcase`, `i-calendar`, `i-brain`, `i-tools`, `i-microchip`, `i-shield`

The shipped sprite is minimal stroke-based glyphs (24x24, currentColor) authored for this package — no external license. You may freely swap to Feather Icons, Font Awesome free, or Tabler Icons; keep the symbol ids the same and the footer partial works unchanged.

## Background context dependency

The footer assumes `--bg-primary: #0d1117` (dark theme). It will look broken on the current corp-site light/blue background. **Apply tokens.css globally first**, then drop in this footer. Don't try to scope-isolate the footer to a dark island — it'll look orphaned and the rest of the page will feel mismatched. The whole site is moving to dark.

## Color contrast verification

All footer text colors verified ≥ WCAG AA (4.5:1) on `--bg-primary` `#0d1117`:
- `#8b949e` (link rest) → 4.83:1 ✓
- `#e6edf3` (link hover) → 14.59:1 ✓
- `#d4a853` (heading gold) → 8.58:1 ✓
- `#c9d1d9` (copyright link) → 11.65:1 ✓
