---
title: DNS Tool - My Go-To DNS & Email Security Auditor
description: "Discover DNS Tool, a command-line DNS and Email security auditor for checking MX, SPF, DKIM, DMARC (p=reject), DNSSEC, and more. Open-source and available on GitHub."
path: dns-tool
---

# DNS Tool 🛠️ - My Command-Line DNS Auditor

Tired of juggling a dozen different web tools and `dig` commands just to check if a domain's DNS and email security records were *actually* set up right? **So was I.** That's why I built **DNS Tool**.

### Why I Built This: The `p=none` Problem

As I always say: **“If your DMARC says `p=none`, your work’s not done—get to `p=reject`!”**

But getting to `p=reject` isn't just about DMARC. It means ensuring SPF is aligned, DKIM is signing correctly, DNSSEC is enabled, and MTA-STS is in place. Before DNS Tool, verifying all this meant a tedious dance across countless browser tabs and terminal windows, especially when waiting for DNS propagation. It was inefficient and far too easy to miss something critical.

### One Tool to Check Them All (The Nerd Brag Part)

DNS Tool is my personal command-line solution born from that frustration. It’s a single, portable binary (thanks to PyInstaller!) that runs on Linux, macOS, and Windows – no Python install needed on the target system. It's my Swiss Army knife for DNS validation.

In one go, it hammers a domain and reports back, with clear ✅ ❌ ⚠️ symbols, on *all* the important stuff:

* **Core Records:** NS, A, AAAA, MX, TXT, SOA, CAA
* **Email Security:** SPF (and its lookups!), DMARC (with `p=reject` nagging!), multiple DKIM selectors, MTA-STS, BIMI
* **Infrastructure:** DNSSEC validation status
* **Info:** PTR records and even an RDAP/WHOIS lookup.

It works interactively (with history!) or in batch mode. I use it daily to get a quick, comprehensive picture of a domain's DNS health, verify changes *instantly* as they propagate, and ensure nothing falls through the cracks. It saves me time and gives me confidence that things are *really* secure and configured correctly.

### Get The Tool & Full Details

Want to try it out, see the code, or dive into the full details on installation and every command-line flag? It's all open-source and waiting for you on GitHub:

* **[Main GitHub Repository (Code & Full README)](https://github.com/careyjames/dns-tool/)**
* **[Download Pre-compiled Binaries (Releases Page)](https://github.com/careyjames/dns-tool/releases)**
