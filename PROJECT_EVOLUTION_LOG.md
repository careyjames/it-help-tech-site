# Project Evolution Log

Purpose: Track meaningful AI/developer changes with enough context to roll back point-by-point.

## Entry Format
- Date (local): `YYYY-MM-DD`
- Actor: `AI`, `Developer`, or `AI+Developer`
- Scope: concise area name
- Files: explicit file list
- Change: what changed
- Why: reasoning / user goal
- Rollback: exact commit hash or PR

## Entries

### 2026-04-18 (Docs · `replit.md` reduced to platform-owned stub; AGENTS.md becomes sole governance source)
- Actor: AI (Replit Agent + architect subagent)
- Severity: MEDIUM (changes the documented source-of-truth hierarchy for all AI agents on this repo)
- Trigger: Replit's checkpoint subsystem was repeatedly stripping `replit.md` on every "Loop ended" event. Three strips observed in a single session (137 → 46 → 78 → 45 lines), each commit titled "Restore..." but actually deleting 90+ lines. Author trailer `careybalboa <43527839-careybalboa@users.noreply.replit.com>` and commit headers `Replit-Commit-Checkpoint-Type: full_checkpoint` + `Replit-Helium-Checkpoint-Created: true` confirmed platform automation as the source. No documented `.replit` flag disables the behavior. Owner directive: "find out how to prevent this error."
- Files:
  - `replit.md` — reduced from 137 lines to ~12-line stub: title, one paragraph explaining the stub policy, canonical-sources block pointing to `AGENTS.md`, `STYLE_GUIDE.md`, `PROJECT_EVOLUTION_LOG.md`
  - `AGENTS.md` — folded in Development Workflow, Deploy & Build Pipeline, Project Architecture (At-a-Glance), and "Why replit.md Is a Stub" sections. Mandatory Read list updated to drop `replit.md` and elevate `AGENTS.md` itself as primary
  - `.github/workflows/replit-md-guard.yml` — new CI guard fails any PR where `replit.md` exceeds 30 lines or drops the canonical-sources pointers (`AGENTS.md`, `STYLE_GUIDE.md`, `PROJECT_EVOLUTION_LOG.md`)
  - `PROJECT_EVOLUTION_LOG.md` — this entry
- Change: AGENTS.md is now the sole canonical source for engineering governance, dev workflow, deploy pipeline, and project architecture pointers. `replit.md` is intentionally disposable; the platform may rewrite it freely without affecting governance. CI guard at PR boundary blocks any future re-expansion (whether from the platform auto-summarizer or from accidental human edits).
- Why: Architect-validated root cause — the Replit checkpoint subsystem treats `replit.md` as an auto-summary file it owns, derived from a project metadata pass that fires after the agent loop ends. Fighting it inside the loop is futile (autocommit lands after the agent's last action). Architect ranked five mitigation options; the durable fix is option (a): deny the auto-summarizer anything meaningful to summarize, and let CI catch any drift at PR time. Options (b) `.gitignore`, (c) author/line-delta pre-commit hook, and (d) `.replit` config flag were rejected (no supported flag; hooks may not run for platform commits; ignoring breaks fresh-clone bootstrap). The 137-line `replit.md` we kept restoring was itself a prior platform summary, not the owner's original — confirming the file has not been durably owner-controlled for some time.
- Rollback: revert this PR. Note: reverting reintroduces the strip-cycle on every checkpoint and re-orphans governance content into a file the platform overwrites unpredictably.

### 2026-04-18 (Audit gate · jitter elimination via median-of-3 with leading-indicator warnings)
- Actor: AI (Replit Agent + architect subagent)
- Severity: MEDIUM (CI infrastructure; affects every deploy going forward; engineering bar preserved exactly)
- Trigger: Owner reported recurring CI false-failures from single-sample Lighthouse jitter on the homepage mobile audit. PR #554 deploy hit P=96, PR #557 deploy hit P=95 — both cleared on manual GitHub-UI re-run. Owner directive: "fix it, get some deep research with the architect and find a path forward so we're very clean and healthy."
- Files:
  - `infra/audit/run-lighthouse.mjs` — rewritten: collects N samples per (url, formFactor), computes per-category-independent median, fails on median < threshold, emits non-failing warning when any single sample dipped below threshold but median passed
  - `infra/audit/audit.config.json` — added `lighthouse.samplesPerAudit` (default 3); existing thresholds unchanged
  - `infra/audit/README.md` — new "Why median-of-N" section + cost analysis + samplesPerAudit documentation
  - `replit.md` — Engineering Bar section updated to describe median-of-N gate; Recent Changes entry added
- Change: Single-sample → median-of-3 gate. For each (url, formFactor) pair, run Lighthouse 3 times, take median per category independently, fail the deploy only if any per-category median drops below its threshold. A separate warning (non-failing) lists any single-sample sub-threshold dips where median still passed — that surfaces thinning-margin pages as a leading indicator without blocking the deploy. `samplesPerAudit` is configurable in `audit.config.json` and falls back to 3.
- Why: Architect deep-research evaluated 7 options (best-of-N, median-of-N, conditional retry, soft tolerance, Lighthouse-CI migration, throttling-method swap, hybrid retry+median) and recommended median-of-N (option 2) for this project's constraints: privacy-first static site, perfectionist owner, deploy time matters but not critical, no observability stack. Best-of-N rejected because it would actively mask intermittent real regressions. Lighthouse-CI migration rejected as fighting the existing JSON config schema. Median-of-3 keeps the engineering bar honest — a real regression that triggers in ≥2 of 3 samples still fails the gate — while a single jittery sample no longer false-fails. Median is computed per-category-independently (not over the full report) so a Performance dip can't be averaged away by perfect Accessibility/SEO. Cost: Lighthouse phase grows from ~96s to ~5min per deploy (24 audits × ~12s); Observatory unchanged.
- Rollback: revert this PR; or set `lighthouse.samplesPerAudit: 1` in `audit.config.json` to revert to the original single-sample behavior without code changes.

### 2026-04-17 (Topbar · Architect-validated definitive seam fix — capability-stratified surface treatment + decorative top-fade)
- Actor: AI (Replit Agent + architect subagent)
- Severity: MEDIUM (touches every viewport; root-cause fix for a recurring complaint)
- Trigger: Owner reported the mobile topbar seam was still visible after `border-bottom: 0; box-shadow: none;` (PR #547). Marked the seam in red on a fresh iPhone screenshot. Directive: "I want it to be beautiful, perfect, and scientific for mobile, iPads, and everything else." Architect was consulted via the code_review skill with full diagnostic context.
- Files:
  - `static/css/late-overrides.css` — topbar shell rewritten as 3-tier stratified rule (base / desktop fine-pointer / touch override); circuit-bg + logo-constellation gained 56px top-fade `mask-image`
  - `STYLE_GUIDE.md` — codified the stratification rule and the never-tint-with-non-c1 invariant
- Change: Root-caused the seam as a SURFACE DISCONTINUITY (not a border): the previous `@supports (color-mix)` block tinted the topbar from `--surface-charcoal` while body bg uses `--c1` — two different colors meeting at a hard horizontal line, no border could erase it. Plus `backdrop-filter` on a sticky element creates a device-dependent compositor edge on iOS/iPadOS. New stratification: BASE rule `.topbar { background: var(--c1); border-bottom: 0; box-shadow: none; backdrop-filter: none; }` so the topbar matches body exactly; DESKTOP rule `@media (min-width: 961px) and (hover: hover) and (pointer: fine)` re-enables glass + gold hairline but mixes from `--c1` (continuous with page); TOUCH override `@media (hover: none), (pointer: coarse)` forces solid treatment for iPad landscape >960px and any touch laptop. Decorative layers gain `mask-image: linear-gradient(to bottom, transparent 0, rgba(0,0,0,1) 56px)` so circuit grid + constellation dots fade in smoothly below the topbar.
- Why: Previous attempts (border-color transparent → border 0 → box-shadow none) treated symptoms. The architect's deeper analysis identified that the surface color mismatch IS the seam — eliminating the color step is the only definitive fix. The capability query pattern (hover/pointer instead of just min-width) correctly handles iPad landscape, which exceeds 960px but is a touch device and shouldn't get the glass treatment.
- Rollback: revert this PR.

### 2026-04-17 (Hero · Tagline rewrite to "IT research in motion." + mobile topbar seam fix)
- Actor: AI (Replit Agent)
- Severity: LOW (copy + decorative-border fix; zero structural change)
- Trigger: Owner direction — "I really like the IT research in motion. I think that's a good slogan. The text right below it already says that, so it's not like we need to say it twice. Plus, I think it's a better slogan." Also reported a "tiny line" near the top of the screen visible when toggling the mobile hamburger.
- Files:
  - `templates/partials/hero_logo.html` — tagline copy revised to a single line: `IT research <span class="highlight">in motion</span>.`
  - `static/css/late-overrides.css` — within `@media (max-width: 960px)`, added `.topbar { border-bottom-color: transparent; }` so the topbar's gold hairline is dropped on mobile/compact widths only. Desktop retains the WCAG-1.4.11-compliant 38% gold border from PR #545.
  - `STYLE_GUIDE.md` — hero tagline rule updated; new highlight word is `in motion`; explicit guidance that the H1 below the pill carries the literal proposition for SEO and the pill carries the brand promise (no duplication).
- Change: Hero tagline rewritten from `We solve tech problems. / No monthly retainers.` (two lines, two highlights) to `IT research in motion.` (single line, one highlight). The H1 retained verbatim. Mobile topbar bottom border (38% gold hairline) hidden inside `@media (max-width: 960px)`; desktop unchanged.
- Why: The previous tagline duplicated the H1 directly below it, creating cognitive triple-redundancy (page title, hero pill, H1). "IT research in motion" is a stronger brand promise that complements rather than echoes the proposition. The mobile gold hairline was added in PR #545 for desktop UI-component contrast (WCAG 1.4.11) but on mobile the line read as a stray seam, especially during drawer open/close transitions. WCAG 1.4.11 doesn't apply to purely decorative borders, so removing it on mobile is fully compliant.
- Rollback: revert this PR.

### 2026-04-17 (Brand · Owl favicon set + brand-banner OG image + mobile drawer seam fix)
- Actor: AI (Replit Agent)
- Severity: MEDIUM (visible brand change on every browser tab + every social share; CSS-only mobile fix)
- Trigger: Owner attached the Athenian-owl medallion (`NORM-proof-transparent-1080`) and the IT+HELP brand banner (`IT-Help-Brand-Banner`) and asked to "use my owl and my banner". Also reported a faint hairline seam under the topbar when the mobile drawer is open — "It just doesn't separate well and you see that tiny little line."
- Files:
  - `static/img/brand/owl.png` (new, 1080×1080 transparent) — canonical owl mark
  - `static/img/brand/it-help-brand-banner.png` (new, 900×246) — canonical full banner
  - `static/favicon.ico` (new, multi-resolution 16+32+48 ICO built from owl)
  - `static/apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `mstile-150x150.png` — all regenerated from the owl source so every platform shows a consistent brand mark. Old red-plus-based versions backed up to `.local/favicon-backup-pre-owl/`.
  - `static/images/og-home.png` — replaced. New version is the brand banner composited centered on a 1200×630 black canvas (Twitter/Facebook OG card spec). Every social share now shows the owl + IT+HELP wordmark.
  - `templates/base.html`:
    - Replaced `<link rel="icon" href="/red-plus.ico">` with a proper three-link favicon set: `favicon.ico` (any), `android-chrome-192x192.png` (192×192 PNG), `apple-touch-icon.png` (180×180). Existing `manifest.json` already references the android-chrome / mstile files by name, so PWA install also picks up the owl with no further wiring.
  - `static/css/late-overrides.css`:
    - Added `.topbar:has(.topbar-nav-toggle-checkbox:checked) { border-bottom-color: transparent; }` inside the `@media (max-width: 768px)` block. When the mobile drawer is open, the topbar's own 1px border-bottom would otherwise leave a faint hairline between two near-identical dark blocks (topbar and drawer) that reads as a visual seam, not an intentional divider. Hiding it lets the two surfaces merge into one continuous panel; the drawer's own border-bottom still terminates the menu cleanly against page content. Uses `:has()` because the checkbox is a descendant of `.topbar`, not a sibling — `~` couldn't reach the parent. Browser support: Safari 15.4+, Chrome 105+, Firefox 121+ (covers >97% of current global usage).
- Why: Owner-provided brand assets needed primary placements where they would actually be seen — every browser tab (favicon), every PWA install (android-chrome / apple-touch), every social share (OG/Twitter card). The in-page IT+HELP wordmark + tagline pill + red-plus glyph treatment (the carefully-tuned brand non-negotiables) is intentionally untouched. The hamburger seam was a real visual quality bug in the mobile drawer.
- Verification:
  - `scripts/check-token-parity.sh`: PASS
  - `zola build`: clean
  - Compiled `index.html` carries all three favicon links + the OG meta tags pointing at the new banner-based image.
  - PurgeCSS dry-run: `:has()` topbar rule survives in `late-overrides.css`.
  - Backup of all overwritten files in `.local/favicon-backup-pre-owl/` so a one-line `cp` reverts the favicon if needed.
- Pending: Mobile spot-check on a real iPhone after deploy to confirm the seam is gone (the drawer should look like one continuous panel from topbar through last menu item). Twitter/LinkedIn/iMessage social-card preview after deploy.
- Rollback: revert this commit; favicons + OG image revert via `cp .local/favicon-backup-pre-owl/* static/` (the old red-plus.ico file is still on disk, just no longer linked).

### 2026-04-17 (a11y · Lighthouse axe fixes — aria-hidden focusable + skip-link contrast)
- Actor: AI (Replit Agent)
- Severity: MEDIUM (real Lighthouse failures from production audit; affects screen-reader users + keyboard users)
- Trigger: Owner ran a fresh Lighthouse audit on production and surfaced two failing rules.
- Files:
  - `templates/base.html`:
    - Removed `aria-hidden="true"` from the CSS-only hamburger checkbox `<input id="topbar-nav-toggle">`. axe-core correctly flagged it: the input is keyboard-focusable (Space toggles it) and IS the actual interactive element for screen-reader and keyboard users — it must not be hidden from the a11y tree.
    - Moved `aria-label="Toggle navigation menu"` from the `<label>` to the input. The input now carries the accessible name; the label remains the visual click target wrapping the SVG icon. Sighted/mouse behavior unchanged.
  - `sass/_extra.scss`:
    - Added a hardened `a.skip-link` rule (and `:focus`/`:focus-visible`) using `--neutral-black` on `--brand-blue` (~9:1 contrast, above WCAG AAA). Specificity `a.skip-link` (0,1,1) beats the global `a { color: var(--a1) }` rule (0,0,1) regardless of source order or future cascade additions.
    - Lives in `_extra.scss` (compiled into `abridge.css`) instead of `late-overrides.css` so the rule rides in the most reliably-retained stylesheet through prod PurgeCSS — the original failure mode was that a previous deploy's broken purge glob silently stripped `.skip-link` from `late-overrides.css`, leaving the link to inherit the global blue link color on a non-existent background.
    - Explicit `color`/`background` repeated in the `:focus` block as defense in depth.
  - `static/css/late-overrides.css`:
    - Removed the now-duplicated `.skip-link` and `.skip-link:focus` rules; replaced with a comment pointer to `_extra.scss` so the next maintainer doesn't re-add them.
- Why: Two real, failing Lighthouse axe rules from a fresh production audit:
  1. `[aria-hidden="true"] elements contain focusable descendents` on the nav toggle input.
  2. `Background and foreground colors do not have a sufficient contrast ratio` on the skip-link.
  Both block WCAG AA conformance and would degrade the Accessibility score.
- Verification:
  - `scripts/check-token-parity.sh`: PASS (no hex literals leaked)
  - `zola build`: clean
  - Compiled `index.html` confirms input renders as `<input aria-label="Toggle navigation menu" class=topbar-nav-toggle-checkbox id=topbar-nav-toggle type=checkbox>` — no aria-hidden present.
  - PurgeCSS dry-run: `a.skip-link` survives in `abridge.css`; Phase-1 print block + reduced-motion still preserved in `late-overrides.css`.
- Pending: Production re-audit after deploy to confirm both axe rules clear.
- Rollback: revert commit `22c5701`.

### 2026-04-17 (Polish · Phase 1 — a11y motion + print stylesheet + form baseline)
- Actor: AI (Replit Agent)
- Severity: LOW (pure additions; only one existing rule modified — extending a selector list in the existing `prefers-reduced-motion` block)
- Scope: First slice of the "make UI amazing, work everywhere" polish program. Architect-reviewed two-phase plan: Phase 1 = compliance + critical fixes (this entry), Phase 2 = visual evolution (sub-page heroes, ultra-wide treatment, CLS fix, "scientific proof" telemetry footer). This entry covers the highest-leverage Phase 1 items with zero brand risk.
- Files:
  - `static/css/late-overrides.css`:
    - Extended the existing `prefers-reduced-motion` block to add `.blob`, `.circuit-bg`, and `.hex-decoration` to the `display: none` selector list. The global `* { animation-duration: 0.01ms !important }` rule in `tokens.css` already neutralizes their motion, but for *purely decorative* elements we hide them outright — a 0.01ms-cycle blur or rotating ring can still produce visible sub-frame jitter on some renderers, which is exactly the kind of low-amplitude motion vestibular-sensitive users react to. Brand identity (IT/HELP wordmark, gold pill, plus, "san diego") is preserved in static form.
    - New `@media print` block at end of file. Hides topbar/hero/nav/footer/all decorative chrome. Adds a small letterhead (`body::before`) on page 1: `IT+HELP san diego  ·  it-help.tech  ·  (619) 853-5008`. Sets paper-friendly typography (11pt body, 12-18pt headings, 1.5 line-height, 0.65in margins). Expands `<a href="http*">` links inline to full URL so the print is useful offline (skips in-page anchors and `mailto:`/`tel:` which are useless on paper). Tables get full borders inheriting `currentColor`, code blocks get a quiet gray background. All colors flow from existing `--bg-*`/`--text-*` tokens which `tokens.css` Layer 5 already remaps to paper colors under `@media print`. **Zero hex literals**, parity gate green.
  - `sass/_extra.scss`:
    - New `FORM-CONTROL BASELINE` block at end. Tokenized styles for `input[type=text|email|tel|url|search|number|password]`, `textarea`, `select`, with `:hover`, `:focus-visible` (brand-blue ring with 2px offset matching the schedule-CTA pattern), `:disabled`, `::placeholder`, `accent-color` for native checkbox/radio, and `<label>`. Site has zero body-level form controls today (DNS Tool is on its own subdomain), so this is forward-compat — the next contact form / signup / search box inherits the brand instead of OS chrome (which renders inconsistently across Safari/Firefox/Chrome on Win/Mac/Linux and breaks dark mode contrast). 44px tap targets, no `-webkit-appearance` hacks needed for Safari.
- Why: Owner asked the agent to "make the UI amazing, work everywhere on every device, perfectly compatible." Architect (consulted before implementation via explore subagent) recommended the two-phase split. Immediate user-visible benefit: printing the rates page now produces a clean leave-behind document instead of a screenshot of the dark website with hidden URLs.
- Verification (local):
  - `scripts/check-token-parity.sh`: PASS (no hex literals leaked into consumer files)
  - `zola build`: clean, 12 pages + 1 section, zero warnings, ~310ms
  - PurgeCSS pipeline (with PR #537's quoted-glob fix now merged to main): `late-overrides.css` survives at 38,071 B (was 24,313 B pre-print-block). Letterhead, hero-wrapper, reduced-motion, and print rules all preserved through purge. Form baseline survives into `abridge.css`.
- Pending: Visual print-output verification on a real printer / browser print dialog (out-of-band; recommend the owner spot-check `Cmd+P` on `/billing/` and a blog post after merge). PR will be `polish/phase-1-a11y-print-forms` against main.
- Rollback: revert this branch's commits — three additions in two files, zero existing rules deleted.

### 2026-04-17 (Hotfix · Revert COEP `require-corp`)
- Actor: AI (incident response)
- Severity: HIGH (production page blank in Safari below the navigation)
- Scope: Roll back the COEP `require-corp` header that Sub-4-bis added in PR #530.
- Files:
  - `infra/cloudfront/csp-policy-v1.json` — removed COEP item, Quantity 4 → 3
  - `.github/workflows/deploy.yml` — kept the subresource-check step but reframed it as advisory (it no longer guards a load-bearing security header)
  - `PROJECT_EVOLUTION_LOG.md` — this entry
- What broke: Safari rendered the homepage with the top-bar nav visible but everything below the fold blank. Confirmed by user screenshot. Chromium rendered the page correctly, which is why my pre-merge testing missed it.
- Root cause: The CloudFront response-headers policy is attached to the document response only. CSS/JS/image files served from S3 do not carry `Cross-Origin-Resource-Policy` per-asset. Per the Fetch spec, same-origin responses without CORP should still be allowed under `require-corp`, but WebKit/Safari enforces a stricter interpretation than Chromium for some asset types and silently blocks them, leaving the document with no rendered body content.
- Fix: Remove the COEP header. Keeps the rest of Sub-4 / Sub-4-bis intact (zero-hash CSP, COOP, CORP on the document, the subresource gate script).
- What I should have done before shipping #530: tested the live deploy in Safari, not just Chromium. Adding to the post-deploy checklist below.
- Future re-promotion path (if ever pursued):
  1. First add a CloudFront cache behavior + a second response-headers policy that attaches the same CORP `same-origin` header to all `/css/*`, `/js/*`, `/images/*`, `/fonts/*` paths.
  2. Verify in Safari Tech Preview as well as stable Safari.
  3. Then re-add COEP `require-corp` (or try `credentialless` first, which is more permissive).
- Updated post-deploy QA checklist (additions to the Sub-5 entry below):
  - Open prod homepage in Safari (macOS and iOS) before declaring success on any header change.
- Rollback of this rollback: revert this branch's commits.

### 2026-04-17 (Sub-4-bis · COEP promotion)
- Actor: AI (CSP follow-up)
- Scope: Promote `Cross-Origin-Embedder-Policy: require-corp` and add a CI gate that prevents future blog posts / template changes from silently breaking it. This is the follow-up the Sub-5 entry below documented as "safe to ship now."
- Files:
  - `infra/cloudfront/csp-policy-v1.json` — added COEP header, Quantity 3 → 4
  - `scripts/check-no-external-subresources.sh` — new CI gate
  - `.github/workflows/deploy.yml` — wired the gate in after the asset-copy step, before the CSP-update step
  - `PROJECT_EVOLUTION_LOG.md` — this entry
- Change:
  1. Appended `Cross-Origin-Embedder-Policy: require-corp` to `csp-policy-v1.json`'s `CustomHeadersConfig.Items`. `require-corp` (not `same-origin`, which is not a valid COEP value — that confusion is with COOP) is the strict variant Mozilla Observatory awards bonus points for. Safe to ship because Sub-5's subresource crawl returned zero external loads.
  2. New CI gate `scripts/check-no-external-subresources.sh` parses every built `*.html` (excluding signature pages on their separate CF behavior) and fails with a clear error if it finds any cross-origin `<script src>`, `<link rel=stylesheet|preload|modulepreload|icon|manifest|mask-icon|apple-touch-icon|prefetch href>`, `<img src>`, `<iframe src>`, `<video src>`, `<audio src>`, `<source src>`, `<embed src>`, or `<object data>`. Verified locally: exits 0 against current `public/`.
  3. Wired into `deploy.yml` as a new step between "Copy images and root files" and the CSP-update steps. Fails closed: if a future change introduces an external embed, the deploy aborts BEFORE the CSP/headers policy is updated, so production stays serving the previous (working) policy.
- Why: One more Observatory bonus (COEP `require-corp` is +5 in the standard scoring), and a permanent safety net so the COEP header can never silently break.
- Confirmed safe by: `update_policy.sh → generate_policy.py` only mutates `SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy`. It never touches `CustomHeadersConfig`. The new COEP header therefore survives every future CSP regeneration without special handling.
- Optional future improvement (not in this PR): add a separate workflow job that runs the gate on PR (the current deploy job is gated on `event_name == 'push'`, so PRs only catch this at merge time). The gate is fast (<100ms) so a PR-time run is cheap.
- Rollback: revert this branch's commits, or remove the COEP item from `csp-policy-v1.json` and bump Quantity 4 → 3.

### 2026-04-17
- Actor: AI (Sub-agent 5: Quality-Gate Verification)
- Scope: Final QA gate for the design-transfer/v1 redesign per `.agent-transfer/plans/port-checklist.md` Sub-5. Bookend entry for the redesign work begun in Sub-1.
- Files:
  - `PROJECT_EVOLUTION_LOG.md` (this entry + redesign-v1 scorecard)
  - `RELEASE_NOTES_v1.0.0.md` (new — consolidated release notes for the redesign)
- Change: Ran the dev-side verification suite that this environment can execute, documented the post-deploy verification procedure for the items that can only be measured against production (Mozilla Observatory rescan, CISA-style external scan, Lighthouse-against-CloudFront), and assembled the redesign scorecard.

#### Dev-side verification PASSED
- `zola build` clean: 12 pages + 1 section, zero errors, zero warnings.
- Token-parity gate (`scripts/check-token-parity.sh`) passes — Sub-2 SOT integrity intact.
- Inline-content audit: **0 inline executable scripts, 0 inline `<style>` blocks** across all 12 site HTML files (signature-page on its separate CloudFront behavior excluded). 15 JSON-LD `<script type="application/ld+json">` blocks remain — these are data per W3C CSP §6.6.4.2 and Sub-4's generator filter correctly excludes them from `script-src`.
- Broken-link / dead-asset scan over built `public/`: **0 broken**.
- Visual smoke (desktop, all 5 audited pages): `/`, `/about/`, `/services/`, `/security-policy/`, `/blog/` all render with the new top-bar nav, IT+HELP wordmark logo, and consistent chrome. Hero animation correctly scoped to `/` only (no leakage onto sub-pages — verified by direct inspection of each route).

#### Bonus finding — COEP `require-corp` is now safe to promote
- Sub-4 deferred COEP per the plan caveat that requires a "subresource crawl of every built page proving zero cross-origin loads." That crawl ran here and returned **0 external subresources** across all site pages (script src, img src, link rel=stylesheet/preload/icon, iframe, etc.). The site uses zero CDN-served assets, zero Google Fonts, zero embedded media.
- Recommendation: a follow-up Sub-4-bis PR can add `Cross-Origin-Embedder-Policy: same-origin` (or `require-corp`) to `infra/cloudfront/csp-policy-v1.json` for the documented +5 Observatory bonus. Suggested verification gate is the same shell one-liner used here, wired into the `zola build` CI step so any future blog post adding an embed is caught before deploy.

#### Pending production verification (post Sub-5 merge + deploy)
The following deliverables from `port-checklist.md` Sub-5 require the live CloudFront-served production site (none can be measured against the dev server):
1. **Mozilla Observatory rescan** of `https://www.it-help.tech/` and 3 sub-pages (`/about/`, `/services/`, `/security-policy/`). Target: ≥145. Submit at https://developer.mozilla.org/en-US/observatory/analyze?host=www.it-help.tech.
2. **Lighthouse 100/100/100/100** on the same 5 audited pages, run via Chrome DevTools or `lighthouse https://www.it-help.tech/ --preset=desktop` against the CloudFront-served URLs.
3. **CISA Cyber Hygiene-style external scan**: TLS rating, DNS records, SPF/DKIM/DMARC alignment, CAA, MTA-STS — confirm no regression vs the pre-redesign posture (e.g., Hardenize, ImmuniWeb, MX Toolbox).
4. **axe-core a11y audit** against production URLs (browser extension or `@axe-core/cli`). Target: 0 violations on every page.
5. **SRI smoke check**: open prod homepage in Chrome with DevTools → Console open. Expect zero "Failed to find a valid digest" or "Subresource Integrity" violations for `theme-init.js` (Sub-4 added integrity attribute, but dev-server CORS quirks suppress validation locally — only production exercises this code path).
6. **Tag `corp-site-redesign-v1.0.0`** once the five checks above pass. Suggested commit: the merge commit of this PR.

#### Redesign scorecard (Sub-1 → Sub-5)
| Sub-agent | PR  | Status | Key win |
|-----------|----:|--------|---------|
| 1: IA & Content | #525 | merged | 5-section homepage, 6-anchor services, "intelligence brief" tone-of-voice |
| 2: Design Tokens | #526 | merged | tokens.css/SOT, dark-theme baseline, parity CI gate, brand-block extension |
| 3: Templates | #527 | merged | new top-bar nav, IT+HELP wordmark, hero scoped to homepage, footer org-tree |
| 4: CSP Hardening | #528 | merged | CSP collapsed 2KB → 260B, zero hashes, COOP+CORP added |
| 5: QA Gate | (this PR) | in flight | dev-side verification PASS; production rescans documented for post-deploy |

#### Non-negotiables verified (visually)
- Red plus (`#ff0066`) — visible on `/` hero. Untouched. ✓
- IT/HELP outline (`var(--brand-it-help-blue)` gradient) — visible on `/` hero AND in the new top-bar wordmark on every page. ✓
- Math hero animation — `static/js/hero-logo.js` SHA confirmed unchanged across the entire redesign (`git log static/js/hero-logo.js` shows no edits since the redesign began). ✓
- No tracking, no cookies, no JS frameworks — confirmed by external-subresource audit (0 external loads). ✓

- Rollback: revert this branch's commits (`codex/sub5-qa-gate`).

### 2026-04-17
- Actor: AI (Sub-agent 4: CSP Hardening & CloudFront Policy)
- Scope: Push Mozilla Observatory 130 → ≥145 by externalizing the last inline script + style and adding bonus security headers (per `.agent-transfer/plans/csp-tightening-plan.md`).
- Files:
  - `static/js/theme-init.js` (new — extracted theme-flash IIFE from `templates/partials/head.html`)
  - `templates/partials/head.html` (replaced inline `<script>` with same-origin `<script src=... integrity=sha384-... crossorigin=anonymous>` blocking — must run pre-paint; replaced inline `<style>{{critical_css}}</style>` with `<link rel=stylesheet href=css/critical.min.css>`; removed obsolete `noscript` wrapper and the now-unused `load_data` import)
  - `infra/cloudfront/generate_policy.py` (added `NON_EXECUTABLE_TYPE_RE` filter so `<script type="application/ld+json">`, `application/json`, `application/importmap`, and `speculationrules` blocks no longer consume `script-src` allowance — they are data per W3C CSP §6.6.4.2 and were inflating the policy with 15 unnecessary hashes)
  - `infra/cloudfront/csp-policy-v1.json` (regenerated CSP collapses to `default-src 'none'; ...; style-src 'self'; script-src 'self'; ...` — zero hashes, 260 bytes vs ~2KB before; added `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Resource-Policy: same-origin` custom headers)
  - `PROJECT_EVOLUTION_LOG.md` (this entry)
- Change: Removed every CSP hash from the site policy by externalizing the two remaining inline blocks and teaching the policy generator to ignore non-executable `<script>` types. Added COOP+CORP for the documented +10 Observatory bonus.
- Score delta target: Observatory 130 → ≥145 (+10 from "no inline executable scripts/styles, hash-free policy" + +10 from COOP/CORP). COEP `require-corp` deferred per the plan caveat (requires staging crawl validation of every cross-origin subresource before promotion).
- Verification: `zola build` clean; `python3 infra/cloudfront/generate_policy.py --mode site` reports `0 inline script hashes, 0 inline style hashes, CSP length 260`; programmatic audit of `public/*.html` (excluding the signature page on its separate CloudFront behavior) confirms zero inline executable `<script>` and zero inline `<style>` blocks; live preview renders identically to pre-change.
- Non-negotiables verified: `static/js/hero-logo.js` not modified; Sub-2 token system intact (parity gate passes); Sub-3 chrome unchanged.
- Rollback: revert this branch's commits (`codex/sub4-csp`).

### 2026-02-15
- Actor: AI (Sub-agent 2: Design Token Adoption)
- Scope: Design token adoption (SOT) + token-parity CI gate + dark-theme baseline
- Files:
  - `static/css/tokens.css` (new — verbatim copy of `.agent-transfer/tokens/tokens.css`)
  - `sass/_tokens.scss` (new — verbatim copy of `.agent-transfer/tokens/tokens.scss`)
  - `sass/_extra.scss` (added `@use "tokens" as *;` at top so SCSS variables are available)
  - `templates/partials/head.html` (single `<link>` insertion: `tokens.css` loaded immediately before `late-overrides.css`; head.html is where the `late-overrides.css` link lives, so the one-line stylesheet insertion was made adjacent to it instead of in `base.html`)
  - `scripts/check-token-parity.sh` (new — parses `--*` from `tokens.css` and `$*` from `_tokens.scss`, asserts (name → value) parity, then runs the hex-grep gate over `late-overrides.css` / `_extra.scss` / `abridge.scss`, excluding both SOT files)
  - `STYLE_GUIDE.md` (appended Design Tokens section + token table — Sub-agent 1's tone-of-voice section untouched)
- Change: Installed `tokens.css` and `_tokens.scss` as the project SOT. Wired tokens.css into the cascade ahead of `late-overrides.css` so component CSS can consume `var(--*)`. Added `@use "tokens" as *;` to `_extra.scss` so SCSS-side files can also reference token values at compile time. Added the token-parity CI script. Updated `STYLE_GUIDE.md` with the canonical token table. Dark-theme baseline now applied via `tokens.css` `body { background-color: var(--bg-primary); color: var(--text-primary); }`.
- Why: Establish a single, drift-checked source of truth for color/typography/spacing tokens before Sub-agent 3 rebuilds the templates.
- Status / known blocker: Hex audit (Deliverable B) STOPPED per task rule "If a hex has no matching token, STOP and report it in your PR body — do not invent new tokens." The corp-site brand palette currently in `static/css/late-overrides.css` (`--brand-blue`, `--logo-blue-*`, `--schedule-blue-*`, `--schedule-cta-*`, `--accent-gold`, `--accent-gold-solid`, plus the `#ff0066` plus and the `#D2B56F` gold pill stroke) has no equivalents in `tokens.css`, and replacing them with the closest dns-tool tokens (e.g., `--accent-violet` warm copper) would violate the "red plus + IT/HELP outline visually unchanged" non-negotiable. ~104 hex literals therefore remain in the three audited files; `scripts/check-token-parity.sh` exits 1 on the hex-grep gate. Parity check itself passes. Architect decision needed on whether to (a) extend `tokens.css` with a corp-brand block or (b) accept the visual shift to dns-tool tokens.
- Non-negotiables verified: `static/js/hero-logo.js` not modified; red plus and IT/HELP outline rules in `late-overrides.css` not modified.
- Rollback: revert this branch's commits (`codex/sub2-design-tokens`).

### 2026-02-15
- Actor: AI (Sub-agent 1: Information Architecture & Content)
- Scope: IA & content rewrite per design-transfer/v1 (homepage, services, tone-of-voice)
- Files:
  - `content/_index.md`
  - `content/services.md`
  - `STYLE_GUIDE.md`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Rewrote `content/_index.md` body to the 5-section homepage structure from `.agent-transfer/plans/ia-blueprint.md` (hero with new sub-tagline + primary/secondary CTAs, 3-card service teaser, trust-signals strip, "The Method" think-tank paragraph linking to `/blog/` and `dns.it-help.tech`, local credibility block with NAP and phone). Restructured `content/services.md` body into six anchored sections (`#mac`, `#wifi`, `#dns-email`, `#cybersecurity`, `#data-extraction`, `#managed-agent`) with the new `#managed-agent` paragraph framing the $50/device opt-in agent as the explicit anti-managed-services position; refreshed the `ItemList` and `Service` JSON-LD entries to match the new section names and anchors. Appended a new "Tone of Voice" section to `STYLE_GUIDE.md` codifying calm authority, no marketing-speak, specific-over-generic, discretion language, and one-scientific-moment-per-page rules. All existing JSON-LD `<script>` blocks preserved; raw-HTML `cta-button` markup preserved.
- Why: Sub-agent 1 deliverable in the design-transfer/v1 multi-agent port. Locks the structure before Sub-agent 3 rebuilds templates and ensures copy reads at the "intelligence brief" register the architect specified.
- Rollback: revert PR for branch `codex/sub1-ia-content`.

### 2026-02-14
- Actor: AI
- Scope: Deploy reliability hardening (CloudFront invalidation wait robustness)
- Files:
  - `.github/workflows/deploy.yml`
- Change: Replaced `aws cloudfront wait invalidation-completed` with explicit `get-invalidation` polling (90 attempts x 20s = 30 minutes), adding per-attempt status logging and a bounded timeout error message.
- Why: Main-branch deploy failed after merge because CloudFront invalidation exceeded the AWS waiter default timeout ("Max attempts exceeded") even though artifact upload and CSP updates succeeded.
- Rollback: this branch/PR (pending commit hash/PR number).

### 2026-02-14
- Actor: AI
- Scope: Security disclosure hardening + external-link safety refinement
- Files:
  - `content/security-policy.md`
  - `static/.well-known/security.txt`
  - `static/security.txt`
  - `templates/base.html`
- Change: Hardened disclosure operations by adding an authorized-assessment intake checklist, explicit urgent-report handling, and an acknowledgments section in `/security-policy`. Expanded `security.txt` metadata with a secondary policy URL contact and an RFC-compatible `Acknowledgments` field. Updated the Schedule external link rel attributes to `noopener noreferrer`.
- Why: User requested additional cleanup and best-practice refinement from all angles after initial security-policy rollout.
- Rollback: this branch/PR (`codex/security-policy-authorized-testing`, `#511`).

### 2026-02-14
- Actor: AI
- Scope: Security disclosure publishing (`/security-policy` + RFC 9116 `security.txt`)
- Files:
  - `content/security-policy.md`
  - `static/.well-known/security.txt`
  - `static/security.txt`
- Change: Added a dedicated non-nav `security-policy` page with coordinated disclosure guidance (contact, safe harbor, scope, response targets, and disclosure expectations), then refined scope language to explicitly allow written-authorized government/contracted testing (including CISA cyber hygiene and approved red-team/social-engineering activity). Published machine-readable contact metadata at both `/.well-known/security.txt` (canonical) and `/security.txt` (compatibility path).
- Why: User requested IT Help Tech security reporting text aligned to existing DNS Tool style, with Red Sift continuing to handle MTA-STS hosting separately, and then clarified that authorized federal/program testing must be explicitly accommodated in policy language.
- Rollback: this branch/PR (`codex/security-policy-rfc9116`, `#510`).

### 2026-02-13
- Actor: AI
- Scope: Deploy hygiene (remove stale HTML without affecting active blog output)
- Files:
  - `.github/workflows/deploy.yml`
- Change: Tightened the HTML deploy sync filter to HTML-only (`--exclude "*" --include "*.html"`) and added `--delete` so stale legacy HTML keys are removed from S3 during deploy.
- Why: Post-report remediation found old legacy HTML endpoints persisting in production despite no longer being generated by current builds; this cleanup keeps crawl/index surface aligned with actual site output.
- Rollback: this branch/PR (`codex/deploy-html-delete-cleanup`, `#509`).

### 2026-02-13
- Actor: AI
- Scope: Mobile Lighthouse TBT recovery (hero animation workload reduction)
- Files:
  - `static/js/hero-logo.js`
- Change: Deferred constellation startup to idle-time, added touch-device frame throttling, reduced touch-node density, replaced per-call crypto random sampling with pooled random values, and removed per-frame array allocations in link drawing/neighbor selection paths.
- Why: User requested a symbiotic remediation pass to improve mobile Lighthouse performance while keeping Ahrefs/SEO crawl hygiene and preserving the established visual system.
- Rollback: this branch/PR (`codex/mobile-tbt-recovery-v1`).

### 2026-02-13
- Actor: AI
- Scope: Ahrefs crawl follow-up (internal redirect-noise reduction)
- Files:
  - `templates/base.html`
- Change: Updated primary nav internal links to explicit trailing-slash URLs (`/services/`, `/billing/`, `/about/`, `/blog/`, `/dns-tool/`) so crawlers hit canonical section URLs directly instead of slashless variants that can produce 3xx hops.
- Why: Post-report remediation pass for the "redirect/HTTP redirect" issue set, focusing on safe, non-visual crawl hygiene improvements.
- Rollback: this branch/PR (`codex/ahrefs-report-followup-20260213`).

### 2026-02-11
- Actor: AI+Developer
- Scope: GitHub Actions supply-chain hardening (full SHA pinning)
- Files:
  - `.github/workflows/deploy.yml`
  - `.github/workflows/dependabot-actions-check.yml`
- Change: Pinned all third-party GitHub Actions in active workflows to full commit SHAs and retained major-version comments so Dependabot can continue updating pinned SHAs automatically.
- Why: User approved the strongest mitigation for workflow action integrity while keeping updates self-maintaining.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Dependabot GitHub Actions self-maintenance + safe auto-merge
- Files:
  - `.github/dependabot.yml`
  - `.github/workflows/dependabot-actions-check.yml`
  - `.github/workflows/dependabot-actions-automerge.yml`
- Change: Added Dependabot configuration for weekly grouped GitHub Actions updates and a two-stage automation flow: a Dependabot-only workflow validation (`zola build`, workflow-file-only scope enforcement) and a follow-up workflow that enables PR auto-merge only after the check workflow succeeds.
- Why: User requested mostly self-maintaining action dependency updates with controlled auto-merge after checks.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Sonar remediation pass (brand-colors + hero RNG hotspot hardening)
- Files:
  - `static/js/brand-colors.js`
  - `static/css/brand-colors.css`
  - `static/js/hero-logo.js`
- Change: Removed deprecated clipboard fallback path and modernized brand-colors script to `let`/`const`, optional chaining, `for-of`, and `globalThis` usage to satisfy Sonar JS rules; strengthened light-theme contrast for chip/code text combinations flagged by Sonar; replaced hero constellation `Math.random()` calls with Web Crypto-backed random sampling (`crypto.getRandomValues`) with deterministic fallback.
- Why: User requested remediation of Sonar issues/hotspots export files and cleanup of actionable findings.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: `/brand-colors` readability + bulk copy controls + sitemap exclusion hardening
- Files:
  - `content/brand-colors.md`
  - `static/css/brand-colors.css`
  - `static/js/brand-colors.js`
  - `templates/sitemap.xml`
  - `.github/workflows/deploy.yml`
- Change: Increased top priority palette chip sizing for readability, added top-level `Copy all HEX` and `Copy all CSS vars` controls, and enhanced brand-color copy interactions. Added a custom sitemap template to skip URLs flagged for noindex and explicitly exclude `/brand-colors/`. Added PurgeCSS safelist entries for copy-state classes used at runtime.
- Why: User requested clearer immediate color visibility, faster bulk handoff tooling, and full search hygiene by keeping the noindex page out of sitemap as well.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: `/brand-colors` immediate palette visibility + robust mini swatch rendering
- Files:
  - `content/brand-colors.md`
  - `static/css/brand-colors.css`
  - `static/js/brand-colors.js`
- Change: Added a top-of-page priority palette strip for the most important colors (blue, logo blue, plus red, gold accent, gold stroke) so brand relationships are visible before scrolling; updated per-card mini swatch generation to reuse existing static `swatch-*` classes for production reliability.
- Why: User requested instant top-level color visibility and confirmed small swatches were not consistently visible in the current render.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: `/brand-colors` compact swatch visibility refinement
- Files:
  - `static/css/brand-colors.css`
  - `static/js/brand-colors.js`
- Change: Converted large card-top swatches into compact accent strips and added small visible swatch chips beside each value code; swatch chips are generated per-card from value/color sources so collaborators can quickly see color relationships without extra vertical bulk.
- Why: User requested small, clearly visible swatches close to the copy controls so color interactions are immediately readable.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: `/brand-colors` layout correction + explicit copy actions
- Files:
  - `content/brand-colors.md`
  - `static/css/brand-colors.css`
  - `static/js/brand-colors.js`
  - `templates/partials/head.html`
- Change: Fixed brand-colors page alignment by overriding Abridge global `section` grid/flex behavior with page-scoped block/grid rules and card sizing resets; added visible per-card copy buttons (token/value) driven by a CSP-safe external script, plus page-level script loading support in head partial via `extra.scripts`.
- Why: User reported misaligned swatch layout and requested obvious copy/paste controls so collaborators can quickly copy token names and color values.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Public brand color swatch reference page (`/brand-colors`) with noindex controls
- Files:
  - `content/brand-colors.md`
  - `static/css/brand-colors.css`
- Change: Added a dedicated, shareable brand color page with canonical swatches, token/value labels, usage notes, and brand rules; attached page-specific styling via external CSS and set page robots meta to `noindex, nofollow`.
- Why: User requested a professional public-facing swatch page for internal/external collaborator handoff that should remain accessible by URL but not indexed in search.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Brand color reference documentation
- Files:
  - `BRAND_COLORS.md`
  - `STYLE_GUIDE.md`
- Change: Added a dedicated brand color reference sheet with swatches, token names, hex/rgba values, usage guidance, and copy-ready brand rules; linked the file from the style guide key-files section.
- Why: User requested a centralized color sheet to improve brand consistency and faster matching across pages.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Schedule CTA token sync + Lighthouse render-blocking hygiene
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Introduced dedicated `--schedule-cta-*` tokens and rewired `.schedule-link` base/hover styles to consume tokens instead of hardcoded hex values. Removed five unused keyframe blocks (`gradient-shift`, `specular-sweep`, `logo-gleam`, `logo-sheen`, `shine`) from render-blocking CSS after Lighthouse insight review.
- Why: User requested final token cleanup and remediation of actionable Lighthouse findings while preserving the approved visual result.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: IT/HELP anti-purple micro-channel tune (v2)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Applied a smaller RGB channel correction to the logo blues (lower red, slightly higher green) across dark and light logo fills, preserving the same luminance hierarchy while reducing residual violet perception on Apple displays.
- Why: User still observed a subtle purplish cast in top logo edges and requested best-practice final polish rather than major recoloring.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: IT/HELP anti-purple hue correction (Apple-safe)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Rotated the IT/HELP blue ramp a few degrees cooler (same luminance band) and updated light-theme logo fills to match, reducing violet cast while preserving existing gold perimeter, hierarchy, and Safari-safe solid fill rendering.
- Why: User reported the top logo letters still read slightly purplish; objective was true-blue correction without reintroducing risky gradient text techniques.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Hero final optical-weight polish (logo blue depth, schedule restraint, pill centering)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Slightly deepened the IT/HELP blue ramp to reduce top-edge brightness, subdued Schedule CTA highlight/base blues another step so the logo remains the brightest blue element, darkened `san diego` for stronger lockup anchoring, and applied +1px bottom optical padding in the hero pill (desktop/mobile) while keeping the Apple-safe solid text-fill pipeline.
- Why: User requested a best-practice final refinement pass focused on cohesion, hierarchy, and professional finish without introducing rendering risk.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: Hero hierarchy micro-tuning (blue split, plus depth, pill restraint)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Increased IT/HELP hierarchy by deepening `IT` blue while lifting `HELP`, added subtle depth shaping to the red plus via text-shadow (hue unchanged), darkened `san diego` tone for stronger anchoring, reduced hero pill gold border weight to a restrained thickness, and darkened the Schedule CTA blue one step to keep the logo as the dominant blue element.
- Why: User requested precision feedback on cohesion and asked to tighten visual hierarchy without redesigning the hero identity system.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: IT/HELP enterprise hierarchy blue split (IT darker, HELP lighter)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Shifted the logo authority blue ramp to an enterprise profile anchored on `#2F5FAF`, then split lockup hierarchy so `IT` uses the mid token while `HELP` uses the slightly lighter top token in both dark/light theme variants; retained existing gold stroke widths and `P` artifact safeguards.
- Why: User requested a more decisive, cohesive blue direction and provided a preference for `IT` darker with `HELP` subtly lighter while keeping gold perimeter treatment.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-11
- Actor: AI+Developer
- Scope: IT/HELP deep cobalt-blue refinement (gold edge preserved)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Shifted the IT/HELP blue ramp to deeper, higher-saturation cobalt values and tuned blue depth-shadow channels (dark and light variants) so the lettering reads more decisively blue while preserving the existing gold stroke widths and per-glyph `P` stability safeguards.
- Why: User requested the strongest possible blue presentation, slightly darker than current, while keeping the gold perimeter around `IT` and `HELP`.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP blue-only darkening refinement (gold preserved)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Restored the logo blue ramp to a darker prior profile and darkened light-theme IT/HELP fill color while leaving all current gold stroke/perimeter settings unchanged.
- Why: User preferred the previous darker blue interior and requested focusing only on blue tone while keeping the current gold wrap behavior.
- Rollback: this branch/PR (`codex/ithelp-blue-darken-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP richer blue + thicker gold wrap experiment
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Tuned the logo blue ramp to a richer mid-blue fill and increased IT/HELP gold perimeter stroke/closure intensity toward a pill-border-adjacent weight (dark + light variants), while retaining desktop per-glyph `P` carveout safeguards.
- Why: User requested experimentation with stronger interior blue presence and a thicker gold wrap option versus the prior thin perimeter.
- Rollback: this branch/PR (`codex/ithelp-blue-gold-balance-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP P top-spur subpixel cleanup (desktop)
- Files:
  - `templates/partials/hero_logo.html`
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Isolated the `P` in `HELP` for per-glyph desktop tuning, then snapped desktop logo sizing/offsets to integer-pixel geometry and reduced `P`-only stroke/halo intensity to suppress the persistent top spur without weakening the mobile wrap.
- Why: User-confirmed top-of-`P` artifact remained on desktop after global perimeter adjustments.
- Rollback: this branch/PR (`codex/ithelp-p-subpixel-clean-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP desktop P shoulder spur cleanup
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Added desktop-only (`min-width: 700px`) reductions for IT/HELP gold stroke and halo intensity (dark + light variants) to smooth the top shoulder of `P`, while preserving stronger mobile wrap settings.
- Why: User-reported artifact was visible on desktop at the top of `P` but not on mobile; breakpoint-scoped tuning targets the failing surface directly.
- Rollback: this branch/PR (`codex/ithelp-p-top-spur-fix-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP gold perimeter continuity pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Kept direct text-stroke rendering but strengthened perimeter continuity with a tiny centered gold smoothing halo and a subtle downward gold closure shadow (dark + light variants), while avoiding filter-based ring effects.
- Why: User feedback indicated the gold wrap around IT/HELP still looked incomplete/uneven and needed a cleaner, more continuous edge read.
- Rollback: this branch/PR (`codex/ithelp-gold-wrap-clean-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP P contour cleanup (Apple weight + stroke simplification)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Simplified IT/HELP edge treatment to direct gold text-stroke plus downward depth shadows (removed extra gold filter halos), slightly increased stroke width for cleaner full-perimeter read, and removed Apple-specific 800-weight downshift so Safari/iPhone keeps the native heavyweight glyph geometry.
- Why: User still observed dirty/janky rendering around the top of `P`; this pass prioritizes contour cleanliness over effect layering.
- Rollback: this branch/PR (`codex/ithelp-p-solid-clean-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP perimeter cleanup (P top-edge smoothing) + blue refinement
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Removed the top-edge micro highlight from IT/HELP shadow stacks, normalized gold stroke widths toward integer values, and rebalanced the gold smoothing/closure shadows so the outline reads more continuous around glyphs without rough `P` shoulder artifacting. Also nudged the logo blue ramp slightly darker for better headline fit.
- Why: User feedback confirmed the top of `P` still looked messy and requested a cleaner full-wrap gold perimeter with a better-fitting blue.
- Rollback: this branch/PR (`codex/ithelp-p-top-clean-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP horseshoe artifact cleanup + blue pop tune
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Switched wordmark stroke rendering back to `paint-order: stroke fill` to remove inner `P` horseshoe artifacts, added a downward-only gold micro-shadow for lower-edge closure, and nudged the logo blue ramp darker for stronger headline pop.
- Why: User feedback confirmed the prior pass reintroduced a `P` horseshoe artifact and still needed richer blue emphasis.
- Rollback: this branch/PR (`codex/ithelp-p-horseshoe-fix-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP perimeter closure + blue depth rebalance
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Switched IT/HELP stroke rendering to `paint-order: fill stroke` with near-1px gold strokes and a subtle downward gold micro-shadow so the perimeter reads as a complete wrap (including bottom edges). Also nudged logo blue ramp slightly darker for stronger headline presence.
- Why: User feedback showed bottom outline segments were still weak and the interior blue read too light.
- Rollback: this branch/PR (`codex/ithelp-gold-stroke-polish-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP gold stroke cleanup and solidity pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Increased IT/HELP stroke widths to near-1px values and added a tight gold smoothing halo in text-shadow to reduce jagged edges and make the gold perimeter read as a solid professional border.
- Why: User feedback confirmed the prior gold stroke was visible but still too thin/janky compared to the crisp hero pill border.
- Rollback: this branch/PR (`codex/ithelp-gold-stroke-polish-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP explicit gold stroke visibility pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Replaced IT/HELP drop-shadow perimeter ring with direct `-webkit-text-stroke` gold outlines (dark + light variants) keyed to `--accent-gold-solid`, while retaining blue fill and depth shadows.
- Why: User reported no visible gold perimeter after repeated ring-shadow passes and requested a clearly solid wrap comparable to the hero pill border.
- Rollback: this branch/PR (`codex/ithelp-explicit-gold-stroke-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP solid gold wrap visibility pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Strengthened IT/HELP perimeter ring with higher-opacity balanced drop-shadow offsets and switched ring color to the same solid gold used by the hero pill border (`#D2B56F`) so the wraparound outline is clearly visible.
- Why: User requested a more solid, obvious gold perimeter around letters comparable to the pillbox border treatment.
- Rollback: this branch/PR (`codex/ithelp-solid-gold-wrap-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP darker blue cohesion + P artifact cleanup
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Returned IT/HELP blue tokens to a deeper palette and replaced the dense directional gold text-shadow ring with a balanced drop-shadow perimeter model (dark + light variants) to smooth curved letter edges while preserving visible thin gold trim.
- Why: User feedback indicated the prior pass looked too light blue and still showed top-edge artifacting on `P`.
- Rollback: this branch/PR (`codex/ithelp-p-clean-darkblue-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP Safari artifact kill + headline emphasis pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Removed `background-clip:text` + transparent fill from IT/HELP and switched to solid blue `currentColor` fills with a cleaner, slightly thicker balanced gold perimeter shadow ring. Also brightened logo blue ramp tokens for stronger headline presence.
- Why: User feedback confirmed the `P` top artifact remained visible on both desktop and mobile and the interior blue still read too muted.
- Rollback: this branch/PR (`codex/ithelp-p-artifact-kill-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP desktop edge cleanup + blue fill pop pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Lifted the logo blue ramp for brighter interior fill, reduced inner contour heaviness, and rebalanced top/bottom gold perimeter ring weights so rounded glyph tops (notably `P`) render cleaner while keeping the thin wraparound gold strip visible.
- Why: User feedback indicated desktop still showed rough artifacts at the top of `P` and the inner blue needed more presence.
- Rollback: this branch/PR (`codex/ithelp-p-smooth-blue-pop-v1`).

### 2026-02-10
- Actor: AI+Developer
- Scope: IT/HELP visible strip layering pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Reordered and resized the IT/HELP edge stack so a smaller inner blue contour sits above a larger gold ring (dark and light variants), producing a clearly visible thin gold strip around glyphs while keeping blue fill dominant.
- Why: User feedback remained that gold perimeter was not visible in real Safari/iPhone renderings.
- Rollback: this branch/PR (`codex/ithelp-gold-strip-visible-v2`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP gold perimeter band refinement
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Reworked IT/HELP edge treatment to a clearer perimeter gold band around each glyph (all sides) with a restrained dark outer cut, while preserving blue letter fill dominance and existing optical spacing.
- Why: User requested gold in the geographic perimeter around each letter rather than a faint top cue or yellow-dominant fill.
- Rollback: this branch/PR (`codex/ithelp-gold-band-outline-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP wraparound micro-trace refinement
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Replaced the single top gold cue with an ultra-low-alpha 360-degree sub-pixel trace around IT/HELP glyph edges (dark + light variants) while preserving blue-dominant fill and existing kerning/offset geometry.
- Why: User requested visible per-letter gold outlining without reintroducing an overall yellow/gold cast.
- Rollback: this branch/PR (`codex/ithelp-gold-outline-micro-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP de-yellow correction (blue-first with ultra-faint trace)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Reduced gold trace contribution to a single very low-alpha top cue and restored a brighter blue logo ramp so IT/HELP reads clearly blue at normal viewing distance while retaining micro-kerning/offset tuning.
- Why: User feedback showed the prior pass still looked too yellow in real-device renderings.
- Rollback: this branch/PR (`codex/ithelp-deyellow-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP blue-dominant micro-trace + kerning pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Rebalanced IT/HELP to stay clearly blue-first while retaining only a tiny gold edge cue, and introduced global micro-kerning/optical offset tuning (desktop + mobile) for tighter, more finished glyph geometry.
- Why: User feedback indicated the prior pass read too gold; objective was blue letterfill with a subtle premium trace and cleaner optical spacing.
- Rollback: this branch/PR (`codex/ithelp-blue-trace-kerning-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP micro gold-trace experiment
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Added a restrained top-biased gold micro-trace to IT/HELP letter shadow stacks (dark + light variants) while keeping core navy fill, red plus, and `san diego` unchanged.
- Why: Evaluate whether a tight gold edge cue increases perceived finish/premium quality without introducing noisy full-stroke artifacts.
- Rollback: this branch/PR (`codex/ithelp-gold-trace-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP head-anchor presence pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Re-centered on the premium-dark logo ramp, increased IT/HELP wordmark size/optical tightness, and reduced sheen back to restrained contour shadows so the text reads as the primary page anchor without changing `san diego` treatment.
- Why: User requested improvements specifically to the words `IT` and `HELP`, with stronger first-impression hierarchy and a more finished look.
- Rollback: this branch/PR (`codex/ithelp-head-anchor-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP modern-electric top-highlight variant
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Kept the premium-dark IT/HELP base depth but raised the top blue highlight and edge-light intensity slightly (dark + light variants) for a cleaner modern-electric finish without reverting to high-gloss glow.
- Why: User requested testing a brighter top-highlight direction while retaining a finished, professional navy wordmark.
- Rollback: this branch/PR (`codex/ithelp-modern-electric-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP premium-dark navy variant
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Shifted IT/HELP logo ramp to deeper navy-cobalt values and reduced gloss intensity in contour/depth shadows (dark and light theme variants) to produce a calmer, more finished premium-dark wordmark.
- Why: User requested a less shiny, deeper navy treatment to improve perceived refinement of the primary logo text.
- Rollback: this branch/PR (`codex/ithelp-premium-dark-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: IT/HELP wordmark refinement (crisper contour + cobalt ramp)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Tightened IT/HELP letter contour/depth shadows for cleaner edge definition and shifted logo blues to a richer cobalt ramp (dark and light theme variants) while keeping the red plus and `san diego` treatment unchanged.
- Why: Improve perceived polish and reduce the slightly gray/soft impression in the primary brand wordmark.
- Rollback: this branch/PR (`codex/ithelp-wordmark-refine-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: In-content gold CTA depth/geometry refinement
- Files:
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Rebuilt `.cta-button` styling to a modern gold relief treatment with stronger geometry (balanced height, medium radius), improved depth via layered shadows/gradient, and explicit hover/focus/active states for clearer affordance while keeping the gold role distinct from blue Schedule controls.
- Why: Align the "Book an On-Site Visit" button’s visual quality and interaction clarity with the hero control language without changing the color-role system.
- Rollback: this branch/PR (`codex/cta-button-depth-v1`).

### 2026-02-09
- Actor: AI+Developer
- Scope: San Diego-to-tagline clearance refinement
- Files:
  - `static/css/late-overrides.css`
- Change: Increased hero tagline top spacing on desktop and mobile so the `san diego` descenders hold a clearer visual gap above the pill border while preserving existing lockup centering and hierarchy.
- Why: Continue vertical rhythm tuning from PR `#463` so spacing reads cleanly in real desktop and iPhone renderings.
- Rollback: this branch/PR (`codex/san-diego-descender-clearance-v1`, PR `#463`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego optical center correction (left shift)
- Files:
  - `static/css/late-overrides.css`
- Change: Shifted `san diego` slightly left at desktop and mobile breakpoints to better align with the composite `IT+HELP` glyph mass.
- Why: Screenshot review showed lockup still reading off-center even after spacing/size corrections.
- Rollback: this branch/PR (`codex/san-diego-optical-center-v3`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego vertical overshoot correction
- Files:
  - `static/css/late-overrides.css`
- Change: Reduced the prior upward shift of `san diego` to restore breathing room under `IT+HELP` while keeping the lockup tighter than the earlier baseline.
- Why: Screenshot review showed the previous pass pushed `san diego` too close to the main mark.
- Rollback: this branch/PR (`codex/san-diego-lockup-align-v2`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego lockup alignment correction (visible pass)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Made a stronger lockup adjustment by raising `san diego` closer to `IT+HELP`, reducing luminance/glow further, rebalancing desktop/mobile size ratio, and adding a slight optical center nudge for better alignment under the composite mark.
- Why: User feedback indicated previous adjustments were too subtle and still looked misaligned across desktop/mobile.
- Rollback: this branch/PR (`codex/san-diego-lockup-align-v2`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego hierarchy correction (subdued under primary mark)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Reduced `san diego` brightness/glow and lowered visual weight so it stays legible but clearly subordinate to `IT+HELP`.
- Why: User feedback showed `san diego` was reading too close to white and visually competing with the main brand text.
- Rollback: this branch/PR (`codex/plus-jiggle-logo-depth-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego lockup proportional consistency + tighter vertical relationship
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Raised `san diego` closer to `IT+HELP` and adjusted its desktop/mobile sizing so both breakpoints read as the same proportional lockup.
- Why: Remove remaining mismatch in logo representation between desktop and mobile while keeping clean hero spacing.
- Rollback: this branch/PR (`codex/plus-jiggle-logo-depth-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero pill edge cleanup + Schedule CTA depth/geometry refinement
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Removed inset-ring pill treatment in favor of a true gold border + cool translucent navy fill to eliminate inner-gap/tilt artifacts on mobile and desktop. Deepened and compacted the Schedule CTA so it reads more professional while keeping touch-target-safe nav geometry.
- Why: Improve perceived polish and readability under real iPhone rendering while keeping the control row cohesive and less visually airy.
- Rollback: this branch/PR (`codex/nav-row-schedule-depth-v6`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Plus micro-motion visibility + San Diego lockup consistency pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Increased plus micro-jitter visibility slightly (still subtle), sharpened plus edge definition, and tuned `san diego` to a steel-blue gray with tighter spacing and proportional sizing for closer desktop/mobile representation consistency.
- Why: Preserve calm polish while making the brand mark feel intentionally alive and visually consistent across devices.
- Rollback: this branch/PR (`codex/plus-jiggle-logo-depth-v1`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT+HELP color-system discipline
- Files:
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `sass/_custom.scss`
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Shifted to a cooler, restrained palette; reduced yellow drift; formalized token usage and guidance.
- Why: Increase premium/security-grade perception while preserving accessibility and Lighthouse posture.
- Rollback: PR `#421`, commit `b669dad`.

### 2026-02-07
- Actor: AI+Developer
- Scope: Hero logo edge tuning (IT/HELP)
- Files:
  - `static/css/late-overrides.css`
- Change: Reduced gold edge intensity/sheen on `IT` and `HELP` outlines by ~15-20% while preserving shape and legibility.
- Why: Keep dimensional readability for older eyes while lowering visual noise.
- Rollback: commit `7c51a15` (standalone branch/PR for targeted revert).

### 2026-02-07
- Actor: AI+Developer
- Scope: Cross-agent instruction visibility and handoff hygiene
- Files:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.cursorrules`
  - `.github/copilot-instructions.md`
  - `replit.md`
  - `README.md`
  - `STYLE_GUIDE.md`
- Change: Added canonical AI-agent instructions and pointers used by multiple tooling ecosystems; linked style/evolution docs for mandatory pre-read.
- Why: Ensure any AI agent touching the repo sees the same guardrails and records changes consistently.
- Rollback: this branch/PR (separate from base palette PR).

### 2026-02-07
- Actor: AI+Developer
- Scope: Explicit engineering philosophy and quality-gate enforcement
- Files:
  - `AGENTS.md`
  - `replit.md`
  - `STYLE_GUIDE.md`
- Change: Added non-negotiable quality philosophy and measurable acceptance gates (Lighthouse, Observatory, security, accessibility, performance, trust/psychology), with explicit "symbiotic best-practices" guidance across all systems.
- Why: Make standards explicit for all AI/dev contributors and prevent "fix later" development drift.
- Rollback: this branch/PR (separate from base palette PR).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP logo-edge micro-tune (post-merge refinement)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Applied a small follow-up reduction (about 8-10% from the previous tuned state) to IT/HELP edge and sheen alpha values while preserving thickness/geometry for readability.
- Why: Keep dimensional clarity for older eyes while reducing remaining visual shine/noise.
- Rollback: this branch/PR (`codex/ithelp-logo-edge-micro-tune`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Indigo blue token shift (no glow/glass pivot)
- Files:
  - `static/css/late-overrides.css`
  - `sass/_extra.scss`
  - `sass/css/abridge.scss`
  - `STYLE_GUIDE.md`
- Change: Shifted primary blue/link tokens from cyan-leaning web blue to a deeper indigo-leaning blue system for higher perceived depth and modernity, without adding glow effects or changing logo geometry.
- Why: Reduce "legacy/web-default blue" feel while preserving trust posture and readability.
- Rollback: this branch/PR (`codex/ithelp-indigo-blue-shift`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP and Schedule blue depth pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Kept the existing primary blue token but introduced a tonal indigo ramp on the IT/HELP letter fill and Schedule button, added subtle dimensional button treatment, and replaced cyan-leaning micro highlights with indigo-leaning highlights.
- Why: Remove remaining flat/"Windows 95" blue impression while preserving accessibility, performance, and calm authority.
- Rollback: this branch/PR (`codex/ithelp-blue-depth-pass`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP + Schedule color consistency refinement
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Split logo and Schedule into dedicated indigo depth ramps, reduced muddy/gray cast in IT/HELP lettering by tuning shadow/overlay balance, and removed logo gleam animation on the base letterforms for steadier type color.
- Why: Improve perceived quality and type-consistent blue identity while preserving trust posture and technical score gates.
- Rollback: this branch/PR (`codex/ithelp-logo-color-consistency-v2`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP logo de-silver correction
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Increased logo indigo saturation and reduced cool overlay intensity so IT/HELP letters read as blue (not silver/steel), while preserving gold edge and plus-sign treatment.
- Why: Match intended brand blue expression and improve perceived type consistency against the Schedule CTA.
- Rollback: this branch/PR (`codex/ithelp-logo-blue-de-silver`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP + Schedule hard blue alignment
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Aligned IT/HELP logo ramp directly to the Schedule button ramp and reduced cool overlay/shadow wash that desaturated the logo letters.
- Why: Deliver clear, unmistakable blue identity with immediate color parity between logo and Schedule CTA.
- Rollback: this branch/PR (`codex/ithelp-logo-button-blue-unify`).

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP clean typography pass
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Replaced multi-layer pseudo-text rendering on IT/HELP with single-layer letter rendering, retained indigo ramp fill, and kept restrained gold edge via stroke/shadow to remove ghosting/double-glyph artifacts.
- Why: Improve professional finish and color clarity while preventing visual duplication artifacts in real-world browsers/screenshots.
- Rollback: this branch/PR (`codex/ithelp-logo-clean-typography`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Safari glyph artifact fix + DNS Tool heading hierarchy cleanup
- Files:
  - `static/css/late-overrides.css`
  - `content/dns-tool.md`
  - `STYLE_GUIDE.md`
- Change: Replaced stroke-based logo edge with shadow-based edge treatment to prevent Safari glyph artifacts (notably on `P`), and removed the in-content top-level DNS Tool heading so the template `h1` is the single visible page title.
- Why: Improve rendering reliability and keep SEO/semantic heading structure clean with one `h1` per page.
- Rollback: this branch/PR (`codex/ithelp-logo-p-artifact-fix`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Blue-led cohesion refinement for IT/HELP logo
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Reduced gold edge-shadow intensity on IT/HELP lettering and increased subtle blue edge support so the logo reads clearly blue while retaining a restrained gold trim.
- Why: Improve color cohesion with the Schedule CTA and preserve a cleaner, more professional blue-first visual system.
- Rollback: this branch/PR (`codex/ithelp-color-cohesion-blue-led`).
- Gold fallback reference: `main@a3b9ea2` (PR `#430`) preserves the current gold-forward logo treatment if we decide to revert to that direction.

### 2026-02-07
- Actor: AI+Developer
- Scope: IT/HELP hard blue unification + heading semantics cleanup
- Files:
  - `static/css/late-overrides.css`
  - `templates/partials/hero_logo.html`
  - `STYLE_GUIDE.md`
- Change: Shifted logo and Schedule to the same stronger indigo ramp, removed `background-clip:text` logo rendering to eliminate Safari glyph artifacts, tuned logo depth shadows to stay blue-led, and changed the decorative hero logo wrapper from `h1` to a non-heading element so content pages keep one primary heading.
- Why: Deliver clear logo/button color cohesion, prevent `P`/glyph rendering artifacts, and keep SEO/accessibility heading structure cleaner.
- Rollback: this branch/PR (`codex/ithelp-blue-unify-v3`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Sonar accessibility cleanup for decorative hero mark
- Files:
  - `templates/partials/hero_logo.html`
- Change: Removed `role="img"` usage on the hero logo wrapper and marked the logo/location cluster as decorative with `aria-hidden="true"`.
- Why: Clear Sonar rule violation and keep semantic accessibility output clean.
- Rollback: this branch/PR (`codex/ithelp-blue-unify-v3`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Link-palette indigo cohesion pass (logo/button/link alignment)
- Files:
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Shifted dark/light link tokens to the same indigo hue family used by IT/HELP and Schedule, and updated phone-link override to follow shared link tokens instead of a separate cyan-leaning blue.
- Why: Remove color mismatch between logo/button and in-content links while keeping contrast-safe per-theme brightness.
- Rollback: this branch/PR (`codex/ithelp-link-blue-cohesion-v1`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Premium-electric indigo refresh + plus vertical centering
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Shifted the shared blue system to a richer electric-indigo ramp for logo/Schedule/links and moved `.logo-plus` up (`top: -0.055em`) for better vertical optical centering between `IT` and `HELP`.
- Why: Keep full color cohesion while removing the “boring/default blue” feel and tightening logo geometry.
- Rollback: this branch/PR (`codex/ithelp-premium-indigo-plus-align`).

### 2026-02-07
- Actor: AI+Developer
- Scope: Cobalt-indigo high-chroma depth pass
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Moved the shared blue system to a stronger cobalt-indigo palette, increased top/bottom depth contrast in IT/HELP lettering shadows, and boosted Schedule CTA gradient contrast while keeping all links in the same hue family.
- Why: Address remaining “boring/default blue” perception without introducing glow-heavy effects or breaking cohesion.
- Rollback: this branch/PR (`codex/ithelp-cobalt-indigo-v2`).

### 2026-02-07
- Actor: AI+Developer
- Scope: De-purple to clean cobalt-blue pass
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Reduced purple hue bias across shared blue tokens, shifted logo/button/link palette to a cleaner cobalt-blue family, and retuned logo shadow tint channels to cool-blue values.
- Why: Correct user-reported purple cast while preserving cohesion and depth.
- Rollback: this branch/PR (`codex/ithelp-cobalt-no-purple`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Ice-cobalt energy pass
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Shifted shared blue tokens to a crisper ice-cobalt family, increased blue energy in logo/CTA gradients, and aligned link tokens to the same hue family with contrast-safe light-mode values.
- Why: Keep cohesive control while pushing toward a more exciting, less “generic” blue impression.
- Rollback: this branch/PR (`codex/ithelp-ice-cobalt-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Role-based blue depth pass (authority logo + action CTA/links)
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Introduced a role-based blue system within one hue family: deeper logo ramp for authority, brighter Schedule/link ramp for action clarity, and matching shadow/border tuning for cleaner depth.
- Why: Preserve full color cohesion while reducing “flat/boring default blue” perception and keeping trust-oriented visual psychology.
- Rollback: this branch/PR (`codex/ithelp-role-based-blue-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Signal-cobalt signature pass (higher energy, no purple cast)
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Shifted shared blue tokens to a brighter signal-cobalt family, increased logo letter depth via highlight/shadow tuning, and aligned Schedule + link ramps to the same hue family with stronger action contrast.
- Why: Keep cohesion while pushing the palette away from “boring/default blue” toward a cleaner premium look.
- Rollback: this branch/PR (`codex/ithelp-blue-signature-v5`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Royal-cobalt depth pass (bigger visible shift)
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Darkened and saturated the shared blue family to a royal-cobalt profile, deepened logo letter shadows for stronger dimensionality, and retuned Schedule/link blues to remain cohesive while reading less “default sky blue.”
- Why: Address user feedback that prior changes looked too subtle and still felt visually generic.
- Rollback: this branch/PR (`codex/ithelp-blue-royal-cobalt-v6`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Electric-cobalt dimensional pass (non-subtle)
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Switched IT/HELP letters from flat fill to a 3-stop electric-cobalt gradient fill, boosted schedule/button contrast in the same family, and retuned link blues for full-page cohesion.
- Why: Prior passes were perceived as too subtle/boring; this pass is intentionally obvious while staying performant and accessibility-safe.
- Rollback: this branch/PR (`codex/ithelp-logo-dimension-v7`).

### 2026-02-08
- Actor: AI+Developer
- Scope: DNS-aligned true blue + deep navy background pass
- Files:
  - `static/css/late-overrides.css`
  - `sass/css/abridge.scss`
  - `sass/_extra.scss`
  - `STYLE_GUIDE.md`
- Change: Anchored IT/HELP + Schedule + links to DNS Tool’s non-purple blue family (`#58A6FF` anchor), and shifted site dark surfaces from flat black to deep navy-charcoal (`#0D1117` / `#161B22`) for cleaner contrast and less muddiness.
- Why: User requested a non-purple blue outcome and approved background changes if needed to reach a polished final look.
- Rollback: this branch/PR (`codex/ithelp-true-blue-v8`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Darken Schedule CTA on navy background
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Darkened Schedule button gradient, border, and glow/shadow intensity to fit the new deep navy surface while preserving high-contrast text and hover affordance.
- Why: User reported the Schedule button still looked too light against the darker page and wanted a darker, more polished CTA.
- Rollback: this branch/PR (`codex/ithelp-schedule-darken-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero panel translucency + icon parity + darker IT/HELP blue + vertical rhythm tune
- Files:
  - `static/css/late-overrides.css`
  - `templates/base.html`
  - `STYLE_GUIDE.md`
- Change: Darkened the IT/HELP logo blue ramp one step, made the hero “We solve tech problems” inner panel subtly translucent in dark mode (while preserving high contrast), increased home icon visual size/stroke to better match the sun glyph in the nav control row, and applied a micro-compression to hero spacing (logo block up slightly, `san diego` closer/centered under the mark, tagline/nav stack nudged upward).
- Why: User requested tighter icon parity, improved hero panel depth integration with the moving background, a less “light/boring” IT/HELP blue, and better vertical balance without losing premium whitespace.
- Rollback: this branch/PR (`codex/hero-panel-and-icon-balance-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero readability/breathing correction pass on PR #445
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Removed blur-prone treatment from the hero tagline panel, increased true dark-mode translucency so constellation particles read through cleanly, removed glow blur from tagline highlight words for sharper legibility, restored breathing space between tagline pill and nav row, and increased mobile `san diego` size/placement for better logo ratio.
- Why: User reported muddy/brown panel tone, blurred highlight words, cramped pill-to-nav spacing, and undersized mobile `san diego`.
- Rollback: this branch/PR (`codex/hero-panel-and-icon-balance-v1`), commit `58147f3` as immediate pre-fix reference.

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero control-row geometry + icon modernization
- Files:
  - `templates/base.html`
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Rebuilt the nav pill layout as fixed CSS slots (home/more/schedule/mode) so icon spacing is deterministic without manual text spaces, moved `More` + chevron into the same blue family as Schedule, added a deeper nav-shell treatment, and replaced the old filled home glyph with a cleaner outline house icon.
- Why: User reported spacing fragility and requested a tighter, more modern control row while preserving dark-mode polish and mobile tap ergonomics.
- Rollback: this branch/PR (`codex/nav-grid-modern-icon-blue-more`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero pill surface cleanup v4 (stroke ring + flat navy interior)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Replaced the gold fill-band ring with a strict 2px gold stroke, removed hover glow/bevel artifacts, and converted the interior from beveled gradient to a flatter translucent navy surface to reduce dirty/tilted edge perception on mobile and desktop.
- Why: User reported the previous pass looked worse and still felt noisy/unclean, especially on iPhone.
- Rollback: this branch/PR (`codex/hero-pill-clean-surface-v4`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero pill seam removal + Schedule CTA depth polish v5
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Moved the hero pill to a single-surface shell model (outer wrapper owns border+translucent fill, inner text layer is transparent) to eliminate inner-gap/tilt artifacts on desktop/mobile; also deepened and restrained the Schedule CTA gradient, border, and relief so it reads more premium and less toy-like.
- Why: User reported a visible inner gap/outline in the pill and requested a more professional, deeper Schedule button finish.
- Rollback: this branch/PR (`codex/hero-pill-and-schedule-polish-v5`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero pill edge-cleanup pass (remove inner seam artifact)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Removed the inner blue border/inset highlight that created a white seam on iPhone, switched to a cleaner single-surface navy translucent interior, and tightened the gold perimeter into a solid clean ring.
- Why: User reported the hero pill still looked dirty on mobile and not solid on desktop.
- Rollback: this branch/PR (`codex/hero-pill-clean-edges-v3`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero pill v2 anti-mud pass (true gold stroke + cooler translucency)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Converted hero pill perimeter to an explicit 2px gold border stroke and retuned the interior to a cooler, lighter navy-blue translucent gradient with reduced warm influence, preserving text crispness and particle visibility.
- Why: User reported the previous pill still read muddy/brown on iPhone and requested a clearer blue-translucent interior with a solid gold line.
- Rollback: this branch/PR (`codex/hero-pill-cool-blue-v2`).

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero tagline pill de-muddy pass (blue translucency + crisp gold perimeter)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Kept the hero pill gold frame but made it crisper and more stable, then shifted the dark-mode pill interior from warm/muddy tint to a cool navy-blue translucent gradient so constellation/particle motion remains visible while text contrast stays strong.
- Why: User reported brown/muddy pill fill and requested a blue-toned transparent interior with clear background-motion visibility, especially on mobile.
- Rollback: this branch/PR (`codex/hero-pill-blue-translucency-v1`).

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego lockup de-compression and hierarchy correction
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
- Change: Lowered `san diego` placement on desktop/mobile to remove the scrunched look under `IT+HELP`, and reduced its luminance/glow so it stays visibly subordinate to the primary logo text.
- Why: User feedback showed the lockup was over-tight and `san diego` was popping too close to body-white levels.
- Rollback: this branch/PR (`codex/san-diego-optical-center-v3`), commit `02ef35b` as pre-adjust reference.

### 2026-02-08
- Actor: AI+Developer
- Scope: Stronger vertical drop + stronger tonal separation for `san diego`
- Files:
  - `static/css/late-overrides.css`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Dropped `san diego` further away from `IT+HELP` on desktop and mobile (`margin-top` relaxed by ~5-6px) and darkened/desaturated the label/shadow so it no longer reads as the same visual tier as the primary mark.
- Why: User confirmed the lockup still looked too tight and that `san diego` remained too close to the IT/HELP color family.
- Rollback: this branch/PR (`codex/san-diego-drop-and-separate-v1`), previous baseline commit `8ceadfa`.

### 2026-02-08
- Actor: AI+Developer
- Scope: Cross-breakpoint centering parity + steel-gray `san diego` tone
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Unified desktop/mobile `san diego` horizontal nudge and vertical offset to the same lockup logic, then shifted `san diego` to a clearer steel gray-blue tone with softer shadow so it reads as a secondary line rather than the same brand-blue tier as `IT+HELP`.
- Why: User requested matching centering behavior across desktop/mobile and clearer color separation from the IT/HELP logo fill.
- Rollback: this branch/PR (`codex/san-diego-center-and-steel-v2`), baseline commit `bbdd35d`.

### 2026-02-08
- Actor: AI+Developer
- Scope: San Diego micro-drop spacing refinement
- Files:
  - `static/css/late-overrides.css`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Lowered `san diego` by an additional 2px on desktop and mobile (`margin-top: -11px -> -9px`) to add breathing room above the tagline pill while preserving centering and hierarchy tuning from the previous pass.
- Why: User confirmed overall direction but requested a small additional downward move because the logo lockup still felt slightly tight.
- Rollback: this branch/PR (`codex/san-diego-micro-drop-v1`), baseline commit `0aa7dac`.

### 2026-02-08
- Actor: AI+Developer
- Scope: Hero stack rhythm rebalance (logo block -> tagline pill -> nav pill)
- Files:
  - `static/css/late-overrides.css`
  - `STYLE_GUIDE.md`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Lowered `san diego` another step (`margin-top: -9px -> -6px` desktop/mobile), increased logo-to-tagline spacing (`.tagline margin-top` desktop/mobile), and increased tagline-to-nav separation (`.nav-wrapper margin-top`) so the lockup reads as three clean tiers without descender collisions.
- Why: User reported the `g` descender in `san diego` still touching/crowding the gold tagline pill and requested full top-down spacing normalization.
- Rollback: this branch/PR (`codex/hero-stack-spacing-v1`), baseline commit `5901cf7`.

### 2026-02-08
- Actor: AI+Developer
- Scope: Descender clearance micro-pass (`san diego` to tagline pill)
- Files:
  - `static/css/late-overrides.css`
  - `PROJECT_EVOLUTION_LOG.md`
- Change: Increased only the `san diego` -> tagline spacing (`.tagline margin-top` +3px on desktop and mobile) to remove remaining visual collision with the `g` descender while leaving color, centering, and nav geometry untouched.
- Why: User confirmed direction but still observed the descender appearing too close to the gold tagline border.
- Rollback: this branch/PR (`codex/san-diego-descender-clearance-v1`), baseline commit `b3d6c4c`.
