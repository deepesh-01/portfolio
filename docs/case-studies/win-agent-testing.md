# Case Study 11 — The Win Agent Testing Suite

**Period.** Mid-2025 (Phase 9 — The Golden Bloom).
**Surface.** The "Win Agent" — Zoca's LLM-powered product agent for converting leads into wins (booked appointments, paying customers).
**Stakes.** A live, customer-facing LLM in the product layer. Behaviour drift = lost revenue. Behaviour hallucination = lost trust.
**Outcome.** Moved Win Agent quality from *prompt-tweaking-and-praying* to **deterministic testing** — every change validated against a reproducible test suite before shipping. Visibility metrics surface regression before customers notice.

## Context — The "Change The Prompt" Trap

<p data-mode="engineer">Most teams iterate on LLM products by tweaking the prompt, eyeballing a few example outputs, and shipping. It works on Tuesday. It fails on Friday — same prompt, same model, different inputs, different month. The failure mode is invisible until a customer flags it. By the time the customer flags it, the regression has been live for hours or days.</p>

<p data-mode="founder">At a $3.5M-ARR scale, "we'll catch it next time" is not an SLA. The Win Agent is a paid product surface; its outputs translate, line by line, to revenue or lost revenue. The discipline that worked for code (tests, CI, rollback) had to land on prompts and LLM outputs.</p>

## The Decision — Test The Outputs, Not The Prompt

<p data-mode="engineer">A standard prompt-engineering test suite checks "does the LLM produce reasonable output?" — the wrong question, because *reasonable* is a vibe, not a property. The right question: <strong>does the LLM produce output that satisfies the same set of structural and semantic invariants every time, across the input distribution we actually serve?</strong></p>

<p data-mode="engineer">The decision: build a Win Agent testing suite around invariants, not examples. Each test asserts a property about the output (must contain a valid CTA; must reference the customer's actual service catalog; must not propose a service the customer doesn't offer; must produce output within length bounds) — not a hand-crafted "expected string."</p>

## The Architecture

<p data-mode="engineer">Three layers — extends the AI Safety Layer pattern from <a href="../../adr/0013-llm-guardrails-ai-safety-layer.md">ADR-0013</a>:</p>

- **Input distribution.** A versioned corpus of real anonymised tenant inputs, sampled across the actual production distribution. Not toy fixtures. Toy fixtures pass; production breaks.
- **Invariant assertions.** A test asserts a property, not a string. *"For a nail salon's input, the output must reference services the salon actually offers."* *"The CTA must be a valid scheduling action."* *"The output must not contain a competitor's name."* Each invariant is a small testable predicate over the LLM's output — versioned, reviewable, owned next to the domain definition.
- **Determinism gate.** Each invariant is run N times against the same input (with caching off). The test is green only if all N runs pass. *Determinism is a property the suite enforces, not a hope the prompt expresses.*

```typescript
// win_agent_test.ts — invariant-based LLM testing
async function runInvariantSuite(
  input: AnonymisedTenantInput,         // input
  invariants: Invariant[],              // process: predicates over the output
  runs: number = 5
): Promise<TestResult> {
  const failures: InvariantFailure[] = [];

  for (let i = 0; i < runs; i++) {                       // determinism gate
    const output = await winAgent.generate(input);
    for (const inv of invariants) {
      const ok = await inv.check(input, output);         // data context: output + input
      if (!ok) failures.push({ run: i, invariant: inv.name, output });
    }
  }

  return failures.length === 0
    ? { status: 'pass' }                                 // output: ship-it green
    : { status: 'fail', failures };                      // output: regenerate / investigate
}
```

<p data-mode="engineer">Two clauses are load-bearing. First: <code>runs: number = 5</code> — a single green run is a coincidence; five green runs is a signal. The number is tunable per invariant criticality; high-stakes invariants run 10×. Second: <code>inv.check(input, output)</code> takes both — a semantic invariant cannot be evaluated against the output alone. "Does this output reference the tenant's actual services" requires knowing what services the tenant offers. The input travels with the output through the entire validation.</p>

## The Visibility Layer

<p data-mode="engineer">Test results aren't enough. The Win Agent ships, runs, hits real customer inputs every minute, drifts in ways no offline suite catches. So the discipline extends to production:</p>

- **Per-output invariant scoring.** Every Win Agent output in production is scored against the same invariants offline (cheap; runs on the response after it ships). The invariant code is the same code; the offline suite and the production scorer share the predicate library. A bug in an invariant is fixed in one place.
- **Regression alerts.** When the production invariant pass rate drops below a threshold for 2 consecutive hours, page on-call. The signal is faster than customer complaints — by the time a customer writes a ticket, the dashboard has been red for an afternoon.
- **Aggregated to a Metabase dashboard.** Pass rate by invariant, by tenant category, by model version. The same dashboard infrastructure (`docs/case-studies/sql-optimization.md`) that the success team uses for campaign funnels — repurposed for LLM quality. One dashboarding stack, two audiences.
- **Claude Code as the dashboard pair.** AI didn't just write the SQL; AI iterated on the dashboard layout against the real data shape. The line between engineer and AI collaborator faded in this surface specifically — I described what I wanted to see; Claude Code wrote the queries, iterated on chart shapes, pushed back on a bad axis choice. The judgment about *which invariants matter* stayed with me. The mechanical work of expressing them in SQL did not.

## Why This Was The Right Shape

<p data-mode="engineer">Tests for LLM products must be <em>invariant-based</em>, not <em>example-based</em>. Examples are vibes. Invariants are contracts. A contract you can run 10× per minute and rely on is the foundation of a deterministic LLM product. Example-based tests are seductive — they read like "the LLM should produce X for input Y" — but they age poorly: every model upgrade, every prompt edit, every fine-tune nudges the surface form of every output. Invariants survive surface drift because they are about properties, not phrasings.</p>

<p data-mode="founder">An LLM product without testing infrastructure is a product whose quality is only as good as the engineer's most recent inspection. At any non-trivial scale, that engineer is asleep, on call, on a flight, or solving the next thing. The testing suite is the engineer who never goes off-shift. At 1,500+ tenants and a customer-facing LLM in the revenue path, that is not a luxury; it is the price of running the product.</p>

## The Loop With ADR-0013

<p data-mode="engineer">ADR-0013 established the AI Safety Layer — request serializer, specialized prompts, response serializer + semantic guardrails — at the <em>runtime</em> perimeter. That ADR was the doctrine for catching a bad output before it shipped to a customer, in production, in real time. This case study is the same doctrine at <em>test time</em>: the same invariants the safety layer enforces in production are the invariants the test suite enforces before deployment. The two layers share predicates. A regression caught in CI is a regeneration avoided in prod; a regeneration in prod is a corpus entry for tomorrow's CI. The loop closes both ways.</p>

## The Lesson

- **Test invariants, not examples.** "Does the output reference services the tenant actually offers?" is testable; "Does the output sound nice?" is not. The first is a contract; the second is a vibe.
- **Determinism is a property the suite enforces.** N runs per input, all-pass-or-fail. The prompt does not have to be deterministic in spirit; the suite makes it deterministic in practice.
- **Production scoring closes the loop.** Offline tests catch known bugs; production scoring catches drift. You need both. The invariant library is the shared spine.
- **AI as the pair, not the author.** Claude Code wrote a lot of this SQL and dashboard layout. The judgment about which invariants matter stayed with the engineer. AI moves the velocity of the *expression* phase; it does not move the judgment of *which thing to express*.
- **Same doctrine, two surfaces.** ADR-0013 is the runtime perimeter; this case study is the test-time perimeter. One stack, both gates closed.

> *"Change the prompt and pray" is not a deployment strategy.* — me, on the Win Agent testing suite, mid-2025.
