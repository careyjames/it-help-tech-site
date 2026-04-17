# IT Help San Diego Inc. Site

## AI Agent Mandatory Context (Read First)
- Source of truth for all AI agents: `AGENTS.md`
- Required pre-read before edits:
  - `STYLE_GUIDE.md`
  - `PROJECT_EVOLUTION_LOG.md`
  - `replit.md`
- If you change visual system, tokens, or hero/logo treatment:
  - Update `STYLE_GUIDE.md`
  - Add an entry to `PROJECT_EVOLUTION_LOG.md`
  - Run `zola build`

## Engineering Bar (No-Compromise)
- Aim for Lighthouse perfection on meaningful pages; do not accept regressions casually.
- Maintain Observatory A+ posture with target score >=120.
- Maintain strict security/privacy posture: no trackers, no cookies, no unnecessary frameworks.
- Build cleanly from the start; avoid "ship now, fix later" practices.
- Prioritize readable, maintainable foundations over flashy shortcuts.
- Treat best practices as symbiotic: security, speed, accessibility, UX psychology, and maintainability must all reinforce each other.
- Do not optimize one axis while degrading another and call it "done."

## Overview
A static website for IT Help San Diego Inc., built with Zola static site generator and the Abridge theme. Privacy-first, no-tracking, no-cookies design. Production site: https://www.it-help.tech/

## Project Structure
- `content/` - Markdown content files (pages, blog posts, and JSON-LD schema)
- `templates/` - Zola HTML templates and macros
- `themes/abridge/` - Abridge theme (SEO macros, partials)
- `sass/` - SASS stylesheets
- `static/` - Static assets (images, CSS, JS, robots.txt, llms.txt)
- `config.toml` - Zola configuration
- `public/` - Generated build output (gitignored)

## Content Pages
| Page | File | Schema Types |
|------|------|--------------|
| Home | `content/_index.md` | FAQPage, LocalBusiness+ProfessionalService, WebSite, WebPage |
| Services | `content/services.md` | WebSite, WebPage, LocalBusiness, ItemList (13 services), Offer, FAQPage, Service graph |
| Billing | `content/billing.md` | Offer, FAQPage |
| About | `content/about.md` | AboutPage with Organization |
| DNS Tool | `content/dns-tool.md` | SoftwareApplication |
| Blog Index | `content/blog/_index.md` | ItemList (blog posts) |
| Blog Posts | `content/blog/*.md` | Article (via page.html template) |

## SEO Architecture
- **Theme SEO macros**: `themes/abridge/templates/macros/seo.html` handles base meta, OG, Twitter
- **Per-page overrides**: Content frontmatter with `extra.og_title`, `extra.twitter_description`, etc.
- **JSON-LD schema**: Embedded in content markdown files (not templates)
- **Blog template**: `templates/blog.html` adds Blog schema for the index

## Key Files
- `config.toml` - Site config, base_url, menu, theme settings
- `templates/base.html` - Main layout, nav dropdown, footer with NAP
- `templates/page.html` - Standard page template with Article schema for blog posts
- `templates/blog.html` - Blog index with Blog schema
- `static/robots.txt` - AI bot permissions explicitly listed
- `static/llms.txt` - LLM-friendly site summary
- `static/llms-full.txt` - Full content for LLM context

## Development
```bash
zola serve --interface 0.0.0.0 --port 5000
```

## Build & Deploy
- Build: `zola build` → outputs to `public/`
- Deploy: GitHub Actions workflow (`.github/workflows/deploy.yml`)
- **NEVER use Replit's "Publish" button** (causes SEO collision with production)

### Deploy Pipeline (Automatic on merge to main)
1. Zola build
2. PurgeCSS removes unused styles
3. KaTeX assets removed if unused
4. **CSP hashes auto-regenerated** via `infra/cloudfront/update_policy.sh` (signature pages use `infra/cloudfront/update_policy_signatures.sh` when `POLICY_ID_SIGNATURES` is set)
5. S3 sync with proper cache headers
6. CloudFront invalidation
7. **Post-deploy audit gate** (`audit` job) — runs Lighthouse mobile + desktop against every URL in `infra/audit/audit.config.json` and re-checks Mozilla Observatory. Fails the workflow if any of Performance / Accessibility / Best Practices / SEO drops below 98 on either form factor, or if Observatory regresses below A+ / score 120.

### Audit gate — how to update
- All thresholds and the audited URL list live in **`infra/audit/audit.config.json`**. Add a page to `lighthouse.urls` (e.g. `https://www.it-help.tech/services/`) or change a number; no workflow edit needed.
- The two scripts (`infra/audit/run-lighthouse.mjs`, `infra/audit/run-observatory.mjs`) can be run locally with `lighthouse` + a Chromium binary on PATH to reproduce a CI failure.

**Local/Replit note:** `update_policy_signatures.sh` requires AWS credentials + `POLICY_ID_SIGNATURES`. If those secrets aren't available, the signature CSP update will fail or be skipped—this is expected outside CI.

### CSS Architecture (load order matters!)
1. `critical.min.css` - inlined in head
2. `cls-fixes.css` - prevents layout shift
3. `abridge.css` - theme base styles
4. `override.min.css` - homepage/nav/mobile overrides (complex, don't merge)
5. `late-overrides.css` - hero animation + gold links (combined from hero-logo.css + gold-override.css)

## Branching Workflow
- Work on `replit/working` branch
- Push to GitHub and create PRs
- Merge to main via squash and merge

### IMPORTANT: After Every PR Merge
Run these commands locally after each squash-merge to reset the working branch:
```bash
git fetch origin
git checkout replit/working
git reset --hard origin/main
git push --force origin replit/working
```
Then click "Pull" in Replit to sync. This prevents duplicate commits in future PRs.

## Site Philosophy
- No tracking, no cookies, no frameworks
- Professional confidence without salesy/desperate elements
- Link to verified Google Reviews (not embedded testimonials)
- Transparent pricing, no retainers, no kickbacks
- base_url stays as production URL (Replit preview quirks are acceptable)

## Lighthouse Scores
Site maintains 98-100 scores. All changes must preserve these.

## Engineering Bar / Audit gate
The post-deploy audit gate is configured by `infra/audit/audit.config.json` and run by `infra/audit/run-lighthouse.mjs` from `.github/workflows/deploy.yml`. The config enumerates the production URLs Lighthouse-verified after each deploy on both `formFactors` (mobile + desktop), with the engineering-bar threshold of ≥98 for Performance / Accessibility / Best Practices / SEO, plus a Mozilla Observatory floor of A+ / score ≥120. The runner iterates `lighthouse.urls × lighthouse.formFactors` and exits non-zero if any category drops below threshold, failing the deploy. **Currently audited URLs:** `/`, `/services/`, `/billing/`. To extend coverage, add a fully-qualified URL to `lighthouse.urls` and verify it clears 98+ on both form factors in production before merging — flaky pages must be fixed or the deviation documented here, not silently demoted.

## Recent Changes
- 2026-04-17: Audit gate scope expansion — `infra/audit/audit.config.json` `lighthouse.urls` extended from `/` only to `/`, `/services/`, `/billing/`. Production verification on both form factors: `/services/` mobile P98 A100 BP100 SEO100, desktop all 100; `/billing/` mobile P98–99 (3-run sample: 99/99/98) A100 BP100 SEO100, desktop all 100. Note on `/billing/` mobile variance: an initial cold run hit P89 with TBT ≈280ms — three follow-up runs settled to 98/99/99 (TBT 27–151ms). The page is static HTML with two JSON-LD blocks and no extra script; the variance is jitter in CloudFront/edge cold-start + headless-Chromium TBT measurement, not a content regression. The 98 floor is met but the margin is thin enough that any future addition of script/3p to `/billing/` must be re-audited; the runner only takes a single sample per `(url, formFactor)`, so a flaky failure in CI is possible — re-run on infra noise. Other pages considered (`/about/`, `/dns-tool/`, `/security-policy/`) intentionally deferred — task scope is `/services/` and `/billing/`.
- 2026-04-17: Post-PR #551 verification — production audit of https://www.it-help.tech/ confirms the homepage rewrite (skip-link transform fix, DNS subdomain correction, mission-based copy rewrite, new "What we do" card) preserves the engineering bar. Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. Lighthouse desktop: Performance 100, Accessibility 100, Best Practices 100, SEO 100. Mozilla Observatory: A+, score 140 (10/10 tests passed, algorithm v5). All ≥98 invariants intact; no regressions. Tooling used (reproducible): `chromium` was added as a system Nix dep (auto-written to `replit.nix` alongside `zola` declared in `.replit`'s `[nix].packages` — two-source split is the platform-prescribed pattern; both binaries resolve). Lighthouse CLI installed ad-hoc into `/tmp/lh` (not committed). Commands run: `lighthouse https://www.it-help.tech/ --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" --only-categories=performance,accessibility,best-practices,seo` (mobile) and the same plus `--preset=desktop`. Observatory pulled via `POST https://observatory-api.mdn.mozilla.net/api/v2/scan?host=www.it-help.tech` with empty JSON body. See follow-up #5 for wiring this gate into CI.
- 2026-04-17: PR #548 — Architect-validated DEFINITIVE topbar seam fix. Root cause: surface discontinuity, not a border. Topbar now stratified — BASE: `background: var(--c1)` (matches body exactly, no blur, no border, no shadow); DESKTOP `@media (min-width: 961px) and (hover: hover) and (pointer: fine)`: re-enables Apple glass + 38% gold WCAG 1.4.11 hairline mixed from --c1 (not --surface-charcoal); TOUCH `@media (hover: none), (pointer: coarse)`: forces solid for iPad landscape + touch laptops. Decorative `.circuit-bg` + `.logo-constellation` got 56px top-fade `mask-image` so grid/dots fade in below the topbar instead of clipping. STYLE_GUIDE codified the never-tint-with-non-c1 invariant.
- 2026-04-17: PR #546 — Hero tagline rewritten from `We solve tech problems. / No monthly retainers.` (which duplicated the H1 verbatim) to `IT research in motion.` (single line, `in motion` as gold highlight). The H1 retains the literal proposition for SEO; the pill carries the brand promise. Mobile topbar gold hairline dropped (`@media (max-width: 960px) { .topbar { border-bottom-color: transparent } }`) — desktop hairline preserved per PR #545's WCAG 1.4.11 contrast win. STYLE_GUIDE + PROJECT_EVOLUTION_LOG updated.
- 2026-04-17: PR #545 — WCAG-correct nav polish. `aria-current="page"` reserved for exact match; section ancestors emit `aria-current="true"` (CSS attr selector widened to `[aria-current]` so underline shows for both). Topbar bottom-border alpha 18% → 38% for WCAG 1.4.11. Distinct focus-visible state restored (2px gold outline, no longer collapsed into hover). Compositing hint added to topbar (`translateZ(0)` + narrow `will-change: backdrop-filter`). External-link arrow underline trim via `:has(.topbar-ext)`.
- 2026-04-17: PR #544 — single-line nav fix. `white-space: nowrap` on every nav item (links, CTA, phone, phone label). Hamburger threshold raised 768 → 960px. New compact-desktop band (769–960px) hides phone label so icon stays as a tappable call link without crowding. Apple-style glass topbar via `backdrop-filter: saturate(160%) blur(14px)` + `color-mix()` translucent fill (with `@supports` fallback). Active-page indicator wired in `templates/base.html` via Tera prefix match.
- 2026-04-17: Polish Phase 1 — `prefers-reduced-motion` extended to decorative-only elements (`.blob`, `.circuit-bg`, `.hex-decoration`); new `@media print` "leave-behind" stylesheet with letterhead + paper typography; tokenized form-control baseline ready for first contact form
- 2026-02-04: Fixed CSP pipeline to prevent hash accumulation (removed --merge-hashes-from-stdin)
- 2026-02-04: Created og-home.png (1200x630px, 498KB) with tagline for OG/Twitter sharing
- 2026-02-04: Combined hero-logo.css + gold-override.css into late-overrides.css (5→4 CSS requests)
- 2026-02-04: Optimized hero-logo.js to cache dimensions, eliminating forced reflows
- 2026-02-04: Cleaned up unused files, created WebP image alternatives, fixed git workflow
- 2026-02-04: Reordered nav dropdown: Services, Pricing, Our Expertise, Blog, DNS Tool
- 2026-02-03: Configured for Replit environment with Zola static site generator
