---
title: "DNS Security Best Practices: Defend Your Domain with DMARC, SPF & DKIM"
date: 2025-05-25
author: Carey Balboa
categories: [DNS Security, Email Security]
tags: [DMARC, SPF, DKIM, DNSSEC, email deliverability, cybersecurity, BEC]
description: "Learn how to set up DMARC, SPF, & DKIM for robust DNS security. Protect your business email from spoofing, phishing, and BEC attacks with these best practices."
extra:
  image: images/dns-security-dmarc.png
  og_title: "DNS Security Best Practices: Defend Your Domain with DMARC, SPF & DKIM"
  og_description: "Learn how to set up DMARC, SPF, & DKIM for robust DNS security. Protect your business email from spoofing, phishing, and BEC attacks with these best practices."
  twitter_title: "DNS Security Best Practices: Defend Your Domain with DMARC, SPF & DKIM"
  twitter_description: "Learn how to set up DMARC, SPF, & DKIM for robust DNS security. Protect your business email from spoofing, phishing, and BEC attacks with these best practices."
  canonical_url: "https://www.it-help.tech/blog/dns-security-best-practices/"
---

Looking to bolster your DNS Security with DMARC, SPF, and DKIM? This guide will show you how to set up DMARC to protect your business email system from spoofing and phishing attacks. If you feel lost, call 619-853-5008. I’m happy to help.

### The Challenge: Ensuring DNS Security and Combating Email Vulnerabilities

Your Domain Name System (DNS) security protocols, such as DMARC (Domain-based Message Authentication, Reporting, and Conformance), SPF (Sender Policy Framework), and DKIM (DomainKeys Identified Mail), are crucial for safeguarding your business against email vulnerabilities.

### Why DNS Security Matters

Without proper DNS security and email authentication, your business is susceptible to email spoofing and phishing attacks. This could lead to unauthorized access to sensitive information, financial loss, and a tarnished domain reputation. Adequately configured DNS records not only secure email but also improve deliverability. Emails from properly authenticated domains are less likely to be marked as spam, thus improving overall deliverability rates.

### How to set up DMARC, SPF, and DKIM for Optimal DNS Security

DMARC, SPF, and DKIM offer a robust defense for your email system by authenticating the messages sent from your domain and providing a policy for handling messages that fail authentication. DMARC itself doesn’t “authenticate messages” but rather uses SPF/DKIM results to decide enforcement.

### Sample DMARC, SPF, and DKIM Records: Key Elements of DNS Security

Here is a DNS Tool record snip-it from a trusted source, CISA (Cybersecurity and Infrastructure Security Agency), the US cyber intelligence agency:

🔍 DMARC: "v=DMARC1; p=reject; pct=100; rua=mailto:DMARC@hq.dhs.gov, mailto:reports@dmarc.cyber.dhs.gov"

✅ DMARC p=reject => Great anti-spoof!

🔍 SPF (Sender Policy Framework): "v=spf1 include:spf.dhs.gov include:spf.protection.outlook.com<br>
include:spf-00376703.gpphosted.com -all"

✅ SPF found => "Good, there is only one!"

🔍 DKIM (common selectors): selector1._domainkey
"v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv32BRAJaAOsxAp31ZqQwd7RYfbYowvb3F<br>
7lq8WQEyasI6w7Gm0bxPW57TFM04fM5flf1PYyCDSa3ckQzSQLYmMx9HiXYJYF1Dpk9PnjTarbdR9mm9fc7iBXT2pTFNJw+S<br>
RMH3NRrbkefv8GqqLdJotgCl2vWoyRlfKCANCFq5Bbq4qaztXqU/cHRurG8ZVSF7ZrhY4EBKvpzAyIisrf2g2Gky+vO4LTMr<br>
gZeNnA/OyHmWmvlUC58e06jBLSysYyh19O4MiU5eUhuT7MYTLWz6fIOl4PaT9HkmM0rH/fgcGSYc8ajCsrvxYA8LgoWR9IzY<br>
q5vYzDWLxSo/J0c+6pVWQIDAQAB;"

✅ DKIM at selector1._domainkey

Notice that their policy is set to reject 100% of unauthorized messages.

We proudly participate as a stakeholder in CISA's Cyber Hygiene program for critical cyber infrastructure. We have learned so much from our assigned feds, and I love experiencing the red team, where hackers at CISA hack your company and show you what they could steal and how to prevent it. One cool macOS security tool we had installed that gave our fed, who was red-teaming us the most trouble, was LuLu by Objective See.

### Common SPF Misconceptions

Contrary to some misunderstandings, the `-all` tag in an SPF record does not prevent internal users from sending or receiving emails. Instead, it mandates that only explicitly allowed sources can send emails on behalf of the domain. Email newsletters sent with Mailchimp or Zendesk, for example, cannot successfully send emails that arrive from your domain without having an "include:" entry. So you allow them with an "include:" entry.

### Alternate Viewpoints

Mail Hardener recommends using SPF `~all` (Softfail) over `-all` (Fail) for better compatibility and fewer delivery issues.

### Scientific Backing

According to RFC 7489, Section 10.1, the use of `-all` can cause messages to be rejected before DMARC processing, something operators should be aware of.

### Practical Tools for DNS Security

I recommend using Red Sift's Investigate, securitytrails.com (I coded a command-line tool, [dns-tool](https://github.com/careyjames/dns-tool), to track DNS changes), and I like Red Sift's OnDmarc to track dynamic DNS records (when you may have a more advanced setup or need more than 10 lookups).

### Step-by-Step Guide to Setting Up DMARC, SPF, and DKIM

If you’re new to DNS security, here’s a simple checklist to help you set up DMARC, SPF, and DKIM:

If you’d like to see the state of your DNS before we get started, visit <a href="https://redsift.com/tools/investigate" target="_blank" rel="noopener noreferrer" class="gold-link">Red Sift’s Investigate</a>, where you can send a test email from your email client or your marketing platform as a test send.  


In brief: SPF specifies which servers can send on your behalf (like a return-address check), DKIM attaches a digital signature to emails (proving the email hasn’t been tampered with), and DMARC ties everything together with a policy and reporting.

**SPF**
1.  Verify domain ownership.
    a.  The Registrar is where the yearly bill is paid (and could also be the place to edit DNS records – the DNS Host).
    b.  The NS server records tell you where to edit the DNS records; they are the DNS hosts. (This could be GoDaddy, Wix, or another; the two NS servers will give you a hint if you Google them.)
    c.  There are many variations in quality when you choose a registrar and DNS Host! We use Cloudflare as our registrar and DNS host. Mark Monitor (major companies like Google use them), Akamai (even cia.gov uses them!), and COM LAUDE (Apple uses them) are top-of-the-food-chain and good at their jobs!
2.  Create an SPF record listing authorized email servers:
    a.  The two most typical are:
        * `v=spf1 include:_spf.google.com ~all` (for Google guidance)
        * `v=spf1 include:spf.protection.outlook.com -all` (for Microsoft guidance)
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

Test the setup using Red Sift's Investigate, the web-browser-based Cyber Alliance, or if you are a Linux/macOS nerd like me, use the command-line tool I created, [dns-tool](/dns-tool/).

Monitor and adjust as needed.

### DNSSEC for extra security

Additional DNS security measures, such as DNSSEC (DNS Security Extensions), protect against DNS spoofing by ensuring the DNS responses are authenticated. DNSSEC is a suite of extensions that provides DNS clients (resolvers) with origin authentication of DNS data, authenticated denial of existence, and data integrity.

### Common Pitfalls to Avoid

When setting up DMARC and SPF, watch out for these common mistakes:
* Incorrectly formatted DNS records, spaces left before or after, or incorrect format.
* Not updating DNS records after changing email providers.
* Setting overly strict policies initially.
* You will find quite a few website platforms that offer to log in to your DNS and automatically adjust or add the needed records for their needs; I can’t tell you how many times I get a call about email and websites being down because one of these tools erased and reset the entire zone file. If you care about security and zero downtime, DO NOT TRUST THESE TOOLS. They are far from perfect and are often coded by those who don’t understand DNS zone files.

### FAQs: Your DNS Security Questions Answered

* **Can I set up DMARC and SPF myself?**
    Yes, but it’s advisable to [consult a DNS security expert](/services/) if you are unsure.
* **What happens if I don’t set up DMARC or SPF?**
    Your email system will be more susceptible to phishing and spoofing attacks. Evil criminals can send emails as you! They use you@company.com to email your bank or friends and ask for money or worse. These are called BEC Attacks (Business Email Compromise).

### BIMI

Beyond email security, a Brand Indicators for Message Identification (BIMI) record can validate your company’s logo on platforms like Gmail and more. Learn how to set it up at bimigroup.org. Here is Apple’s: `https://www.apple.com/bimi/v2/apple.svg`. It’s a rock-solid way to protect your intellectual property on the web.

### Statistical Urgency

The FBI's 2023 Internet Crime Report reveals a surge in cybercrime, with a record 880,418 complaints and over $12.5 billion in losses, highlighting California as the most affected state.  

### Conclusion

Securing your domain and email system is not just a technical requirement but a business imperative. Implementing DMARC, SPF, and DKIM can significantly reduce the risk of email spoofing and BEC phishing attacks.
Don’t be a statistic—take action today.
We can help you secure your email and DNS records. Call 619-853-5008.
