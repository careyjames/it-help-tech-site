# Post-deploy audit gate

Two scripts run from CI after the CloudFront invalidation completes,
guarding the "Lighthouse 98–100 / Observatory A+ ≥120" engineering bar.

- `run-lighthouse.mjs` — runs Lighthouse N times against every URL in
  `audit.config.json` for both mobile and desktop, takes the per-category
  median across the N samples, and fails the build if any of Performance,
  Accessibility, Best Practices, or SEO drops below the configured
  threshold. N is set by `lighthouse.samplesPerAudit` (default 3).
- `run-observatory.mjs` — triggers a fresh Mozilla Observatory v2 scan
  and fails the build if the grade or score regresses.

## Why median-of-N

Single-sample Lighthouse runs against a remote CloudFront origin exhibit
measurable jitter on mobile Performance — Total Blocking Time is
sensitive to headless-Chromium scheduling noise and edge cold-start
latency. The site genuinely scores 98+ on every page, but a one-shot
gate was producing intermittent false-fails (homepage mobile P=95–96
once every few deploys despite a true production score of 99–100).

Median-of-3 is the textbook minimum for stable central-tendency
measurement. It is strictly stronger than a best-of-N rule (which would
mask intermittent real regressions): a real performance regression that
manifests on at least 2 of 3 samples still fails the gate, while a
single jittery sample no longer false-fails.

A separate **warning** is emitted (without failing the build) whenever a
single sample dipped below threshold but the median still passed. That
is a leading indicator of thinning margin on a page and is worth
investigating before the next deploy, even if the gate is green.

## Editing thresholds, sample count, or URLs

Open `audit.config.json`. Add a URL to `lighthouse.urls`, change a
number in `lighthouse.thresholds` / `observatory`, or adjust
`lighthouse.samplesPerAudit`. No workflow changes required. Setting
`samplesPerAudit` to 1 reverts to the original single-sample behavior.

## Cost

With N=3 the Lighthouse phase runs 3 × (urls × formFactors) audits.
For the current 4-URL × 2-form-factor grid that is 24 Lighthouse runs
at ~12 seconds each, or roughly 5 minutes total — up from ~96 seconds
under the old single-sample gate. Observatory runs once per deploy and
is unchanged.

## Running locally

```bash
# Needs lighthouse + a chromium binary on PATH
npm install -g lighthouse
node infra/audit/run-lighthouse.mjs
node infra/audit/run-observatory.mjs
```
