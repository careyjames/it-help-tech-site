# IT Help San Diego Inc. Site

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
- Deploy: GitHub Actions workflow (`.github/workflows/zola.yml`)
- **NEVER use Replit's "Publish" button** (causes SEO collision with production)

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

## CSS Architecture
- `static/css/critical.min.css` - Inlined in `<head>` (includes CLS fixes)
- `static/css/abridge.css` - Main theme styles (preloaded)
- `static/css/site-overrides.min.css` - Combined overrides (hero-logo, layout, gold-links)

## CSP / Security
- CSP hashes auto-generated via `python3 infra/cloudfront/generate_policy.py --mode all`
- Run after any inline script/style changes
- Observatory score: 130

## Recent Changes
- 2026-02-04: CSS optimization - merged 5 files into 2, added preload, 38% size reduction
- 2026-02-04: Cleaned up unused files, created WebP image alternatives, fixed git workflow
- 2026-02-04: Reordered nav dropdown: Services, Pricing, Our Expertise, Blog, DNS Tool
- 2026-02-03: Configured for Replit environment with Zola static site generator
