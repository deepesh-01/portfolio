# ADR-0013 — LLM Guardrails (the AI Safety Layer)

- **Status:** Accepted
- **Date:** 2025-02 — March 2025 (formalised during the Stabilization Era; the "Iron Nail" incident was the trigger)
- **Deciders:** Deepesh Rathod
- **Supersedes:** —
- **Extends:** [ADR-0010 — Recovery-First Architecture (the Cynical Architect doctrine)](./0010-cynical-architect-recovery-first.md). The Cynical Architect builds with recovery from day one; the AI Safety Layer builds with *output verification* from day one. Same instinct, different layer — at the boundary between LLM and production.
- **Related:** `docs/blueprints.md` §12 (AI Safety Layer implementation), [`docs/case-studies/master-worker.md`](../docs/case-studies/master-worker.md) (the 30-second website-generator surface that motivated this), [ADR-0012 — Master-Worker Pattern](./0012-master-worker-redis-pattern.md).

## Context

The 30-second website generator went into pre-production with LLM-driven
content. Early outputs hallucinated *"iron nails"* on the homepage of a
nail salon. Funny once. Production-blocking from there onward.

The deeper realisation: an LLM at the perimeter of a multi-tenant
production system is a contractor, not an employee. Its output cannot
be trusted by default. It can be *useful* by default — and that is a
different thing from *correct*.

By February 2025 we had a fast, cheap, fluent contractor producing
outputs that, on the wrong day, would publish *"iron nails"* on a
salon's website that 480+ tenants were going to read. The fix was not
a better prompt. The fix was a **safety layer** at the perimeter — the
same instinct as Recovery-First (ADR-0010), applied at the LLM/output
boundary.

## Decision

Adopt **LLM Guardrails** as the default discipline for any LLM call
that produces output bound for a customer-facing surface. The minimum
guardrail set is three layers:

1. **Request Serializer.** A strict schema for what gets sent to the
   LLM — tenant context, business type, profile fields. No surprise
   inputs. The LLM cannot be tricked or confused by data we never put
   in front of it.

2. **Specialized Prompt Engineering.** Per-domain system prompts that
   anchor the LLM in the actual business category. A nail-salon prompt
   is not a hardware-store prompt is not a barbershop prompt. Few-shot
   examples drawn from validated outputs of the same category.

3. **Response Serializer + Semantic Guardrails.** Two-stage validation
   on the way out:
   - **Structural.** JSON shape, required fields, length bounds. If
     the LLM didn't return the schema, reject and regenerate.
   - **Semantic.** Domain-aware rules. *"Iron nails" + "nail salon"
     in the same output = automatic reject.* These rules live next
     to the domain definition; they are owned by whoever owns the
     domain (PM + engineering jointly), not buried in prompt text.

The LLM is treated as a **contractor**, not an **employee**: its work
is verified at the perimeter, not on faith.

## Consequences

**Positive**
- **The customer never sees an "iron nails" output.** Failures are
  caught at the perimeter, regenerated, and only the validated
  output ships.
- **Domain knowledge lives outside the prompt.** Semantic guardrails
  in code are versioned, reviewable, testable. Prompt-only guardrails
  are none of those things.
- **Regenerations are observable.** Each rejection is a metric. A
  spike in rejections for a domain is a signal — either the prompt
  drifted, the model changed, or the input class shifted. All
  three are findable from the rejection log.
- **The doctrine generalises.** Any LLM call producing output with
  customer or financial impact gets the same three-layer treatment.
  Internal-only or human-in-the-loop calls can use a lighter
  variant.

**Negative**
- **Latency on regenerations.** A rejected output costs the
  generator's cycle time again. Mitigation: budget for ≥1 regen in
  the SLA; the 30-second budget is really a 60-second worst case.
- **Semantic-rule maintenance.** The rules are domain-specific and
  drift as the product expands. Mitigation: rules co-located with
  domain definitions; a missing-rule alarm fires when a new
  business category arrives without guardrails attached.
- **The wrong test is "the prompt worked once."** The right test is
  "the validator rejected the bad outputs we already know exist."
  Building a rejection corpus (the "iron nails" hall-of-fame) is
  ongoing work, not a one-off setup.
- **Cost of the safety layer is real.** Two passes through validation
  per LLM call. For high-volume, low-stakes generations the layer
  may be overkill — pick the lighter variant or skip entirely with
  a documented exception.

## Alternatives considered
- **Prompt-only guardrails.** "Tell the model not to mention iron
  nails." Works on Tuesday, fails on Friday. Prompt drift, model
  drift, and adversarial inputs all break it. The validator is the
  honest place for the rule.
- **Human-in-the-loop review of every output.** Defeats the
  30-second product. Use sparingly: the highest-stakes surfaces
  (e.g. legal copy) can have HITL on top of the safety layer; most
  surfaces should not.
- **A third-party LLM-safety platform** (Lakera, Aporia, Guardrails
  AI). Useful but the domain-specific semantic checks still have
  to be ours. The platform can host the structural validation and
  some general-purpose checks; the salon-specific *"iron nails"*
  rule cannot come from a vendor.
- **Switch to a more "aligned" base model.** Helps, doesn't solve.
  The Iron-Nail class of failure is a domain-grounding problem,
  not an alignment problem. Better models reduce frequency. They
  do not eliminate it.

## Reversibility

Reversible per LLM-call surface. The validator is a wrapper around
the LLM call; removing it is a one-line change. The pattern as a
whole can be retired by moving guardrails into prompts and accepting
the failure rate — not recommended, but possible.

## Notes

The "Iron Nail" lesson named the doctrine. The hallucination of
*iron nails* on a nail-salon homepage was funny enough to land as a
team story; the same week, it became the canonical example for why
LLM outputs need a safety layer. Every new LLM-driven surface in the
stack since has shipped with the three-layer treatment by default.

The connection to the AI-Native Handover doctrine (manifesto
principle 4) is direct: an LLM-as-contractor model is the *right*
shape for AI-Native engineering — let the model do the velocity
work, but never the verification work.

See `docs/blueprints.md` §12 for the implementation sketch and
[`docs/case-studies/master-worker.md`](../docs/case-studies/master-worker.md)
for the broader context (the Master-Worker stack hosts the
LLM-generation jobs behind the queue, with the safety layer at the
perimeter).
