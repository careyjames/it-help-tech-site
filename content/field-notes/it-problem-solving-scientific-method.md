---
title: "IT Problem-Solving Meets the Scientific Method"
date: 2025-05-26
updated: 2026-04-19
author: Carey Balboa
categories: [Consulting, Troubleshooting, Methodology]
tags: [scientific method, IT consulting, problem solving, diagnostic reasoning, cognitive bias, falsifiability, Cynefin, postmortem]
description: "How a working adaptation of the scientific method — grounded in Popper, Peirce, and the medical diagnostic-error literature — defeats the cognitive biases that derail most IT troubleshooting."
aliases:
  - /blog/it-problem-solving-scientific-method/
extra:
  seo_title: "IT Problem-Solving as Hypothesis-Driven Inquiry"
  image: images/it-problem-solving-scientific-method.webp
  og_title: "IT Problem-Solving Meets the Scientific Method"
  og_description: "How a working adaptation of the scientific method — grounded in Popper, Peirce, and the medical diagnostic-error literature — defeats the cognitive biases that derail most IT troubleshooting."
  twitter_title: "IT Problem-Solving Meets the Scientific Method"
  twitter_description: "How a working adaptation of the scientific method — grounded in Popper, Peirce, and the medical diagnostic-error literature — defeats the cognitive biases that derail most IT troubleshooting."
  canonical_url: "https://www.it-help.tech/field-notes/it-problem-solving-scientific-method/"
---

In my [IT consulting work](/services/), my PhD clients have always told me that I naturally follow a process like the scientific method when solving complex technical problems. I may not wear a lab coat, but the way I tackle IT issues is essentially scientific. By approaching problems in a structured, evidence-based way — aligned with [my commitment to ethical service](/about/) — I produce solutions that are reliable rather than lucky. Below, I walk through how each stage of the classic scientific method translates into IT troubleshooting, with a few personal tweaks for the consulting world and explicit pointers to the bodies of work this method is borrowed from.

### TL;DR
IT troubleshooting fails for two intertwined reasons: gaps in the troubleshooter's knowledge of the system, and *diagnostic-reasoning* failures of exactly the kind well documented in clinical medicine — anchoring, confirmation bias, premature closure, search satisficing. The seven steps below are not bureaucracy. They are cognitive forcing functions — adapted from the philosophy of science (Popper, Peirce, Hempel), from the medical diagnostic-error literature (Croskerry, Norman), and from the operational software traditions of postmortem analysis (Google SRE) and complex-system incident response (Allspaw / SNAFUcatchers) — designed to slow you down enough to notice the gaps and work around the biases. Wearing the discipline takes more time than seat-of-the-pants guessing for the first ten minutes and far less time after that.

---

## Why the Scientific Method, Specifically

The point isn't to dress IT work in lab-coat language. The point is that the same disciplines that produce reliable knowledge in science — explicit hypotheses, falsifiable predictions, evidence-based conclusions, peer-checkable artifacts — defeat the same cognitive failures in any complex domain that involves *diagnostic reasoning under uncertainty*. The two fields with the most mature literature on this kind of reasoning are physics and clinical medicine. IT troubleshooting sits structurally between them: more empirical than mathematics, less governed by physiology than medicine, but with the same bias-prone failure modes as both.

Karl Popper's *Logic of Scientific Discovery* argued that what makes a hypothesis scientific is not that it can be supported, but that it can be *falsified* — a criterion that has been debated and refined for ninety years but remains a useful working standard [^1]. Charles Sanders Peirce coined the term **abduction** for the kind of inference we use when forming a working hypothesis from incomplete data — the inference to the best available explanation [^2]. Carl Hempel formalized the **hypothetico-deductive method**: derive predictions from a hypothesis, then design tests that can disconfirm them [^3]. None of these is a universal account of how science actually proceeds, but together they describe a pattern of reasoning that working scientists draw on constantly — and that working IT troubleshooters apply, whether they name them or not.

## The Diagnostic Failure Modes the Method Defeats

Pat Croskerry's body of work on diagnostic error in medicine catalogs the cognitive biases that produce most missed diagnoses [^4][^5]. The list translates almost word-for-word into IT troubleshooting:

- **Anchoring** — the first hypothesis sticks. *"The printer is offline, so it must be the network."* Three hours later, it's a stale print spooler.
- **Confirmation bias** — only looking for evidence that fits the current theory. The five log lines that *don't* fit are skimmed past or rationalized.
- **Premature closure** — accepting the first plausible match and moving on without considering alternatives.
- **Availability heuristic** — diagnosing what you've seen recently or what was memorable. *"Last week it was DNS, so it's DNS."*
- **Search satisficing** — finding *one* root cause and stopping, when there were two interacting causes and you only fixed half the problem.

Geoffrey Norman and colleagues add an important counterpoint: bias alone does not explain diagnostic error. Knowledge gaps — not knowing the relevant facts about the system — are at least as common a contributor [^6]. The implication for IT is not that the seven steps make you smarter; it is that the seven steps slow you down enough to notice when *you don't actually know what's happening*, which is the moment to do research instead of generating another guess.

The seven steps below are designed against exactly these failure modes. Each one names the discipline it borrows from and the bias it is built to defeat.

---

## 1. Observation

I always start by observing and listening. I watch the client demonstrate the problem in their environment and ask plenty of clarifying questions. The goal is to understand the technical symptoms *and* the client's underlying goals and concerns. This sets a strong foundation and — just as important — it defends against **anchoring**. The first description of a problem is rarely the cleanest one. Watching it happen, asking "show me when it last worked," and noting what the client *isn't* mentioning all surface evidence that a verbal report would have hidden.

The discipline borrowed here is the one shared by every empirical field: *primary-source observation before secondary-source interpretation*.

## 2. Research

Once I have a clear picture of the issue, the next step is research. I seek authoritative sources — official documentation, vendor knowledge bases, the relevant RFC, sometimes academic literature — to gather definitive information about the problem domain. By doing my homework, I avoid guesswork and ground any potential solution in facts. This is the IT analog of reviewing the scientific literature before designing an experiment.

This step is the explicit countermeasure to the **availability heuristic**. Last week's incident is not authoritative. The vendor's documentation, the protocol specification, and the manufacturer's release notes are.

## 3. Hypothesis

I then form a hypothesis about the root cause from the observations and the research — Peirce's *abduction* in operational dress [^2]. Crucially, I require the hypothesis to be **falsifiable**: there must be a specific test whose result could prove it wrong [^1]. *"It might be the cache"* is not a hypothesis. *"If it's the cache, then clearing it will restore behavior within thirty seconds; if it doesn't, the cache is not the cause"* is a hypothesis.

Just as importantly, I communicate this understanding to the client in clear, jargon-free terms. Sharing the hypothesis shows my thought process, invites their input, and confirms we're on the same page before any change is made. This step is the cognitive forcing function against **premature closure**: stating the hypothesis out loud, with a falsifiable prediction attached, makes it harder to skip past the alternatives.

## 4. Experimentation

With a hypothesis in hand, it's time for experimentation. I test the most promising solution — ideally one supported by official documentation or prior evidence — in the safest available environment. Crucially, I always inform the client about what I plan to do and any potential risks or side effects before making changes. This ethical transparency builds trust and ensures the fix is methodical, with no unpleasant surprises.

The disciplines here are the **hypothetico-deductive method** [^3] and the operational principle of **change isolation**: one variable at a time, with a way to roll back. The bias being defeated is **confirmation bias** — by designing a test whose result you have publicly committed to *interpret as falsification* if the prediction doesn't hold, you make it harder to retroactively explain away a negative result.

## 5. Analysis

As I test, I gather and analyze evidence at every step: logs, error messages, performance metrics, screenshots, packet captures where appropriate. Analyzing this data tells me whether the changes have the expected effect or whether a new strategy is needed. These artifacts also matter for collaboration — concrete evidence makes consultation with fellow professionals far more effective than verbal summaries.

This step is the explicit defense against **search satisficing**. The first thing that improves is not necessarily the only thing that needs fixing. Reading the data after the change, including the parts that look unchanged, is what catches the second interacting cause that the first fix didn't address.

## 6. Conclusion

After experimentation, I conclude and implement the solution. I verify that the issue is truly resolved, not just papered over, and I distinguish between *contributing conditions addressed* and *symptom suppressed*. Then I present the outcome to the client, backed by the evidence gathered — logs or a before-and-after comparison that prove the fix worked. Solid proof rather than opinion gives the client genuine confidence that the problem was understood as well as resolved.

The discipline here is what software-operations practitioners call **postmortem rigor**: the modern SRE convention treats incidents as the product of multiple contributing conditions in a socio-technical system, not a single root cause to be discovered and blamed. The goal is not to declare victory; it is to be able to explain, with evidence, what happened, why the system was vulnerable to it, and what changes make a recurrence less likely [^7].

## 7. Communication

The final step is communication of what I've learned. I document the entire journey and its resolution, often writing it up in a [field note like this one](/field-notes/). Publishing the findings turns a one-off fix into a reusable guide and contributes to the broader operational literature. In essence, I'm closing the loop by sharing results — which benefits the client, the next client with a similar problem, and the IT community at large.

This step is borrowed directly from how science actually accumulates knowledge: peer-checkable, written-down artifacts. It also has a private benefit. Writing the analysis up forces a final pass over the reasoning, which catches the *eighth* bias — overconfidence in the conclusion you have already reached.

---

## When the Method Adapts: Complicated vs. Complex Problems

The seven-step method works beautifully on **complicated** problems — the kind with a knowable cause structure that can be diagnosed with expertise and discipline. It is less straightforward on **complex** problems, where the behavior emerges from many interacting components and there is no single cause to find. Dave Snowden's Cynefin framework distinguishes five domains in total — clear, complicated, complex, chaotic, and disorder — but the complicated/complex distinction is the one that matters most for working IT troubleshooting [^8]. When you face a complex problem (a flaky cluster, an intermittent network anomaly that isn't reproducing, a multi-vendor sync failure), the method shifts from single-shot hypothesis-test-conclude to *iterative probing* — small, observable changes whose results inform the next probe rather than yielding a final answer.

The same shift is well documented in software-incident response. Jeff Allspaw and colleagues at the SNAFUcatchers consortium describe how operators of complex socio-technical systems build understanding through repeated, instrumented intervention rather than top-down diagnosis [^9]. The seven-step method does not replace this work; it provides the structure within which iterative probing is conducted, recorded, and reasoned over.

Knowing which regime you are in is itself a diagnostic skill. The honest answer is sometimes *I do not yet know whether this is complicated or complex* — and that, too, is information.

## The Ethical Dimension

Two threads run through every step above and deserve to be named explicitly.

The first is **informed consent**. Clients are not laboratory subjects. Before any change with non-trivial risk — anything that could lose data, break a working configuration, or charge a chunk of billable time — I describe what I plan to do, what could go wrong, and what the rollback path is. This is not a separable "ethics" overlay on top of the method; it is part of the method, in the same way that institutional review is part of clinical research. A solution arrived at without consent is not a finished solution.

The second is **calibrated honesty about expert intuition**. Daniel Kahneman and Gary Klein's joint paper on intuitive expertise establishes the conditions under which an expert's gut is trustworthy: high-validity environments with rapid, unambiguous feedback [^10]. Some IT problems meet that bar (familiar systems, clean error messages); many do not (intermittent failures, multi-vendor stacks, cloud abstractions that hide the underlying behavior). The method is designed for the second case. When I catch myself reaching for a diagnosis without working through observation and research first, that is the cue to slow down, not the cue to trust the reflex.

---

## References

[^1]: Popper, K. R. (2002). *The Logic of Scientific Discovery* (Routledge Classics). Routledge. (Original work in German, 1934; English translation, 1959.) <https://doi.org/10.4324/9780203994627>

[^2]: Douven, I. (2021). Abduction. In E. N. Zalta (Ed.), *The Stanford Encyclopedia of Philosophy*. <https://plato.stanford.edu/entries/abduction/>

[^3]: Hempel, C. G. (1966). *Philosophy of Natural Science*. Prentice-Hall.

[^4]: Croskerry, P. (2003). The importance of cognitive errors in diagnosis and strategies to minimize them. *Academic Medicine*, 78(8), 775–780. <https://doi.org/10.1097/00001888-200308000-00003>

[^5]: Croskerry, P. (2009). A universal model of diagnostic reasoning. *Academic Medicine*, 84(8), 1022–1028. <https://doi.org/10.1097/ACM.0b013e3181ace703>

[^6]: Norman, G. R., Monteiro, S. D., Sherbino, J., Ilgen, J. S., Schmidt, H. G., & Mamede, S. (2017). The causes of errors in clinical reasoning: Cognitive biases, knowledge deficits, and dual process thinking. *Academic Medicine*, 92(1), 23–30. <https://doi.org/10.1097/ACM.0000000000001421>

[^7]: Beyer, B., Jones, C., Petoff, J., & Murphy, N. R. (Eds.). (2016). *Site Reliability Engineering: How Google Runs Production Systems*. O'Reilly. Postmortem culture chapter: <https://sre.google/sre-book/postmortem-culture/>

[^8]: Snowden, D. J., & Boone, M. E. (2007). A leader's framework for decision making. *Harvard Business Review*, 85(11), 68–76. <https://hbr.org/2007/11/a-leaders-framework-for-decision-making>

[^9]: Allspaw, J. (Ed.). (2017). *STELLA: Report from the SNAFUcatchers Workshop on Coping with Complexity*. The Ohio State University. <https://snafucatchers.github.io/>

[^10]: Kahneman, D., & Klein, G. (2009). Conditions for intuitive expertise: A failure to disagree. *American Psychologist*, 64(6), 515–526. <https://doi.org/10.1037/a0016755>

A BibTeX file for these references is available at [`/field-notes/it-problem-solving-scientific-method.bib`](/field-notes/it-problem-solving-scientific-method.bib) for one-click import into Zotero or any reference manager.

---

For a hypothesis-driven look at a stuck system before you spend a week guessing, call **619-853-5008**.

*Last updated April 19, 2026.*
