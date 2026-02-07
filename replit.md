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

## Recent Changes
- 2026-02-04: Fixed CSP pipeline to prevent hash accumulation (removed --merge-hashes-from-stdin)
- 2026-02-04: Created og-home.png (1200x630px, 498KB) with tagline for OG/Twitter sharing
- 2026-02-04: Combined hero-logo.css + gold-override.css into late-overrides.css (5→4 CSS requests)
- 2026-02-04: Optimized hero-logo.js to cache dimensions, eliminating forced reflows
- 2026-02-04: Cleaned up unused files, created WebP image alternatives, fixed git workflow
- 2026-02-04: Reordered nav dropdown: Services, Pricing, Our Expertise, Blog, DNS Tool
- 2026-02-03: Configured for Replit environment with Zola static site generator
