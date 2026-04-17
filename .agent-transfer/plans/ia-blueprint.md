# Information Architecture Blueprint

## Mission

Transform www.it-help.tech from a single-page brochure with "atrocious, hacked-together" navigation into a small, sharp, scientifically-credible consulting site that:
- Looks like a billion-dollar think tank (matches dns-tool aesthetic)
- Books high-value local clients (San Diego County: La Jolla, Del Mar, greater SD)
- Demonstrates research depth via the dns-tool platform (proof of expertise)
- Maintains anti-managed-services positioning while offering the new $50/device agent
- Stays small (≤10 pages) — corp site should be lean, not bloated

---

## Current pages (Zola `content/`)

```
_index.md           — homepage
about.md            — company / origin
billing.md          — pricing
brand-colors.md     — internal/dev reference
dns-tool.md         — link-out / explainer
security-policy.md  — security posture
services.md         — services list
blog/               — field-notes / case studies
```

This is a fine starting set. Recommend keeping all of these and adding 1-2.

---

## Proposed nav (top-bar)

**Top-bar (left → right):**
1. **Logo** (IT/HELP + red plus + "san diego") → `/`
2. **Services** → `/services`
3. **About** → `/about`
4. **Field Notes** → `/blog` (rename from "Blog")
5. **DNS Tool** → `https://dns.it-help.tech` (external, with `↗` glyph)
6. **Schedule** → `https://schedule.it-help.tech` (external, primary CTA button styled)

**Right-aligned utility:**
- Phone link `(619) 853-5008` (visible on desktop, collapses to icon on mobile)

**Mobile (≤ 768px):**
- Hamburger → slide-down panel with the same 5 nav items + phone CTA

**Removed from nav (link-only from footer/body):**
- Pricing/Billing → footer "Trust" cell + linked from /services
- Security Policy → footer "Trust" cell
- Brand Colors → footer "Trust" cell (internal reference, low traffic)

---

## Proposed page hierarchy

```
/                          Hero (math anim) + value prop + 3-card service teaser + CTA
├─ /services               Detailed service pillars with anchored sections:
│  ├─ #mac                 macOS & iOS Support
│  ├─ #wifi                Wi-Fi & Networking (luxury homes / estates)
│  ├─ #dns-email           DNS & Email Deliverability (SPF/DKIM/DMARC)
│  ├─ #cybersecurity       Cybersecurity & Ethical Screen Sharing
│  ├─ #data-extraction     Forensic Data Extraction (Email/iPhone for law firms)
│  └─ #managed-agent       NEW: $50/device managed agent option
├─ /about                  Origin story, philosophy, 25+ years, no-retainer ethos
├─ /blog                   Field notes / case studies (existing blog/)
│  └─ /blog/{slug}
├─ /security-policy        Security & privacy posture (existing)
├─ /billing                Pricing & engagement model (existing)
└─ /brand-colors           Internal dev reference (existing, no nav link)
```

**External (link-out, NOT in Zola):**
- `dns.it-help.tech` — the dns-tool platform itself
- `schedule.it-help.tech` — Square Online booking

---

## Homepage structure

1. **Hero** — full-viewport
   - IT+HELP logo (existing, preserved)
   - Math animation (`public/js/hero-logo.js`, preserved as-is)
   - Tagline: "We solve tech problems. No monthly retainers." (existing — KEEP)
   - Sub-tagline (NEW): _"Apple-centric IT, deep-research diagnostics, San Diego concierge."_
   - Primary CTA: "Book an On-Site Visit" → schedule.it-help.tech
   - Secondary CTA: "See Our Research" → dns.it-help.tech

2. **3-card service teaser** (just below fold)
   - Mac & Apple Ecosystem
   - Wi-Fi & Network Engineering
   - Email Deliverability & DNS Forensics
   - Each card has: icon, 2-line summary, "Learn more →" → `/services#anchor`

3. **Trust signals strip**
   - "25+ years experience" / "High-profile clients in entertainment, legal, restaurant, medical" / "Federal A+ DNS posture"
   - Three small badges/cards, no logos (NDA respect)

4. **The Method** (think-tank positioning)
   - 1-paragraph explainer of the research-driven approach
   - Visual: small org-chart preview pointing to the dns-tool research platform
   - Link: "Read the field notes →" → `/blog`

5. **Local credibility**
   - La Jolla office address + map link
   - Service area summary
   - Phone CTA

6. **Footer org-tree** (the new ported component — see `footer-org/`)

---

## Tone & voice

- **Calm authority** (matches dns-tool "intelligence brief" tone)
- **No marketing-speak.** No "synergize," "leverage," "solutions provider."
- **Specific over generic.** "We rescue email from spam folders by fixing SPF/DKIM/DMARC alignment" >>> "We help with email."
- **Discretion language.** "Concierge," "discreet," "by appointment," "high-profile" — these are the right register for La Jolla / Del Mar wealth.
- **One scientific moment per page.** Sprinkle one technical detail per page (e.g., "We monitor your domains' SPF macro expansion against RFC 7208 §7.4") to signal depth without overwhelming.

---

## Copy refresh priorities

1. **Hero sub-tagline** — needs the "deep research" positioning the user wants (think: "Research IT in motion")
2. **About page** — emphasize 27 years, deep diagnostics, the dns-tool as proof
3. **Services managed-agent paragraph** — NEW. Frame as "ethical opt-in: agent runs on your device, you pay $50 per device, not a managed-services hostage situation"
4. **Footer copyright tagline** — borrow dns-tool's "We answer the BIG questions" cadence

---

## What stays exactly as-is

- IT/HELP + red plus + "san diego" logo composition
- Math homepage animation (`public/js/hero-logo.js`)
- Existing blog content
- Office address, phone, service-area copy
- Federal-grade CSP automation pipeline
- AWS S3 + CloudFront deploy

---

## What gets killed

- The current navigation pill row ("More / Pricing / Our Expertise / Blog / DNS Tool / Schedule") — replace with proper top-bar
- The old service-list block markup — replace with anchored section structure on `/services`
- Any inline `<script>` in templates (per CSP plan)
- The light/blue page background — site moves to dark mode (`--bg-primary: #0d1117`)
