# ADR-0015 — Deterministic LLM Testing (Invariants Over Examples)

- **Status:** Accepted
- **Date:** 2025-Q2/Q3 (formalised during the Win Agent build, Phase 9)
- **Deciders:** Deepesh Rathod
- **Supersedes:** —
- **Extends:** [ADR-0013 — LLM Guardrails (the AI Safety Layer)](./0013-llm-guardrails-ai-safety-layer.md). ADR-0013 is the *runtime* discipline at the LLM perimeter; ADR-0015 is the *test-time* partner — the same instinct, applied before the output ever ships.
- **Related:** [ADR-0010 — Recovery-First Architecture (the Cynical Architect doctrine)](./0010-cynical-architect-recovery-first.md), [`docs/case-studies/win-agent-testing.md`](../docs/case-studies/win-agent-testing.md).

## Context

Most teams iterate on LLM products by tweaking the prompt, eyeballing
a handful of example outputs, and shipping. It works on Tuesday. It
fails on Friday — same prompt, same model, different inputs, different
month. The failure mode is invisible until a customer flags it.

By Phase 9 the Win Agent — Zoca's LLM-powered conversion product —
was a customer-facing surface generating revenue line by line. The
discipline that worked for code (tests, CI, rollback) had to land on
prompts and LLM outputs. *"Change the prompt and pray"* is not a
deployment strategy.

The deeper realisation: a test suite that asserts *"this exact output
matches this exact string"* is the wrong test for LLM products. LLMs
do not produce exact strings; they produce outputs that satisfy (or
violate) properties. The test must be a property, not a string.

## Decision

Adopt **invariant-based deterministic testing** as the default
discipline for any LLM-powered surface that ships to customers:

1. **Test invariants, not examples.** Each test asserts a property
   of the output: *"must reference services the tenant actually
   offers"*; *"must produce a valid CTA"*; *"must not contain a
   competitor's name"*. The test is a small predicate over the
   `(input, output)` pair, not a hand-crafted expected string.

2. **Versioned input corpus.** Tests run against a versioned corpus
   of real anonymised tenant inputs, sampled across the production
   distribution. *Toy fixtures pass while production fails*; the
   corpus is what closes that gap.

3. **Determinism gate.** Each invariant runs N times against the
   same input (caching off). The test is green only if all N runs
   pass. *Determinism is a property the suite enforces, not a hope
   the prompt expresses.*

4. **Production scoring closes the loop.** The same invariants run
   offline against production outputs after they ship. Aggregated
   to a Metabase dashboard. Pass-rate drop alerts on-call faster
   than customer complaints would.

5. **The test suite is the bar to ship, not the bar to pass after
   shipping.** A prompt change that doesn't pass the invariant suite
   does not get merged. The discipline lives at the PR boundary,
   not after.

## Consequences

**Positive**
- **Regression caught at PR time, not customer time.** Days of
  exposure window collapse to minutes.
- **Determinism is an enforced property.** The N-run gate makes the
  Tuesday-works/Friday-breaks failure mode visible before ship.
- **Production scoring closes the offline → online gap.** Drift
  the offline suite couldn't predict still surfaces; just not via
  customer reports.
- **AI-Native testing compounds.** The invariant predicates can be
  written in collaboration with the same LLM that produces the
  outputs — *use the contractor to inspect the contractor's work*,
  with a human owning which invariants matter.

**Negative**
- **Invariant authoring is real work.** A good invariant is a small
  predicate that captures a real failure mode without over-fitting.
  Writing them is a senior-engineering task, not a junior one.
- **The corpus drifts.** Real production inputs change distribution
  over time. The corpus needs periodic refresh; an ossified corpus
  silently stops representing reality.
- **N-run gates cost LLM credits.** Five runs per input per
  invariant per CI run is real money. Mitigation: cache the
  N-run *signature* (which invariants passed); only re-run on
  prompt or model change.
- **Determinism is a property of the suite, not a property of the
  LLM.** A model upgrade can change the failure distribution
  overnight. The suite catches this; the suite is also the thing
  that has to be re-validated against the new model.

## Alternatives considered
- **Eyeball testing on a handful of examples.** What we had. The
  pain it caused is the reason for this ADR.
- **Exact-string assertions** (classic unit-test shape). LLMs do
  not produce exact strings reliably. Non-starter.
- **Embedding-similarity tests.** Useful as one of several
  invariants — *"output should be semantically close to the
  reference cluster"* — but never the only one. Embedding
  similarity is necessary, not sufficient.
- **Human-in-the-loop QA only.** Defeats the velocity that AI
  velocity promised. Use HITL on the highest-stakes outputs as
  a layer above the suite, not instead of it.
- **Trust the foundation model.** Foundation-model evals at the
  vendor's lab are not your product's evals on your product's
  inputs. Ship your own suite.

## Reversibility

Reversible per LLM surface. The invariant suite is a wrapper around
the LLM call; removing it returns the surface to "trust the prompt"
mode — at the cost of also returning to the failure modes ADR-0015
exists to prevent. The discipline is reversible; the consequences
of reversing it are not.

## Notes

ADR-0013 (LLM Guardrails) is the *runtime* perimeter discipline:
serializers + prompts + semantic guardrails on every output that
ships to a customer. ADR-0015 is the *test-time* partner: invariant
suites that gate prompt and model changes before they reach the
runtime perimeter. Together they form the LLM-product floor that
the AI-Native engineering doctrine (manifesto principle 4) rests on.

The case study `docs/case-studies/win-agent-testing.md` walks the
Win Agent example end-to-end, including the production-scoring
dashboard built with Claude Code as the pair-programmer.
