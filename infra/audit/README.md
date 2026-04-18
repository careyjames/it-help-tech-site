# Post-deploy audit gate

Two scripts run from CI after the CloudFront invalidation completes,
guarding the "Lighthouse 98–100 / Observatory A+ ≥120" engineering bar.

- `run-lighthouse.mjs` — runs Lighthouse against every URL in
  `audit.config.json` for both mobile and desktop and fails the build if
  any of Performance, Accessibility, Best Practices, or SEO drops below
  the configured threshold.
- `run-observatory.mjs` — triggers a fresh Mozilla Observatory v2 scan
  and fails the build if the grade or score regresses.

## Editing thresholds or adding URLs

Open `audit.config.json`. Add a URL to `lighthouse.urls` or change a
number in `lighthouse.thresholds` / `observatory`. No workflow changes
required.

## Running locally

```bash
# Needs lighthouse + a chromium binary on PATH
npm install -g lighthouse
node infra/audit/run-lighthouse.mjs
node infra/audit/run-observatory.mjs
```
