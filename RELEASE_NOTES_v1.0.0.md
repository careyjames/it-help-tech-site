# Corp Site Redesign — v1.0.0

Tag (post-deploy): `corp-site-redesign-v1.0.0`
Source plan: `.agent-transfer/plans/port-checklist.md`
Five-PR DAG: #525 → #526 → #527 → #528 → (this)

## Summary

Full visual + structural rebuild of `https://www.it-help.tech/` to match the
"billion-dollar think tank" aesthetic prototyped in the DNS Tool, while
preserving every non-negotiable from the original site:

- Red plus mark (`#ff0066`) on the homepage hero.
- IT/HELP outline wordmark (gradient blue) — now also used as the top-bar logo on every page.
- Math-driven hero animation in `static/js/hero-logo.js` (zero edits across the redesign).
- No tracking, no cookies, no JS frameworks.

## What shipped, by sub-agent

### #525 — Sub-1 · IA & Content
Restructured every page to a 5-section homepage and 6-anchor services page
written in an "intelligence brief" tone. Content moved to a single source of
truth so templates can be redesigned without copy-editing.

### #526 — Sub-2 · Design Tokens
Introduced `static/css/tokens.css` as the single source of truth for color,
spacing, type, motion. Added a duplicate-token CI gate
(`scripts/check-token-parity.sh`). Brand-block extension (Option A) added in
the follow-up commit. Dark theme is the baseline; light theme remains via the
existing toggle.

### #527 — Sub-3 · Templates
Replaced the legacy hamburger nav with a new top-bar layout. Added the
IT+HELP wordmark to the chrome on every page. Scoped the hero animation to
`/` only. Footer rebuilt as a three-column org-tree (services, company,
trust) with NAP+hours preserved verbatim for local-SEO.

### #528 — Sub-4 · CSP Hardening & CloudFront Policy
- Externalized the last inline `<script>` (theme-flash IIFE → `static/js/theme-init.js`, blocking, SRI).
- Externalized the last inline `<style>` (critical CSS → `<link rel="stylesheet">`).
- Patched `infra/cloudfront/generate_policy.py` with `NON_EXECUTABLE_TYPE_RE` so JSON-LD / importmap / speculation-rules `<script>` blocks are correctly skipped per W3C CSP §6.6.4.2.
- Result: `script-src 'self'; style-src 'self'` — **CSP collapsed from ~2KB / 17 hashes to 260 bytes / 0 hashes.**
- Added `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Resource-Policy: same-origin` (Quantity 1 → 3).

### (this PR) — Sub-5 · Quality Gate
Dev-side verification suite + scorecard + this release notes file.
See `PROJECT_EVOLUTION_LOG.md` (2026-04-17 Sub-5 entry) for the full pass list.

## Verification status at merge time

| Check | Where it can run | Status |
|---|---|---|
| `zola build` clean | dev | ✅ PASS (12 pages, 0 errors) |
| Token-parity gate | dev | ✅ PASS |
| Inline-content audit (0 scripts / 0 styles) | dev | ✅ PASS |
| Broken-link scan | dev | ✅ PASS (0 broken) |
| Visual smoke, all 5 pages, desktop | dev | ✅ PASS |
| Hero scoped to `/` only | dev | ✅ PASS (per-route inspection) |
| External-subresource crawl (COEP readiness) | dev | ✅ PASS (0 external) |
| Mozilla Observatory ≥145 | **prod** | ⏳ post-deploy |
| Lighthouse 100/100/100/100 × 5 pages | **prod** | ⏳ post-deploy |
| CISA-style external scan (TLS/DNS/SPF/DKIM/DMARC/CAA/MTA-STS) | **prod** | ⏳ post-deploy |
| axe-core a11y, 0 violations | **prod** | ⏳ post-deploy |
| Tag `corp-site-redesign-v1.0.0` | **prod** | ⏳ after the four above pass |

## Known follow-up (Sub-4-bis)

The Sub-4 plan deferred `Cross-Origin-Embedder-Policy` ("requires staging
subresource crawl"). That crawl ran in Sub-5 and returned **zero** external
subresources. A small follow-up PR can add `COEP: same-origin` to
`infra/cloudfront/csp-policy-v1.json` for an additional Observatory bonus.
Recommend wiring the same one-shot crawl into CI as a pre-deploy gate so
future blog posts adding embeds are caught before they ship.

## What is intentionally NOT in v1.0.0

- COEP `require-corp` (see follow-up above).
- CSP Trusted Types (worthwhile but requires a touch-pass on `static/js/*.js`).
- CSP `report-to` endpoint (no report-collection infra stood up yet).
- Light-theme polish pass (baseline works; a designer pass is queued separately).

## Rollback procedure

If the production deploy regresses anything measurable (Lighthouse,
Observatory, CISA), revert the merge commit of #528 first (CSP), then #527
(templates). #525 (content) and #526 (tokens) are independently safe to
keep on main even on partial revert.
