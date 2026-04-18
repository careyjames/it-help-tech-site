# IT Help San Diego Inc. Site

## Overview
This project is a privacy-first, no-tracking, no-cookies static website for IT Help San Diego Inc., built using the Zola static site generator and the Abridge theme. Its main purpose is to provide a professional online presence, showcasing services, transparent pricing, and company information. The site aims for technical excellence with high Lighthouse scores and a strong security posture, reflecting a business vision of professional confidence without aggressive sales tactics. The production site is accessible at https://www.it-help.tech/.

## User Preferences
- **Engineering Bar (No-Compromise)**: Aim for Lighthouse perfection on meaningful pages; do not accept regressions casually. Maintain Observatory A+ posture with target score >=120. Maintain strict security/privacy posture: no trackers, no cookies, no unnecessary frameworks. Build cleanly from the start; avoid "ship now, fix later" practices. Prioritize readable, maintainable foundations over flashy shortcuts. Treat best practices as symbiotic: security, speed, accessibility, UX psychology, and maintainability must all reinforce each other. Do not optimize one axis while degrading another and call it "done."
- **Site Philosophy**: No tracking, no cookies, no frameworks. Professional confidence without salesy/desperate elements. Link to verified Google Reviews (not embedded testimonials). Transparent pricing, no retainers, no kickbacks. `base_url` stays as production URL (Replit preview quirks are acceptable).
- **Development Workflow**: Work on `replit/working` branch, push to GitHub, create PRs, and merge to `main` via squash and merge. After every PR merge, run the specified `git fetch`, `git checkout`, `git reset --hard`, and `git push --force` commands to reset the working branch.
- **Deployment Restrictions**: NEVER use Replit's "Publish" button as it causes SEO collision with the production site.
- **Visual System Changes**: If changes are made to the visual system, tokens, or hero/logo treatment, `STYLE_GUIDE.md` must be updated, an entry added to `PROJECT_EVOLUTION_LOG.md`, and `zola build` run.

## System Architecture
The site is structured with `content/` for Markdown files (pages, blog posts, JSON-LD schema), `templates/` for Zola HTML, `themes/abridge/` for the Abridge theme (SEO macros, partials), `sass/`, and `static/` for assets. `config.toml` manages Zola configuration.

**UI/UX Decisions:**
- **Design Principles**: Privacy-first, no-tracking, no-cookies. Emphasis on professional confidence.
- **Navigation**: Single-line navigation with `white-space: nowrap` for items. Hamburger menu threshold at 960px. Compact-desktop band (769–960px) hides phone label.
- **Topbar**: Apple-style glass topbar with `backdrop-filter` and `color-mix()`. WCAG-correct nav polish with `aria-current` for active pages/sections and enhanced focus-visible states. Stratified topbar for consistent background and adaptive styles based on media queries (desktop, touch). Decorative elements (`.circuit-bg`, `.logo-constellation`) use `mask-image` for smooth transitions.
- **Accessibility**: `prefers-reduced-motion` applied to decorative elements. `aria-current="page"` for exact matches, `aria-current="true"` for section ancestors. Topbar bottom-border alpha adjusted to 38% for WCAG 1.4.11 contrast.
- **Typography**: `@media print` stylesheet with letterhead and paper typography.
- **Hero Section**: Hero tagline rewritten for concise brand messaging, with `in motion` highlighted in gold.

**Technical Implementations:**
- **Static Site Generation**: Zola is used for building the site.
- **SEO Architecture**: Theme SEO macros (`themes/abridge/templates/macros/seo.html`) handle base meta, OG, Twitter. Per-page overrides are managed via content frontmatter. JSON-LD schema is embedded directly in Markdown content files. Blog index (`templates/blog.html`) adds Blog schema.
- **Build Process**: `zola build` outputs to `public/`.
- **Deployment Pipeline (GitHub Actions)**:
    - Zola build.
    - PurgeCSS for unused styles.
    - KaTeX assets removed if unused.
    - CSP hashes auto-regenerated via `infra/cloudfront/update_policy.sh`.
    - S3 sync with proper cache headers.
    - CloudFront invalidation.
    - **Post-deploy audit gate**: Runs Lighthouse mobile/desktop and Mozilla Observatory checks against URLs defined in `infra/audit/audit.config.json`. Fails if Performance, Accessibility, Best Practices, or SEO drop below 98, or Observatory below A+/score 120 (median of N samples). `infra/audit/run-lighthouse.mjs` implements median-of-N sampling for robustness against single-sample jitter.
- **CSS Architecture**: Specific load order for stylesheets: `critical.min.css` (inlined), `cls-fixes.css`, `abridge.css`, `override.min.css`, `late-overrides.css`.
- **Content Pages**: Defined content pages include Home, Services, Billing, About, DNS Tool, Blog Index, and Blog Posts, each with specific Schema Types for SEO.
- **LLM Integration**: `static/robots.txt` explicitly lists AI bot permissions, `static/llms.txt` provides an LLM-friendly site summary, and `static/llms-full.txt` contains full content for LLM context.

## External Dependencies
- **Static Site Generator**: Zola
- **Theme**: Abridge (Zola theme)
- **Deployment/Hosting**: GitHub Actions, Amazon S3, Amazon CloudFront
- **Performance/Security Auditing**: Google Lighthouse, Mozilla Observatory
- **CSS Processing**: PurgeCSS
- **Mathematical Typesetting**: KaTeX (if used)