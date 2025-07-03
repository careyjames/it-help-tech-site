---
title: "Malvertising & Platform Negligence: Big Tech’s Complicity in Modern Phishing"
date: 2025-07-01
author: Carey Balboa
extra:
  image: "/images/malvertising-2025/evil-fake-search-highlighted-1200.webp"
  og_image: "/images/malvertising-2025/evil-fake-search-highlighted-1200.webp"
  description: "Real-world screenshots show how fake support pop-ups, malicious Facebook posts, and sponsored search ads hijack brand trust—and what you can do about it."
taxonomies:
  categories: ["Security", "Threat Intelligence"]
  tags: ["malvertising", "facebook", "google", "phishing", "social-engineering"]
---


## Preface

Before diving in, I want to make it clear that I use and appreciate the innovations from major tech companies like Apple and Google. I have immense respect for the people working there, many of whom strive to do good. This article isn’t about vilifying these companies, but about highlighting critical areas where their influence could be harnessed for greater security. If regulations mandated certain protections, these companies would already have compliance budgets in place. It's about pushing for better, not tearing down what's good.
While Apple and Google often show intrinsic motivation and genuine care for their users, as evidenced by their leadership's commitment to innovation and user privacy, **Facebook presents a stark contrast.** Facebook has repeatedly faced criticism for its handling of user privacy and the difficulty users face in resolving account issues. **This pattern of behavior sets Facebook apart from its peers and places it far from the moral high ground that companies like Apple and Google strive to maintain.**


### The Anatomy of a Modern Malvertising Funnel
Real-world screenshots show how sponsored search ads, fake support pop-ups, and malicious Facebook posts  hijack brand trust—and what you can do about it. The culprits are the complicit platforms that monetize first and moderate later. While they excel in many areas, their size and complexity often lead to slow responses to emerging threats, leaving users at risk.


![Annotated fake Facebook ad — notice the sloppy run‑together words and the misleading Sponsored tag.](/images/malvertising-2025/evil-fake-search-highlighted-1200.webp)



1. **Paid Placement** – Attackers buy a “Sponsored” slot for a high‑value keyword (e.g. *facebook*). Google’s automated auction system accepts the ad because it appears legitimate on the surface.[^malwarebytes][^malwarebytes2024]
![Attacker‑controlled Facebook Page titled 'Login Accounts' embedding a malicious Continue button.](/images/malvertising-2025/login-accounts-scam-embedded-profile-1200.webp)

<p style="text-align:center; font-size:0.9em;"><em>Above: The ad lands on an innocuous-looking <strong>facebook.com</strong> URL. But the page is a throw-away profile (“Login Accounts”) the scammers fully control. The blue ‘Continue’ button is wired to an off-site credential-harvesting server.</em></p>

3. **Credential Harvest** – Typing your username + password into the cloned form sends them straight to the attacker. SMS/TOTP codes can be replay‑proxied in real‑time, but hardware FIDO2 / security‑key challenges are origin‑bound and will refuse to respond on impostor domains. Only a highly sophisticated attack that hijacks both DNS *and* TLS could bypass WebAuthn, which is outside normal malvertising scenarios.

Take‑away: The “Sponsored” label — whatever colour it may be — is not a trust seal; it’s the attack surface.


## Tech‑Support Pop‑Ups: Old Tricks, New Skins

![Fake Apple virus‑alert pop‑up that hijacks the browser and urges a call to fake support.](/images/malvertising-2025/scam-fake-support-site-1200.webp)

<p style="text-align:center; font-size:0.9em;"><em>Above: Classic scare‑ware page. JavaScript alert loops lock your browser while the page blares fake audio warnings.</em></p>

 - The page weaponises JavaScript alert loops to harass the user; modern Chrome and Firefox show a “Stop this page from creating additional dialogs” link after several alerts, but many victims panic and miss it.  
 - Call‑centre scripts typically walk victims through installing remote‑desktop tooling or paying for bogus “clean‑up” software. (Hear the recorded call below.)  
 - Modern Chrome and Firefox display a “Stop this page from creating additional dialogs” link after a few consecutive alerts, but panicked users often miss or ignore it.

<audio controls preload="none">
  <source src="/audio/malvertising-2025/when-you-call-the-scammers.mp3" type="audio/mpeg">
  Your browser does not support the audio tag.
</audio>

*I couldn’t resist throwing a little smart‑ass banter at the “technician.”  
If you listen, you’ll hear the scam script fall apart the moment I start asking real questions.*

<strong>What would happen to a typical, unsuspecting caller?</strong>  
The agent would walk them through installing a remote‑desktop tool, point to normal system logs as “evidence” of infection, and then extract a credit‑card number for a bogus “lifetime security plan.” A follow‑up call usually pressures the victim into handing over online‑banking credentials under the guise of a refund. In other words: device compromise <em>and</em> direct financial theft.


## Facebook’s Reporting Black‑Hole

<p style="text-align:center">
  <img src="/images/malvertising-2025/facebook-approving-of-the-scam-as-community-friendly-1200.webp" alt="Facebook claims the scam post does not violate Community Standards." />
  <img src="/images/malvertising-2025/reported-to-facebook-1200.webp" alt="User interface showing the scam post was reported." style="margin-top:0.5rem;" />
</p>
<p style="text-align:center; font-size:0.9em;"><em>Above: A double‑whammy—report filed, but Meta’s moderation AI rubber‑stamps the scam as “community‑friendly.”</em></p>

Despite clear evidence of credential theft:
 - **Support Inbox Shrug:** The platform replies “Doesn’t go against our Community Standards.”  
 - **Lifeboating:** Even when a single post is nuked, the same advertiser spins up a new account minutes later – a problem the UK FCA publicly called Meta out for in April 2025.[^guardian]

Translation: At scale, reactive moderation is theatre. Attackers move faster than the appeals queue.


## Why This Persists

<table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">
  <thead>
    <tr>
      <th style="padding:0.4rem 1rem; text-align:left;">Actor:</th>
      <th style="padding:0.4rem 1rem; text-align:left;">Incentive:</th>
      <th style="padding:0.4rem 1rem; text-align:left;">Outcome:</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:0.4rem 1rem;">Search‑engine ad platform</td>
      <td style="padding:0.4rem 1rem;">Revenue per click; speed over scrutiny</td>
      <td style="padding:0.4rem 1rem;">Malvertising accepted by default</td>
    </tr>
    <tr>
      <td style="padding:0.4rem 1rem;">Social network</td>
      <td style="padding:0.4rem 1rem;">Engagement metrics; legal safe‑harbour mindset</td>
      <td style="padding:0.4rem 1rem;">Slow or no takedown of scam content</td>
    </tr>
    <tr>
      <td style="padding:0.4rem 1rem;">User</td>
      <td style="padding:0.4rem 1rem;">Convenience bias; search‑navigation habit</td>
      <td style="padding:0.4rem 1rem;">Credentials & money stolen</td>
    </tr>
  </tbody>
</table>

Until the economics change (e.g. **strong** financial liability for enabling fraud), the cycle repeats.[^fbi2022]

### Legal Note  
Current U.S. law (Section 230) treats ad content as third‑party speech. Platforms are mostly shielded from direct liability, so the critique here focuses on insufficient preventive controls rather than claiming legal complicity.


## Hardening Checklist (10‑Minute Audit)

1. Stop relying on search for logins. Bookmark the canonical domain or use a password‑manager vault link.  
2. Install an ad/tracker blocklist (uBlock Origin, Pi‑hole, NextDNS) and enable EasyPrivacy + Malware domains.  
3. Force HTTPS and verify the site’s domain in the address bar (EV indicators are deprecated). No padlock / HTTPS warning ≠ no go.  
4. Deploy hardware‑bound FIDO2 keys; phishing proxies can’t replay WebAuthn challenges.  
5. Use DNSSEC‑validated resolvers (Quad9, Cloudflare 1.1.1.1 with DNS over TLS) to blunt typo‑squats. DNSSEC only guarantees authenticity of look‑ups; it does not block malicious domains, so pair it with a DNS‑filtering resolver (e.g. Quad9, Cloudflare Gateway).  
6. On macOS: enable Lockdown Mode for high‑risk users, and keep Gatekeeper + XProtect signatures current.  
7. For orgs: if you operate a secure‑web proxy or browser extension that logs outbound URLs, ingest that telemetry into your SIEM and auto‑isolate hosts that resolve known rogue domains.  


## Share & Amplify

Cut through the “user error” narrative. The culprits are the platforms that monetize first and moderate later. Feel free to re-share these assets (attribution appreciated) and let’s keep the pressure on.


## Footnotes & Sources


[^malwarebytes]: <a href="https://kcpolice.org/crime/prevention-and-safety-tips/cyber-crime-prevention/scam-of-the-week-fake-ads-real-fraud/" target="_blank" rel="noopener noreferrer">“Scam of the Week: Fake Ads, Real Fraud”</a>, Kansas City Police Cyber‑Crime Prevention Unit, 03 Apr 2025.  
[^hackernews]: <a href="https://thehackernews.com/2025/02/malvertising-scam-uses-fake-google-ads.html" target="_blank" rel="noopener noreferrer">“Malvertising Scam Uses Fake Google Ads to Hijack Microsoft Advertising Accounts”</a>, *The Hacker News*, 01 Feb 2025.  
[^guardian]: <a href="https://www.theguardian.com/money/2025/apr/30/meta-slowest-to-remove-scam-content-says-city-watchdog" target="_blank" rel="noopener noreferrer">“Meta slowest to remove scam content, says City watchdog”</a>, *The Guardian*, 30 Apr 2025.  
[^fbi2022]: *FBI Internet Crime Complaint Center 2022 Report*, Tech‑support scam losses p. 22.  
[^malwarebytes2024]: Malwarebytes Threat Intelligence, “Google Ads hijack leads to Facebook credential phishing”, 12 Apr 2024.
