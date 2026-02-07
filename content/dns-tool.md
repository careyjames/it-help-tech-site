---
title: DNS Tool - DNS & Email Security Auditor
description: "Comprehensive DNS intelligence and email security auditor. Analyzes SPF, DMARC, DKIM, DNSSEC, MTA-STS, TLS-RPT, BIMI, and CAA records. Detects enterprise DNS providers, government entities, and self-hosted infrastructure. Generates printable security posture reports for IT professionals and executives."
path: dns-tool
extra:
  skip_image: true
  skip_author: true
---

# DNS Tool - DNS & Email Security Auditor

DNS Tool is a **professional-grade DNS, email, and brand security auditor** designed to answer one question clearly: *can this domain be trusted on the internet today?*

It analyzes real-world DNS behavior, not just static records, and presents the results in a single, defensible report.

👉 <a href="https://dnstool.it-help.tech/" target="_blank" rel="noopener noreferrer" class="gold-link">dnstool.it-help.tech</a>

This is the authoritative version of the tool. It prioritizes clarity, correctness, and defensible conclusions over raw record dumps.

## What This Tool Actually Solves

Most DNS tools dump raw records and expect you to "interpret" them. That's how people end up thinking they're secure when they're not.

DNS Tool answers the _real_ questions:

- **Can this domain be impersonated by email?**
- **Can this brand be convincingly faked?**
- **Can DNS itself be tampered with?**
- **Are security controls enforced, or just declared?**
- **Is what the world sees the same as what the nameserver is publishing?**

It distinguishes _configured_ vs _enforced_, _unsigned_ vs _broken_, and _missing_ vs _intentionally absent_. That nuance is where most tools fail.

## What the Web Version Audits (In One Pass)

**DNS & Domain Security**

- NS delegation correctness
- DNSSEC chain-of-trust validation (root → TLD → domain)
- DNS Infrastructure Analysis — detects enterprise-grade providers (Cloudflare, AWS Route 53, Akamai, Google Cloud DNS, Azure, UltraDNS, Verisign, NS1) and self-hosted enterprise DNS (Apple, Microsoft, Meta, Amazon, Netflix, Oracle, Cisco, Salesforce)
- Government Entity Recognition — automatically identifies .gov, .mil, .gov.uk, .gov.au, and .gc.ca domains with compliance context (FISMA, DoD, NCSC)
- Resolver vs authoritative record diffing (propagation & split-brain detection)
- CAA parsing with authorized CA attribution

**Email Security**

- SPF validation (including lookup counts and strict vs soft fail)
- DMARC policy interpretation (`none` vs `quarantine` vs `reject`)
- DKIM discovery with hyperscaler-aware logic (no false alarms)
- MTA-STS policy retrieval and enforcement validation
- TLS-RPT configuration
- Email security & DMARC management provider identification (where visible in DNS)
- SMTP Transport Verification — checks MX server STARTTLS support, TLS version, cipher strength, and certificate validity

**Brand Security**

- BIMI detection with logo preview
- VMC certificate validation (Verified Mark Certificates from DigiCert, Entrust)
- Certificate issuance control (CAA)

**Traffic & Services**

- A / AAAA / MX routing
- SRV records (SIP, federation, CalDAV/CardDAV, etc.)—shown, not overreacted to

The output is a **single, defensible report**—not a pile of green and red checkboxes.

## DNS Infrastructure Intelligence

DNS Tool doesn't just check if DNSSEC is enabled—it understands **real-world security postures**:

- **Enterprise DNS Providers** — Cloudflare, AWS Route 53, Akamai, Google Cloud DNS, Azure DNS, UltraDNS, Verisign, NS1
- **Self-Hosted Enterprise** — Apple, Microsoft, Meta, Amazon, Netflix, Oracle, Cisco, Intel, Salesforce, Adobe
- **Government Entities** — .gov (FISMA), .mil (DoD), .gov.uk (NCSC), .gov.au (ASD), .gc.ca (GC)

When DNSSEC isn't enabled, the tool explains *why that might be acceptable*—enterprise providers with DDoS protection, Anycast, and CAA records provide alternative security layers. This is the "symbiotic security" approach: work with the ecosystem, not against it.

## Why This Version Is Better Than the CLI

The original command-line tool still exists and is useful for scripting and offline checks, but the **web version is the authoritative one**:

- Clear verdicts instead of raw dumps
- Policy-aware logic (no misleading "monitoring" nonsense)
- Real-time propagation comparison
- Printable, shareable reports suitable for audits and clients

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
  "description": "Comprehensive DNS intelligence and email security auditor. Analyzes SPF, DMARC, DKIM, DNSSEC, MTA-STS, TLS-RPT, BIMI, and CAA records. Detects enterprise DNS providers, government entities, and self-hosted infrastructure. Generates printable security posture reports for IT professionals and executives.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "SPF, DMARC, DKIM email security analysis",
    "DNSSEC chain-of-trust validation",
    "Enterprise DNS provider detection (Cloudflare, AWS, Akamai, Google, Azure)",
    "Self-hosted enterprise DNS recognition (Apple, Microsoft, Meta, Amazon)",
    "Government entity detection (.gov, .mil, .gov.uk)",
    "MTA-STS and TLS-RPT policy validation",
    "Email security and DMARC management provider identification",
    "BIMI and VMC certificate verification",
    "CAA record parsing with CA attribution",
    "SMTP transport security verification",
    "Printable PDF security reports"
  ],
  "author": {
    "@type": "Organization",
    "name": "IT Help San Diego Inc.",
    "url": "https://www.it-help.tech/",
    "telephone": "+1-619-853-5008"
  }
}
</script>
