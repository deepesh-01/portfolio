# The Logic-First Manifesto

> The operating manual. Three principles. No edits.

## 1. The IPO Framework (Input → Process → Output)

<p data-mode="engineer"><strong>Rule:</strong> Never touch the "Process" layer until the "Input" is 100% sanitised and defined.</p>

<p data-mode="engineer human"><strong>The Tricky Step (Data Context):</strong> Most bugs live in the gap between the raw data and the processing logic. I spend 40% of my time understanding the context before writing the first line of code.</p>

<p data-mode="founder">In product terms: define the input contract before you negotiate the timeline. Most "missed deadlines" are actually missed inputs that no one wrote down.</p>

## 2. Innocence vs. Ignorance

<p data-mode="human engineer"><strong>Principle:</strong> A first-time mistake is <em>innocent</em>. It is an opportunity to build a system — the SQL trigger, the audit table, the pre-bootup check.</p>

<p data-mode="engineer founder"><strong>Principle:</strong> Repeating the same mistake is <em>ignorance</em>. It is a failure of system design. I hire and build for innocence; I never tolerate ignorance.</p>

<p data-mode="founder human">Said another way: every postmortem either ends in a system, or it ends in a layoff. Pick the system.</p>

## 3. Engineering over Frameworks

<p data-mode="engineer"><strong>Philosophy:</strong> If a custom bash script can replace a 100MB Docker container for local dev, the bash script wins.</p>

<p data-mode="founder engineer"><strong>Speed as a feature:</strong> Developer velocity is a direct result of "boring" and "lean" infrastructure. The team that ships the most features is the team that maintains the fewest.</p>

<p data-mode="founder">The boring decision is the seed-stage decision. Optionality is more valuable than abstraction. Every framework you adopt is a framework you have to migrate off later.</p>

---

> *Innocence is allowed. Ignorance is not.*
> — the principle that came back to me the day after I deleted a row in production. December 2022.
