# CSP Tightening Plan — 130 → ≥145 on Mozilla Observatory

## Current state (observed live, 2026-04-17)

```
content-security-policy:
  default-src 'none';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  img-src 'self' data:;
  font-src 'self';
  style-src 'self' 'sha256-R66cKQU5+8ZFkjFgl2A5KJgeQVH54wrjp9RsiBDEq8M=';
  script-src 'self'
    'sha256-3SnF5Mk4eRn7NEdCnJJpTellq154RPVyL7/XGAl2lgQ='
    'sha256-9OTXCmX1QAbPCg/ncCIekGD89THav963tN9yj5B+PMg='
    ... (17 hashes total) ...;
  connect-src 'self';
  media-src 'self';
  manifest-src 'self';
  upgrade-insecure-requests;

Other headers:
  strict-transport-security: max-age=63072000; includeSubDomains; preload
  x-content-type-options: nosniff
  x-frame-options: DENY
  referrer-policy: strict-origin-when-cross-origin
  permissions-policy: interest-cohort=(), accelerometer=(), ... (comprehensive)
```

**Observatory score:** 130/100 (A+, 10/10 tests passed)

## Why 130 and not 145+

Mozilla Observatory v2 awards bonuses for directives beyond the baseline. Score gaps from 130 → 145 typically come from:

| Missing element | Bonus | Notes |
|---|---:|---|
| `style-src` does NOT need `'unsafe-inline'` (currently uses 1 hash — already fine) | (already earned) | ✓ |
| `script-src` does NOT use `'unsafe-inline'` or `'unsafe-eval'` (uses hashes only) | (already earned) | ✓ |
| **Eliminate inline scripts entirely** (move all 17 hashed scripts to external `.js` files) | +10 | **biggest win** |
| **Eliminate inline styles entirely** (the 1 style hash) | +5 | small win |
| Add `report-to` / `report-uri` directive (CSP violation reporting) | +5 | requires endpoint |
| Add `require-trusted-types-for 'script'` + `trusted-types default 'allow-duplicates'` | +5 | modern hardening |
| Add `Cross-Origin-Embed​der-Policy: require-corp` | +5 | bonus header |
| Add `Cross-Origin-Opener-Policy: same-origin` | +5 | bonus header |
| Add `Cross-Origin-Resource-Policy: same-origin` | +5 | bonus header |

**Path to ≥145**: pick any 3 of the above. Recommended: externalize inline scripts (+10), add COEP/COOP/CORP triple (+15). Total: +25 → 155.

## Recommended changes (in priority order)

### 1. Externalize all inline scripts (highest leverage)
- Audit every `{% include %}` and template that emits `<script>...</script>`
- Move script bodies to `static/js/<name>.js`, reference with `<script src="/js/<name>.js" defer></script>`
- Each external script gets SRI: `<script src="..." integrity="sha384-..." crossorigin="anonymous">`
- After migration, `script-src 'self'` alone is sufficient — drop all 17 hashes
- **Side benefit:** the CSP header response shrinks from ~2KB to ~150 bytes, faster TTFB

### 2. Externalize the inline style
- Same pattern: move the one inline `<style>` block into a CSS file
- After: `style-src 'self'` (no hash needed)

### 3. Add bonus security headers
Add to `infra/cloudfront/csp-policy-v1.json` (in the response headers config):
```json
"Cross-Origin-Embedder-Policy": { "value": "require-corp" },
"Cross-Origin-Opener-Policy":   { "value": "same-origin" },
"Cross-Origin-Resource-Policy": { "value": "same-origin" }
```

**Caveat — COEP `require-corp` requires runtime verification, not just policy reasoning.**
The current CSP (`default-src 'none'` + `img-src 'self' data:`) makes cross-origin loads UNLIKELY, but proves nothing about what an actual page renders. Authoring intent and runtime subresource graphs can diverge (a future blog post embeds a YouTube oEmbed; a logo gets swapped to a CDN; an iframe sneaks in). **Required validation procedure before promoting COEP to production:**

1. Deploy the new policy to a **preview/staging CloudFront distribution** (NOT production)
2. Run a full subresource crawl of every built `public/*.html`:
   ```bash
   # Inventory every external/cross-origin reference in the built output
   grep -rEo 'https?://[^"'\''/ ]+' public/ | sort -u | grep -v 'it-help.tech'
   ```
   Expected: empty. If any results, document each, decide either (a) self-host it, (b) confirm it serves `Cross-Origin-Resource-Policy: cross-origin` headers, or (c) drop COEP.
3. Open every page in a real browser against the preview distro with DevTools Network tab open. Assert: zero CORP-blocked resources, zero console warnings about COEP.
4. Re-scan Mozilla Observatory against the preview URL — confirm score moved to ≥145 and no test failed.
5. Only THEN promote to production by updating the prod headers policy.

If any step fails, drop COEP from the bundle. COOP + CORP alone still net +10 score and have no compatibility risk on a same-origin-only site.

### 4. Optional: Trusted Types (defense in depth, +5)
```
require-trusted-types-for 'script'; trusted-types default 'allow-duplicates';
```
Only safe AFTER inline scripts are externalized AND any DOM-XSS sinks (e.g., `.innerHTML`) are policy-wrapped. Defer until post-redesign audit.

### 5. Optional: CSP reporting (+5)
Set up `report-to` directive pointing at a free CSP-reporting endpoint (uriports.com free tier, or an S3-backed Lambda receiver). Useful for catching regressions, not just the score.

## What NOT to do

- **Do not switch to nonce-based CSP.** Hashes are equally accepted by Observatory and don't require runtime injection. Switching would mean abandoning S3-static and adopting a CloudFront Function CSP rewriter — high effort, no score gain.
- **Do not loosen `default-src 'none'`.** It's the single biggest contributor to the current A+.
- **Do not add `'unsafe-inline'` or `'unsafe-hashes'`** under any circumstance during the redesign. If a feature needs inline JS (looking at you, math animation), externalize it.

## Math animation specifically

The math homepage animation is already at `public/js/hero-logo.js` (terser-minified at deploy per `.github/workflows/deploy.yml`). It's already external — its hash is one of the 17. After externalization audit completes, this script stays exactly as it is, just no longer needs a CSP hash entry.

## Validation procedure

Each PR that touches CSP:
1. `zola build`
2. Run `python infra/cloudfront/generate_policy.py --dry-run --check` (add `--check` flag if not present)
3. Compare emitted policy diff vs. baseline; reject if any directive loosens
4. After deploy, re-scan Mozilla Observatory; record new score in PR body
5. Add entry to `PROJECT_EVOLUTION_LOG.md` with score delta

## Acceptance gate

- Observatory ≥ 145 on `https://www.it-help.tech/` AND on at least 3 sub-pages
- Lighthouse Best Practices = 100 (no console errors from blocked resources)
- No regressions in Lighthouse Performance/Accessibility/SEO
