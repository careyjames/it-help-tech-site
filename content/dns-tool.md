---
title: DNS Tool - DNS & Email Security Auditor
description: "Authoritative DNS, email, and domain security analysis. One report that tells you—clearly and correctly—whether a domain is actually secure."
path: dns-tool
extra:
  skip_image: true
  skip_author: true
---



DNS Tool is no longer just a command-line helper — it’s a **full, authoritative DNS and email security auditor** available directly on the web:

👉 <a href="https://dnstool.it-help.tech/" target="_blank" rel="noopener noreferrer">dnstool.it-help.tech</a>

This is the version I use now. It’s faster, clearer, and far more opinionated—in the right ways.

### What This Tool Actually Solves

Most DNS tools dump raw records and expect you to “interpret” them. That’s how people end up thinking they’re secure when they’re not.

DNS Tool answers the *real* questions:

* **Can this domain be impersonated by email?**
* **Can this brand be convincingly faked?**
* **Can DNS itself be tampered with?**
* **Are security controls enforced, or just declared?**
* **Is what the world sees the same as what the nameserver is publishing?**

It distinguishes *configured* vs *enforced*, *unsigned* vs *broken*, and *missing* vs *intentionally absent*. That nuance is where most tools fail.

### What the Web Version Audits (In One Pass)

**DNS & Domain Security**
* NS delegation correctness
* DNSSEC chain-of-trust validation (root → TLD → domain)
* Resolver vs authoritative record diffing (propagation & split-brain detection)
* CAA parsing with authorized CA attribution

**Email Security**
* SPF validation (including lookup counts and strict vs soft fail)
* DMARC policy interpretation (`none` vs `quarantine` vs `reject`)
* DKIM discovery with hyperscaler-aware logic (no false alarms)
* MTA-STS policy retrieval and enforcement validation
* TLS-RPT configuration

**Brand Security**
* BIMI detection
* VMC awareness (works without VMC, explains when it matters)
* Certificate issuance control (CAA)

**Traffic & Services**
* A / AAAA / MX routing
* SRV records (SIP, federation, CalDAV/CardDAV, etc.)—shown, not overreacted to

The output is a **single, defensible report**—not a pile of green and red checkboxes.

### Why This Version Is Better Than the CLI

The original command-line tool still exists and is useful for scripting and offline checks, but the **web version is the authoritative one**:

* Clear verdicts instead of raw dumps
* Policy-aware logic (no misleading “monitoring” nonsense)
* Real-time propagation comparison
* Printable, shareable reports suitable for audits and clients

If you’re evaluating DNS posture, this is the version you want.

### Command-Line Version (Still Available)

The CLI tool is open-source and maintained for those who want it:

* <a href="https://github.com/careyjames/dns-tool/" target="_blank" rel="noopener noreferrer">GitHub (Source & Docs)</a>
* <a href="https://github.com/careyjames/dns-tool/releases" target="_blank" rel="noopener noreferrer">CLI Releases</a>

Think of it as a sharp pocket knife.


The web version is the full diagnostic bench.

<!-- SEO: Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.it-help.tech/#organization",
      "name": "IT Help San Diego Inc.",
      "url": "https://www.it-help.tech/",
      "logo": "https://www.it-help.tech/images/logo.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://www.it-help.tech/#website",
      "url": "https://www.it-help.tech/",
      "name": "IT Help San Diego Inc.",
      "publisher": { "@id": "https://www.it-help.tech/#organization" }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.it-help.tech/dns-tool/#webpage",
      "url": "https://www.it-help.tech/dns-tool",
      "name": "DNS Tool - DNS & Email Security Auditor",
      "description": "Authoritative DNS, email, and domain security analysis. One report that tells you—clearly and correctly—whether a domain is actually secure.",
      "isPartOf": { "@id": "https://www.it-help.tech/#website" },
      "about": { "@id": "https://www.it-help.tech/dns-tool/#software" },
      "primaryImageOfPage": { "@type": "ImageObject", "url": "https://www.it-help.tech/images/og/dns-tool.png" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.it-help.tech/dns-tool/#software",
      "name": "DNS Tool",
      "applicationCategory": "SecurityApplication",
      "operatingSystem": "Web",
      "url": "https://dnstool.it-help.tech/",
      "description": "A web-based DNS and email security auditor that validates SPF, DKIM, DMARC, MTA-STS, TLS-RPT, DNSSEC, CAA, BIMI, and propagation by comparing resolver vs authoritative answers.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "publisher": { "@id": "https://www.it-help.tech/#organization" }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.it-help.tech/dns-tool/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does DNS Tool do?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DNS Tool produces a single, defensible report about a domain’s DNS and email security posture. It checks SPF, DKIM, DMARC, MTA-STS, TLS-RPT, DNSSEC, CAA, BIMI, and compares what public resolvers return versus what the authoritative nameservers publish."
          }
        },
        {
          "@type": "Question",
          "name": "How is this different from typical DNS checkers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most tools dump raw records. DNS Tool interprets policy and enforcement correctly (configured vs enforced, unsigned vs broken) and surfaces clear verdicts like whether the domain can be impersonated by email and whether DNS responses can be tampered with."
          }
        },
        {
          "@type": "Question",
          "name": "Does DNS Tool check DNS propagation and split-brain conditions?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. DNS Tool diffs resolver answers against authoritative answers to spot propagation delays, stale cache, and misconfigurations where different parts of the internet see different records."
          }
        },
        {
          "@type": "Question",
          "name": "Is there still a command-line version?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The CLI remains available on GitHub for scripting and offline checks, but the web version is the authoritative auditor."
          }
        },
        {
          "@type": "Question",
          "name": "Where can I run the web version?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Run the web version at dnstool.it-help.tech."
          }
        }
      ]
    }
  ]
}
</script>
