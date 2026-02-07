---
title: "DNS Security Best Practices: Defend Your Domain with DMARC, SPF & DKIM"
date: 2025-05-25
last_modified: 2026-02-06
author: Carey Balboa
categories: [DNS Security, Email Security]
tags: [DMARC, SPF, DKIM, DNSSEC, email deliverability, cybersecurity, BEC]
description: "Learn how to set up DMARC, SPF, & DKIM for robust DNS security. Protect your business email from spoofing, phishing, and BEC attacks with these best practices."
extra:
  image: /images/dns-security-dmarc.png
  og_title: "DNS Security Best Practices: Defend Your Domain with DMARC, SPF & DKIM"
  og_description: "Learn how to set up DMARC, SPF, & DKIM for robust DNS security. Protect your business email from spoofing, phishing, and BEC attacks with these best practices."
  twitter_title: "DNS Security Best Practices: Defend Your Domain with DMARC, SPF & DKIM"
  twitter_description: "Learn how to set up DMARC, SPF, & DKIM for robust DNS security. Protect your business email from spoofing, phishing, and BEC attacks with these best practices."
  canonical_url: "https://www.it-help.tech/blog/dns-security-best-practices/"
  og_image: /images/dns-security-dmarc-og.png
  twitter_image: /images/dns-security-dmarc-og.png
---

Looking to bolster your DNS Security with DMARC, SPF, and DKIM? This guide will show you how to set up DMARC to protect your business email system from spoofing and phishing attacks.
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "isAccessibleForFree": true,
  "headline": "DNS Security Best Practices: Defend Your Domain with DMARC, SPF & DKIM",
  "description": "Step-by-step setup guide for DMARC, SPF, DKIM, and DNSSEC to prevent spoofing and phishing.",
  "proficiencyLevel": "Intermediate",
  "author": { 
    "@type": "Person", 
    "name": "Carey Balboa",
    "url": "https://www.it-help.tech/about/"
  },
  "publisher": { 
    "@id": "https://www.it-help.tech/#business"
  },
  "image": "https://www.it-help.tech/images/dns-security-dmarc.png",
  "datePublished": "2025-05-25",
  "dateModified": "2026-02-06",
  "mainEntityOfPage": "https://www.it-help.tech/blog/dns-security-best-practices/",
  "keywords": ["DMARC", "SPF", "DKIM", "DNSSEC", "Email Security", "DNS Security", "BEC", "IT Help San Diego"]
}
</script>

## The Challenge: Ensuring DNS Security and Combating Email Vulnerabilities

Your Domain Name System (DNS) security protocols, such as DMARC (Domain-based Message Authentication, Reporting, and Conformance), SPF (Sender Policy Framework), and DKIM (DomainKeys Identified Mail), are crucial for safeguarding your business against email vulnerabilities.

## Why DNS Security Matters

Without proper DNS security and email authentication, your business is susceptible to email spoofing and phishing attacks. This could lead to unauthorized access to sensitive information, financial loss, and a tarnished domain reputation. Adequately configured DNS records not only secure email but also improve deliverability. Emails from properly authenticated domains are less likely to be marked as spam, thus improving overall deliverability rates.

## How to set up DMARC, SPF, and DKIM for Optimal DNS Security

DMARC, SPF, and DKIM offer a robust defense for your email system by authenticating the messages sent from your domain and providing a policy for handling messages that fail authentication. DMARC itself doesn’t “authenticate messages” but rather uses SPF/DKIM results to decide enforcement.

## Sample DMARC, SPF, and DKIM Records: Key Elements of DNS Security


Here is a DNS Tool record snip-it from a trusted source, CISA (Cybersecurity and Infrastructure Security Agency), the US cyber intelligence agency:

<img
  src="/images/cisa-dns.png"
  alt="DNS Tool record showing CISA DMARC, SPF, and DKIM enforcement"
  style="max-width: 600px; width: 100%; height: auto; margin: 0 auto; display: block;"
  loading="lazy"
  decoding="async">



Notice that their policy is set to reject 100% of unauthorized messages.

We participate as a stakeholder in CISA’s Cyber Hygiene program and have gained significant insight from their red team exercises, including how attackers approach DNS and email infrastructure in real-world environments.

## Common SPF Misconceptions

Contrary to some misunderstandings, the `-all` tag in an SPF record does not prevent internal users from sending or receiving email. Instead, it mandates that only explicitly authorized sources are allowed to send email on behalf of the domain. If a service is not listed in the SPF record, mail it sends claiming to be from your domain will fail SPF.

This is why third‑party services such as Mailchimp, Zendesk, CRMs, ticketing systems, and invoicing platforms must be explicitly allowed using `include:` mechanisms. Without those entries, their messages will fail SPF regardless of whether the mail itself is legitimate.

Where confusion arises is enforcement. SPF `-all` (hard fail) is often assumed to be “more secure,” but RFC 7489 §10.1 explicitly warns that hard fail can cause receiving servers to reject messages before DKIM is evaluated and before DMARC can make a policy decision.

This creates a failure mode where a message that fails SPF but would otherwise pass DMARC via DKIM alignment is rejected prematurely. In effect, SPF `-all` can short‑circuit DMARC, undermining the protocol designed to make final disposition decisions.

SPF was designed as an authorization signal, not a standalone enforcement mechanism. DMARC is the layer that evaluates SPF and DKIM together and applies policy (`p=none`, `quarantine`, or `reject`). Any configuration that prevents DMARC evaluation reduces overall security and breaks standards‑compliant mail flow.


## Modern Best Practice vs Legacy Guidance

For active sending domains, the strongest standards-compliant configuration is:

- SPF with `~all` (soft fail)
- DKIM properly deployed and aligned
- DMARC set to `p=reject`

This combination ensures that all authentication mechanisms are fully evaluated before a final decision is made. DMARC alignment, not raw SPF or DKIM pass/fail alone, is what ultimately determines message acceptance. SPF `~all` allows DKIM to run, and DMARC acts as the sole enforcement layer, as intended by the protocol design.

Some guidance, including older federal and enterprise deployments, historically favored SPF `-all` as a defense-in-depth measure. This was largely pragmatic: in 2017, when CISA Binding Operational Directive 18-01 was issued, most domains had not yet deployed DMARC, and SPF hard fail acted as a coarse enforcement mechanism.

Today, DMARC `p=reject` is widely deployed across federal and commercial domains, and DKIM is universally relied upon for message authentication. In this modern context, SPF `-all` becomes redundant and introduces the RFC 7489 §10.1 risk of premature rejection. Federal infrastructure often tolerates this due to tightly controlled sending paths, but that model does not generalize to commercial, multi-vendor, or cloud-based email environments.

Major mailbox providers now treat DMARC as the authoritative enforcement signal. The combination of SPF `~all` with DMARC `p=reject` provides stronger, more reliable protection than SPF hard fail alone, while remaining fully compatible with modern email authentication flows.

This guidance applies to active sending domains; parked or non-sending domains may safely use SPF `-all`.

## Standards Reference (RFC 7489 §10.1)

According to RFC 7489, Section 10.1, the use of SPF `-all` can cause messages to be rejected before DMARC processing occurs, preventing DKIM evaluation and DMARC policy enforcement.  
Primary source: https://datatracker.ietf.org/doc/html/rfc7489#section-10.1

## Practical Tools for DNS Security

I recommend using my own **<a href="https://dnstool.it-help.tech/" class="gold-link">DNS Tool</a>** for a complete, one-page audit of your security posture. It's the most authoritative way to check your work because it mimics how email providers actually see you.

I also use **<a href="https://redsift.com/tools/investigate" target="_blank" rel="noopener noreferrer" class="gold-link">Red Sift's Investigate</a>** specifically when I need to **send a test email** to verify delivery path and headers. Their tool provides a special email address you can send to, which is a fantastic way to see exactly how your emails are arriving.

For tracking historical DNS changes, **<a href="https://securitytrails.com/" target="_blank" rel="noopener noreferrer" class="gold-link">SecurityTrails</a>** is my go-to.

## Step-by-Step Guide to Setting Up DMARC, SPF, and DKIM

If you’re new to DNS security, here’s a simple checklist to help you set up DMARC, SPF, and DKIM:

> **Note:** This guide is for **custom domain owners** (e.g. `you@yourbusiness.com`). If you use a free address like `@gmail.com` or `@yahoo.com`, you cannot edit these records—this guide is not for you.

If you’d like to see the state of your DNS before we get started, visit **<a href="https://dnstool.it-help.tech/" class="gold-link">dnstool.it-help.tech</a>**, enter your domain, and keep that tab open. It will tell you exactly what is missing or broken in clear English.

If you want to test how your emails are currently landing (e.g. Inbox vs Spam), visit **<a href="https://redsift.com/tools/investigate" target="_blank" rel="noopener noreferrer" class="gold-link">Red Sift's Investigate</a>**, copy their test email address, and send an email to it from your **CRM, newsletter platform, or invoicing system**. Testing from your actual business tools is critical to spotting third-party delivery issues.  


In brief: SPF specifies which servers can send on your behalf (like a return-address check), DKIM attaches a digital signature to emails (proving the email hasn’t been tampered with), and DMARC ties everything together with a policy and reporting.

**SPF**
1.  Verify domain ownership.
    a.  The Registrar is where the yearly bill is paid (and could also be the place to edit DNS records – the DNS Host).
    b.  The NS server records tell you where to edit the DNS records; they are the DNS hosts. (This could be GoDaddy, Wix, or another; the two NS servers will give you a hint if you Google them.)
    c.  There are many variations in quality when you choose a registrar and DNS Host! We use Cloudflare as our registrar and DNS host. Mark Monitor (major companies like Google use them), Akamai (even cia.gov uses them!), and COM LAUDE (Apple uses them) are top-of-the-food-chain and good at their jobs!
2.  Create an SPF record listing authorized email servers:
    a.  The two most typical are:
        * `v=spf1 include:_spf.google.com ~all` (for Google guidance)
        * `v=spf1 include:spf.protection.outlook.com -all` (Microsoft’s historical default; in modern DMARC-enforced domains, `~all` is often safer)
    b.  After you construct your policy, copy it into your DNS.
    c.  Note that the two above records do not have entries for other things that may need to send email as your domain (Email Marketing, receipts, and invoices).
    d.  DNS lookup limit is 10. This means that if the SPF record causes more than 10 DNS lookups, it could lead to some emails failing SPF validation due to exceeding this limit. If you encounter this problem, you may need a Dynamic DNS service like Red Sift. We have a portal with them and can help you set it up.

**DMARC**
1.  Set up a DMARC policy.
    a.  Start with a monitoring policy (e.g., `p=none`).
    b.  After you construct your policy, copy it into your DNS. Be sure to specify an email address in the `rua` tag in the DMARC record to receive reports, and monitor them for insights.
    c.  Remember, if your DMARC says `p=none`, your work's not done! ;-) Progress to `p=quarantine` and then `p=reject`. `p=none` doesn't provide any protection. It only reports potential issues without enforcing policies, leaving your domain vulnerable to email spoofing.

**DKIM**
1.  Log in to Microsoft Exchange or Google Workspace (your email service provider) to get your DKIM keys, which you'll also publish in your DNS records.
    a.  DKIM selectors are part of the DKIM record that helps differentiate between multiple keys published under the same domain. This is useful for organizations that send emails through various systems or services (Email Marketing).
    b.  After you find your DKIM keys, copy them into your DNS. When setting up DKIM, it's recommended that you use a key length of at least 2048 bits. Shorter keys, such as 1024 bits, are no longer considered secure enough against brute-force attacks.
    c.  Make sure you hit Activate or Start Authentication in Google or Publish in Exchange.

Test the setup using **<a href="https://dnstool.it-help.tech/" class="gold-link">DNS Tool</a>**. It will verify that your SPF, DKIM, and DMARC records are actually propagating and being enforced correctly. Use this to confirm that your edits "took" and that the world sees the correct records.

To do a final delivery test, go back to **<a href="https://redsift.com/tools/investigate" target="_blank" rel="noopener noreferrer" class="gold-link">Red Sift Investigate</a>** and send another email to their test address to confirm your new authentication is passing.

Monitor and adjust as needed.

## DNSSEC for extra security

Additional DNS security measures, such as DNSSEC (DNS Security Extensions), protect against DNS spoofing by ensuring the DNS responses are authenticated. DNSSEC is a suite of extensions that provides DNS clients (resolvers) with origin authentication of DNS data, authenticated denial of existence, and data integrity.

## Common Pitfalls to Avoid

When setting up DMARC and SPF, watch out for these common mistakes:
* Incorrectly formatted DNS records, spaces left before or after, or incorrect format.
* Not updating DNS records after changing email providers.
* Setting overly strict policies initially.
* You will find quite a few website platforms that offer to log in to your DNS and automatically adjust or add the needed records for their needs; I can’t tell you how many times I get a call about email and websites being down because one of these tools erased and reset the entire zone file. If you care about security and zero downtime, DO NOT TRUST THESE TOOLS. They are far from perfect and are often coded by those who don’t understand DNS zone files.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I set up DMARC and SPF myself?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, but only if you fully understand how SPF, DKIM, and DMARC interact. Misconfigurations are common and can silently break email delivery or weaken spoofing protection."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if I don’t set up DMARC or SPF?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your domain becomes vulnerable to spoofing and phishing attacks, including Business Email Compromise (BEC). Attackers can impersonate your domain with little resistance, damaging trust and potentially causing financial loss."
      }
    }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Set Up DMARC, SPF, and DKIM",
  "description": "A step-by-step guide to securing your business email and domain using DNS Tool for auditing and Red Sift for testing.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Check Current Security Status",
      "text": "Visit dnstool.it-help.tech and enter your domain to see a complete audit of your current SPF, DKIM, and DMARC status.",
      "url": "https://dnstool.it-help.tech/"
    },
    {
      "@type": "HowToStep",
      "name": "Send a Test Email",
      "text": "Use Red Sift Investigate to generate a test email address. Send an email to it from your CRM or marketing platform to verify delivery headers from those specific services."
    },
    {
      "@type": "HowToStep",
      "name": "Configure DNS Records",
      "text": "Log in to your DNS provider (e.g. Cloudflare, GoDaddy) and add the reliable SPF, DKIM, and DMARC records tailored to your domain."
    },
    {
      "@type": "HowToStep",
      "name": "Verify Enforcement",
      "text": "Return to DNS Tool to confirm your new records are propagating and effectively enforcing your security policy.",
      "url": "https://dnstool.it-help.tech/"
    }
  ]
}
</script>

## FAQs: Your DNS Security Questions Answered

* **Can I set up DMARC and SPF myself?**
    Yes, but it’s advisable to <a href="/services/" class="gold-link">consult a DNS security expert</a> if you are unsure.
* **What happens if I don’t set up DMARC or SPF?**
    Your email system will be more susceptible to phishing and spoofing attacks. Evil criminals can send emails as you! They use you@company.com to email your bank or friends and ask for money or worse. These are called BEC Attacks (Business Email Compromise).

## BIMI

Beyond email security, a Brand Indicators for Message Identification (BIMI) record can validate your company’s logo on platforms like Gmail and more. Learn how to set it up at bimigroup.org. Here is Apple’s: `https://www.apple.com/bimi/v2/apple.svg`. It’s a rock-solid way to protect your intellectual property on the web.

## Statistical Urgency

The FBI's 2023 Internet Crime Report reveals a surge in cybercrime, with a record 880,418 complaints and over $12.5 billion in losses, highlighting California as the most affected state.  

## Conclusion

DNS security failures are rarely caused by missing records; they are caused by misinterpreting what those records actually enforce.

Securing your domain and email system is not just a technical requirement but a business imperative. Implementing DMARC, SPF, and DKIM can significantly reduce the risk of email spoofing and BEC phishing attacks.
Don’t be a statistic—take action today.
We can help you secure your email and DNS records. Call 619-853-5008.

*Last updated February 2026 — verified against RFC 7489 and current CISA DNS security guidance.*
