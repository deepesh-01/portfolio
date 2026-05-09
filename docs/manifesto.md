# The Logic-First Manifesto

> The operating manual. Five principles. Append-only.

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

## 4. AI-Native Handover

<p data-mode="founder engineer"><strong>Rule:</strong> Document everything so an agent can act on it without me. The portfolio you're reading, the ADRs, the runbooks, the SQL-defined trigger tables — they exist so that my knowledge is the company's <em>moat</em>, not the company's <em>bottleneck</em>.</p>

<p data-mode="engineer"><strong>Mechanism:</strong> Move conditional logic from code into data (see <a href="#blueprints">Blueprint §6</a>). Move runbooks from heads into ADRs (see <a href="#identity">/adr</a>). Move tribal knowledge into Markdown the moment it stops being yours alone.</p>

<p data-mode="founder">A senior engineer whose head is the only documentation is a single point of failure wearing a name tag. A senior engineer whose head <em>writes the documentation</em> is a force multiplier — and an agent can pick it up at 2 AM without paging anyone.</p>

<p data-mode="human">The honest framing: doing this work is also how I leave the next chapter possible. If everything I know is written down, I am free to move when the time is right, without leaving the company half-built. Documentation is the most loyal thing you can do for a team you might one day leave.</p>

## 5. Personal Life Is The Priority. Professional Excellence Is The Byproduct.

<p data-mode="human"><strong>Rule:</strong> Work is the byproduct of life, not the other way around. The version of this principle the body had to teach me, because I would not learn it any other way. Found out in April 2026, after a blackout that the calendar refused to make room for.</p>

<p data-mode="human founder">For the first half of my career I had productivity backwards: I treated work as the source and personal life as the residual. The math was wrong. The actual relationship is the reverse — productivity is what falls out of stability, not what produces it.</p>

<p data-mode="founder">For engineers reading this: the doctrines on this site (Cynical Architect, Audit Architect, Master-Worker, AI-Native Handover, System Wisdom) are operationally correct <em>only when the engineer running them has the personal infrastructure to think clearly under load.</em> The doctrines are downstream of the human. The human is upstream of everything.</p>

<p data-mode="human">Said another way: a 16-hour workday is a sprint; a 1,500km motorcycle ride is a journey. I learned to do both. The journey is what made the sprint sustainable.</p>

---

> *Innocence is allowed. Ignorance is not.*
> — the principle that came back to me the day after I deleted a row in production. December 2022.

> *I am not someone who leaves when everything is breaking.*
> — me, to leadership, returning from the Pune trip. Early 2024.

> *Work is the byproduct of life, not the other way around.*
> — the principle the body taught me in April 2026, after the blackout that the calendar refused to make room for.
