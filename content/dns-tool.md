---
title: DNS Tool - DNS & Email Security Auditor
description: "Professional DNS and email security auditor for SPF, DKIM, DMARC, DNSSEC, MTA-STS, TLS-RPT, SMTP transport checks, CAA, BIMI, and CT reporting."
path: dns-tool
extra:
  seo_title: "DNS & Email Security Auditor"
  skip_image: true
  skip_author: true
---

DNS Tool is a **professional-grade DNS, email, transport, and brand security auditor** designed to answer one question clearly: *can this domain be trusted on the internet today?*

It analyzes real-world behavior, not just static records, and presents results in a single defensible report.

👉 <a href="https://dnstool.it-help.tech/" target="_blank" rel="noopener noreferrer" class="gold-link">dnstool.it-help.tech</a>

This is the authoritative version of the tool. It prioritizes clarity, correctness, and defensible conclusions over raw record dumps.

## What This Tool Actually Solves

Most DNS tools dump raw records and expect you to "interpret" them. That's how people end up thinking they're secure when they're not.

DNS Tool answers the _real_ questions:

- **Can this domain be impersonated by email?**
- **Can this brand be convincingly faked?**
- **Is email encrypted and validated in transit?**
- **Can DNS itself be tampered with?**
- **Are security controls enforced, or just declared?**
- **Is what the world sees the same as what the nameserver is publishing?**

It distinguishes _configured_ vs _enforced_, _unsigned_ vs _broken_, and _missing_ vs _intentionally absent_. That nuance is where most tools fail.

## 11 Core Analysis Modules (One Pass)

1. SPF validation (including lookup counts and strict vs soft fail guidance)
2. DKIM discovery across **35 selectors** with provider-aware logic
3. DMARC policy interpretation (`none`, `quarantine`, `reject`) plus **DMARCbis readiness checks**
4. DANE/TLSA validation for SMTP certificate pinning (RFC 7672)
5. MTA-STS policy retrieval and enforcement validation
6. TLS-RPT configuration and reporting endpoint checks
7. **SMTP Transport Verification** - live MX STARTTLS/TLS tests (versions, ciphers, cert validity) with DNS-inferred fallback when live port 25 probing is unavailable
8. DNSSEC chain-of-trust validation (root -> TLD -> domain)
9. CAA analysis with CA attribution and **MPIC-aware interpretation** (CA/B Forum SC-067)
10. BIMI + VMC validation for brand trust in inboxes
11. **Certificate Transparency subdomain discovery** (crt.sh / RFC 6962) for external attack-surface visibility

The output is a **single, defensible report** - not a pile of green and red checkboxes.

## Additional Domain Intelligence

- NS delegation correctness
- Resolver vs authoritative record diffing (propagation and split-brain detection)
- DNS infrastructure analysis for enterprise providers and self-hosted enterprise DNS
- Government entity recognition for .gov, .mil, .gov.uk, .gov.au, and .gc.ca domains
- A / AAAA / MX routing plus SRV record visibility for service inventory context

## DNS Infrastructure Intelligence

DNS Tool doesn't just check if DNSSEC is enabled—it understands **real-world security postures**:

- **Enterprise DNS Providers** — Cloudflare, AWS Route 53, Akamai, Google Cloud DNS, Azure DNS, UltraDNS, Verisign, NS1
- **Self-Hosted Enterprise** — Apple, Microsoft, Meta, Amazon, Netflix, Oracle, Cisco, Intel, Salesforce, Adobe
- **Government Entities** — .gov (FISMA), .mil (DoD), .gov.uk (NCSC), .gov.au (ASD), .gc.ca (GC)

When DNSSEC isn't enabled, the tool explains *why that might be acceptable*—enterprise providers with DDoS protection, Anycast, and CAA records provide alternative security layers. This is the "symbiotic security" approach: work with the ecosystem, not against it.

## Platform Features (Web App)

- Analysis history with search
- Side-by-side domain comparison
- Statistics dashboard with protocol adoption rates
- JSON export for programmatic use
- Executive-grade print/PDF reports with **TLP:CLEAR** classification

## Why This Version Is Better Than the CLI

The original command-line tool still exists and is useful for scripting and offline checks, but the **web version is the authoritative one**:

- Clear verdicts instead of raw dumps
- Policy-aware logic (no misleading "monitoring-only" false confidence)
- Real-time propagation comparison
- Transport security validation in addition to DNS-only checks
- Printable, shareable reports suitable for audits, leadership, and client briefings

If you're evaluating DNS posture, this is the version you want.

## Need Help Fixing Issues?

The report tells you _what_ is wrong, but if you need help fixing it, we have a comprehensive guide:

👉 <a href="https://www.it-help.tech/blog/dns-security-best-practices/" target="_blank" rel="noopener noreferrer" class="gold-link"><strong>Read: DNS Security Best Practices (Step-by-Step Guide)</strong></a>

## Command-Line Version (Still Available)

The CLI tool is open-source and maintained for those who want it:

- <a href="https://github.com/careyjames/dns-tool/" target="_blank" rel="noopener noreferrer" class="gold-link">GitHub (Source & Docs)</a>
- <a href="https://github.com/careyjames/dns-tool/releases" target="_blank" rel="noopener noreferrer" class="gold-link">CLI Releases</a>

Think of it as a sharp pocket knife.

The web version is the full diagnostic bench.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DNS Tool - DNS & Email Security Auditor",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Web Browser",
  "url": "https://dnstool.it-help.tech/",
  "description": "Comprehensive DNS and email security auditor with 11 core analysis modules, including SMTP transport verification, DMARCbis readiness, MPIC-aware CAA analysis, and CT subdomain discovery. Includes history, comparison, JSON export, and executive print/PDF reports.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "11 core DNS and email security analysis modules",
    "SPF validation and policy guidance",
    "DKIM analysis across 35 selectors",
    "DMARC enforcement analysis with DMARCbis readiness checks",
    "DANE/TLSA validation for SMTP transport security",
    "MTA-STS and TLS-RPT policy validation",
    "Live SMTP transport verification with DNS-inferred fallback",
    "DNSSEC chain-of-trust validation",
    "Certificate Transparency subdomain discovery (RFC 6962)",
    "MPIC-aware CAA analysis (SC-067)",
    "Enterprise DNS provider detection (Cloudflare, AWS, Akamai, Google, Azure)",
    "Self-hosted enterprise DNS recognition (Apple, Microsoft, Meta, Amazon)",
    "Government entity detection (.gov, .mil, .gov.uk)",
    "BIMI and VMC certificate verification",
    "Analysis history with search, side-by-side comparisons, and statistics dashboard",
    "JSON export and executive-grade print/PDF reports (TLP:CLEAR)"
  ],
  "author": {
    "@type": "Organization",
    "name": "IT Help San Diego Inc.",
    "url": "https://www.it-help.tech/",
    "telephone": "+1-619-853-5008"
  }
}
</script>
