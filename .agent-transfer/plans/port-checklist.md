# Port Checklist — Sub-Agent Worklist

5 specialized roles. Each opens its own PR. PRs are sequenced by dependency, not time.

---

## Sub-agent 1: Information Architecture & Content
**Goal:** lock the structure before any pixels move.

**Deliverables:**
- [ ] Updated `content/_index.md` with the new homepage section structure (per `ia-blueprint.md`)
- [ ] Updated `content/services.md` with the 6 anchored sections (mac, wifi, dns-email, cybersecurity, data-extraction, managed-agent)
- [ ] New copy for hero sub-tagline + "The Method" block + managed-agent paragraph
- [ ] `STYLE_GUIDE.md` updated with new tone-of-voice rules
- [ ] `PROJECT_EVOLUTION_LOG.md` entry

**Acceptance:**
- All copy reviewed against architect "calm authority, no marketing-speak" filter
- No new pages added beyond what `ia-blueprint.md` specifies
- No references to old removed pages

**Dependencies:** none. Goes first.

---

## Sub-agent 2: Design Token Adoption
**Goal:** make the corp-site theme consume `tokens.css` as single source of truth.

**Deliverables:**
- [ ] Drop `tokens/tokens.css` into `static/css/tokens.css`
- [ ] Drop `tokens/tokens.scss` into `sass/_tokens.scss` and `@use` from `_extra.scss`
- [ ] Audit `static/css/late-overrides.css` — replace every hardcoded color with `var(--*)`
- [ ] Audit `sass/css/abridge.scss` — same audit, replace hardcodes
- [ ] Audit `sass/_extra.scss` — same audit
- [ ] Move site to dark theme: ensure `body` consumes `--bg-primary` and `--text-primary`
- [ ] PRESERVE: `--brand-it-help-red` (red plus) and `--brand-it-help-blue` (IT/HELP outline) untouched
- [ ] `STYLE_GUIDE.md` token table refreshed

**Acceptance:**
- `grep -E "#[0-9a-fA-F]{3,6}" static/css/late-overrides.css sass/_extra.scss sass/css/abridge.scss` returns ZERO color hex literals (only `var()` / token references). **Token definition files (`static/css/tokens.css`, `sass/_tokens.scss`) are excluded from this scan — they are the SOT and MUST contain hex literals.**
- `zola build` passes
- Lighthouse contrast checks pass on `/`
- Red plus and IT/HELP outline visually unchanged
- **NEW: token-drift CI check.** Add `scripts/check-token-parity.sh` (or equivalent) that parses the `--*` custom properties out of `static/css/tokens.css` and the `$*` SCSS vars out of `sass/_tokens.scss`, asserts the (name → value) pairs match exactly. Wire into the same gate that runs `zola build` in CI. This is the corp-site analog of the dns-tool release-gate Gate 4b pattern. Drift fails the build.

**Dependencies:** none, runs in parallel with Sub-agent 1.

---

## Sub-agent 3: Zola Template Rebuild
**Goal:** rebuild templates to match the new IA + token system. Drop the wonky nav.

**Deliverables:**
- [ ] New `templates/base.html` with:
  - Native top-bar nav (5 items + phone, per `ia-blueprint.md`)
  - Mobile hamburger (CSS-only, no JS — use `<details>` or a checkbox-hack)
  - SVG sprite block at bottom of `<body>` with all icon symbols
  - Skip-link for a11y
- [ ] New `templates/index.html` with the 6-section homepage structure
- [ ] New `templates/services.html` with anchored sections
- [ ] Refactored `templates/page.html` (about, security-policy, billing, etc.)
- [ ] Drop in `footer-org/_footer-org.html` as `templates/partials/_footer-org.html`
- [ ] Drop in `footer-org/_footer-org.css` as `static/css/_footer-org.css`
- [ ] Old templates deleted, not "kept around just in case"

**Acceptance:**
- All pages render with `zola build` clean (no warnings)
- Math animation hero still works (`public/js/hero-logo.js` unmodified)
- Footer org-tree renders correctly on `/`, `/about`, `/services`, `/blog`
- All non-negotiables present: red plus, IT/HELP outline, math anim
- Lighthouse Performance ≥ 95 (CLS 0, no render-blocking)

**Dependencies:** Sub-agent 1 (IA) + Sub-agent 2 (tokens). Sequence after both merge.

---

## Sub-agent 4: CSP Hardening & CloudFront Policy
**Goal:** push Observatory 130 → ≥145 per `csp-tightening-plan.md`.

**Deliverables:**
- [ ] Audit every `<script>` in built `public/` HTML for inline content
- [ ] For each inline `<script>`: extract to `static/js/<name>.js`, add `defer` + SRI
- [ ] Audit every `<style>` in built HTML, externalize the one remaining inline
- [ ] Update `infra/cloudfront/generate_policy.py`:
  - Drop the 17 script-src hashes once externalization is complete
  - Drop the 1 style-src hash
  - Add COEP/COOP/CORP headers
- [ ] Update `infra/cloudfront/csp-policy-v1.json` accordingly
- [ ] Re-run on staging, verify Observatory rescan
- [ ] Document score delta in `PROJECT_EVOLUTION_LOG.md`

**Acceptance:**
- Observatory ≥ 145 on `https://www.it-help.tech/`
- Observatory ≥ 145 on at least 3 sub-pages
- No CSP violations in browser console on any page
- `script-src 'self'` and `style-src 'self'` (no hashes, no `'unsafe-*'`)
- CSP header response size < 500 bytes

**Dependencies:** Sub-agent 3 (templates) — must run AFTER templates are stable, or hash audit will be moving target.

---

## Sub-agent 5: Quality-Gate Verification (Lighthouse + a11y + cross-browser)
**Goal:** prove the whole thing meets the federal/Mozilla bar. Final gate before merging to `main`.

**Deliverables:**
- [ ] Lighthouse run on `/`, `/about`, `/services`, `/security-policy`, `/blog` — capture scores
- [ ] Mozilla Observatory rescan (post Sub-agent 4)
- [ ] axe-core a11y audit on every page
- [ ] Cross-browser smoke: Safari (macOS), Chrome, Firefox — visual + functional pass
- [ ] Mobile responsive smoke: iPhone-sized viewport for nav + footer + service grid
- [ ] CISA Cyber Hygiene-style external scan (the same checks the feds run weekly): TLS, DNS, SPF/DKIM/DMARC, CAA, MTA-STS — verify nothing regressed
- [ ] Update `PROJECT_EVOLUTION_LOG.md` with full scorecard
- [ ] Tag release `corp-site-redesign-v1.0.0`

**Acceptance:**
- Lighthouse 100/100/100/100 on all 5 audited pages (or written rationale per AGENTS.md if any score < 100)
- Observatory ≥ 145
- axe-core: 0 violations
- All non-negotiables visually verified
- CISA-style external scan: same posture as before redesign (no regression)

**Dependencies:** Sub-agents 1-4 complete and merged.

---

## Sequencing summary

```
   ┌─[1] IA & Content ─────────────┐
   │                                ├──► [3] Template Rebuild ──► [4] CSP Hardening ──► [5] QA Gate ──► main
   └─[2] Design Tokens ────────────┘
```

Sub-agents 1 and 2 in parallel. 3 needs both. 4 needs 3. 5 needs all.

---

## Cross-cutting rules (apply to every sub-agent)

- **Read AGENTS.md first.** Mandatory pre-read.
- **One PR per sub-agent.** No bundling across roles.
- **Every PR updates `PROJECT_EVOLUTION_LOG.md`** with date/actor/files/rationale/rollback ref.
- **Every PR runs `zola build` clean** before being opened.
- **Every PR preserves non-negotiables** explicitly — call them out in PR body and verify in screenshots.
- **No new dependencies** added without architect approval. The corp site is intentionally lean.
- **Architect review required** before merging Sub-agents 3, 4, and 5. Sub-agents 1 and 2 can self-merge after CI passes.
