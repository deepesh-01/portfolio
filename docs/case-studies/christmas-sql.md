# Case Study 01 — The 1.5-Hour Christmas SQL Call

**Date.** December 25, 2022.
**Location.** Bangalore (me) ↔ Kolkata (a senior teammate).
**Duration.** Ninety minutes.
**Outcome.** I never asked anyone to write a query for me again.

## Context

<p data-mode="founder">TimelyAI was running on Postgres with a query surface that had outgrown the team. Every analytics request was bottlenecked behind one or two engineers who could write the JOINs and CTEs the data demanded. That bottleneck was a tax on every product decision.</p>

<p data-mode="engineer">I had been writing queries by template — copying patterns I half-understood, asking for help on anything with a window function or a recursive CTE. I could read SQL. I could not <em>compose</em> SQL.</p>

## The Decision

<p data-mode="human">It was Christmas Day. The senior teammate I called was at home in Kolkata. His friends were shouting at him in the background to come out for the holiday. He stayed on the call for an hour and a half anyway, because the only way to fix the bottleneck was for one more person on the team to graduate from "uses SQL" to "thinks in SQL." That person was going to be me, and the day was going to be today.</p>

## The Process

The structure of the call (in IPO terms):

- **Input.** The actual analytics question, in business language.
- **Process.** Decompose into table relationships, then into a JOIN
  graph, then into the smallest CTE that produces the right row shape.
- **Data Context.** Walk through what the rows *mean* — which fields
  are nullable in practice, which are nullable only in the schema, what
  a duplicate looks like, what a soft-delete looks like.
- **Output.** Write the query end-to-end without copying any prior one,
  and explain every line as if reviewing it.

He didn't write a single line of SQL on that call. He made me write all of it.

## The Outcome

<p data-mode="engineer">After that call I owned every analytics query that came through my queue. Within a quarter, I was the one writing the trigger-and-audit-log architecture (see <a href="#blueprints">Blueprint 3</a>) — which would have been impossible without that day, because the audit table design <em>is</em> a SQL design problem before it is a security problem.</p>

<p data-mode="founder human">More importantly: the bottleneck closed. Anyone on the team who wanted to learn could now ask me, and I could give them their own version of the Christmas call. The lesson compounds when you teach it forward.</p>

## Why This Is A Case Study, Not A Memory

<p data-mode="founder">Founding engineering is not built by big launches. It is built by these 90-minute decisions to permanently absorb a capability that was previously rented from a teammate. Every founding engineer I respect has at least one Christmas call in their archive — a day where someone senior gave up an evening, and the receiver gave up the right to ever ask the same question again.</p>

> *"After that day, I never went back to ask for a query."*
