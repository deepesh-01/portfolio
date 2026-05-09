# ADR-0017 — AI as Force Multiplier vs Liability (the Skills Paradox)

- **Status:** Accepted
- **Date:** 2026-Q1 (formalised during the AI Skills Era — March 2026)
- **Deciders:** Deepesh Rathod
- **Supersedes:** —
- **Extends:** [ADR-0013 — LLM Guardrails (the AI Safety Layer)](./0013-llm-guardrails-ai-safety-layer.md), [ADR-0015 — Deterministic LLM Testing](./0015-deterministic-llm-testing.md), [ADR-0016 — System Wisdom vs Framework Knowledge](./0016-system-wisdom-vs-framework-knowledge.md). ADR-0013 + ADR-0015 are the perimeter discipline at the *product* AI surface. ADR-0017 is the org-level doctrine for what happens when AI velocity is given to engineers without the perimeter discipline — and what to build to catch the regressions.
- **Related:** `docs/blueprints.md` §15 (Slack PR Reviewer + Agentic Docs Pipeline).

## Context

By Q1 2026, AI coding tools had matured to the point where non-engineers — PMs, ops, growth — could ship working code. The company adopted *"Claude Skills"*: a framework letting any team member generate features, automations, and surface changes via prompt-driven AI assistants.

The dashboards lit up. Velocity metrics looked exceptional. The cycle time from "PM has an idea" to "feature in production" collapsed from days to hours.

Underneath the dashboards, technical integrity collapsed. Features shipped with compromises a code review would have caught in 30 seconds. Production breaks became frequent. The class of failure was new: not bad-engineer code (which a senior engineer can spot in review), but *plausible-looking-but-subtly-wrong code* — the failure mode AI generation excels at producing when no expert is in the loop.

The doctrine the era named: **AI is a force multiplier for experts. AI is a liability for the uninitiated. The same tool produces both effects depending entirely on whether someone with system wisdom is in the verification loop.**

## Decision

Adopt the **Skills Paradox doctrine** as the strategic frame for any org-level decision about AI-coding adoption:

1. **Match AI velocity with audit-primitive investment.** Every increment of AI-generated code velocity must be matched by an increment of automated audit primitives (linting, type-checking, schema validation, runtime guardrails, deterministic-test invariants, semantic checks). *If audit primitives lag velocity, technical integrity collapses faster than the dashboards reveal.*

2. **Treat AI-driven code as a contractor's output, not an employee's.** ADR-0013's framing extends here: AI-generated code from a non-expert is structurally identical to outsourced code from a contractor without context. The verification discipline is the same. *Both need a perimeter.*

3. **Build the perimeter at the EM layer.** When the EM cannot personally review every PR (true at scale; truer with AI velocity), the EM builds the audit primitives that do. See Blueprint §15 — the Slack PR Reviewer and Agentic Docs Pipeline are the canonical shape of this work.

4. **Hold the integrity line publicly.** "Velocity is up" is not a defense against "production breaks are up." The doctrine demands the EM make this trade-off legible to executive leadership *before* the dashboards drift far enough to deny it.

## Consequences

**Positive**
- **Names a class of regression that velocity dashboards systematically hide.** *Plausible-but-wrong* code is invisible to throughput metrics; it surfaces only in production failures, customer reports, and post-incident reviews. The doctrine surfaces it earlier.
- **Justifies investment in audit-primitive infrastructure.** Without the doctrine, the audit-primitive layer reads as overhead. With it, the audit-primitive layer reads as the only thing keeping the velocity gain real.
- **Differentiates expert AI use from non-expert AI use without sounding elitist.** The expert *has the verification loop in their own head* (and confirmed by ADR-0013 / 0015 perimeter); the non-expert does not. The doctrine is about the *loop*, not the person.

**Negative**
- **The doctrine is a hard sell when the dashboards are still good.** Production-break frequency is a lagging indicator; throughput is a leading indicator. The doctrine asks leadership to weight a lagging indicator against a leading one — a hard ask in any rapid-growth company.
- **Audit-primitive infrastructure costs engineer-hours that velocity-driven leadership wants spent on features.** The trade-off is real and political.
- **The "AI is a liability for the uninitiated" framing can read as gate-keeping if delivered without the systemic gloss.** Frame the doctrine in terms of *loops and perimeters*, not *people and skills*, to keep it honest.

## Alternatives considered
- **Trust the AI tools.** Adopted at face value. Six months in, see *Phase 11 narrative on this site* for what the trust costs.
- **Block non-engineers from shipping code.** Reverses the velocity gain. Wrong direction. The right answer is *raise the audit-primitive floor*, not lower the AI ceiling.
- **Code-review every PR manually at the EM layer.** Doesn't scale. The whole reason the doctrine exists.
- **Hire more reviewers.** Helps, doesn't solve. Reviewer attention is a finite resource that scales sub-linearly with team size; AI-generated PR volume scales super-linearly. The audit primitives must close the gap.

## Reversibility

The doctrine is a vocabulary, like ADR-0016. Reversible by ignoring it; the consequences of ignoring it surface as production-break frequency curves. The right test of the doctrine is whether the next AI-velocity-driven regression class gets caught at PR time instead of customer time *because the doctrine made the response shape obvious*.

## Notes

The doctrine extends the Cynical Architect family (ADR-0010): *build the audit before the bug, with AI as both the bug source and the audit collaborator.* It pairs operationally with the Engineering-Manager-as-Builder pattern in Blueprint §15 — the Slack PR Reviewer is the *runtime* expression of this doctrine; the Agentic Docs Pipeline is the *handover-layer* expression.

The portfolio you are reading is, in part, a manifestation of the doctrine: documentation that an agent can ingest is the audit-primitive layer for the engineer's own knowledge transfer. *Build the audit, ship the velocity.*
