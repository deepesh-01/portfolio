# ADR-0008 — SQL-Defined Logic as the Default for Trigger-Shaped Problems

- **Status:** Accepted
- **Date:** 2024-09-XX (mid — late 2024 — when the pattern crossed from
  Ghost-Sprint experiment to house default)
- **Deciders:** Deepesh Rathod, with the engineering team that grew
  through the Builder era
- **Supersedes:** —
- **Extends:** [ADR-0006 — SQL-Defined Business Triggers](./0006-sql-defined-business-triggers.md).
  ADR-0006 introduced this pattern for one specific use case
  (business-trigger rules); ADR-0008 generalises it.
- **Related:** `docs/blueprints.md` §3 (audit-logging triggers) and §6
  (business-trigger engine).

## Context

ADR-0006 worked, and worked beyond expectations. By mid-2024, the team
had organically copied the pattern to several other domains —
feature gates, retention-sweep rules, notification thresholds,
scheduling-cohort routing, and a handful of others. Each adoption was a
one-off: same shape, slightly different schema, no shared library, no
shared discipline. We were on the path to five different copies of the
same pattern, none of them documented as the same pattern. That's how
good ideas turn into local customs that the next engineer has to
re-derive.

The strategic question: should we recognise SQL-defined logic as the
*default* approach for any "if condition then action" problem and put
discipline behind it? Or keep it as a tactical pattern used
opportunistically, accepting the drift?

## Decision

Adopt SQL-defined logic as the **default** for trigger-shaped problems.
Anything with the shape "evaluate a condition, run an action" — where
the condition lives outside engineering's natural feedback loop (PM,
ops, growth, support) — should be modelled as a SQL table plus a small
evaluator, unless there's a clear reason not to.

The discipline:

1. **One canonical schema shape.** All trigger tables follow the
   structure ADR-0006 defined: `name`, `condition_type`,
   `condition_payload jsonb`, `action_type`, `action_payload jsonb`,
   `enabled`, `created_at`, `last_evaluated_at`. Domain-specific
   extensions are allowed; the core shape is non-negotiable.
2. **One canonical evaluator pattern.** Each domain gets its own Lambda
   evaluator, but they share the same lifecycle — read enabled rows,
   evaluate against the latest event or window, write
   `last_evaluated_at`, emit metrics on rule fires and rule misses.
3. **One canonical permission model.** `INSERT` rights are scoped per
   table. Non-engineers can edit certain tables (the marketing trigger
   table, the notification-threshold table) but not others (the
   feature-gate table, anything that touches money).
4. **Mandatory dry-run.** New rules are inserted with `enabled=false`
   and a `dry_run=true` flag that runs the condition without firing the
   action, logging what *would* have happened. Promotion to
   `enabled=true` requires reviewing the dry-run log.
5. **Mandatory naming convention.** Rule `name` is
   `<domain>_<intent>_<scope>` — e.g.
   `marketing_welcome_v3_instagram_signups`. Searchability is
   correctness.

## Consequences

**Positive**

- **PMs, ops, growth, and support own their trigger logic.** They add,
  modify, and disable rules without engineering deploys. Rule-change
  lead time is minutes, not hours-to-days.
- **Audit trail comes free.** The trigger table's history *is* the rule
  history. `enabled=false` rows are tombstones, not deletions.
- **AI-Native handover happens by default.** A future agent reading the
  org's documentation can answer "what triggers what?" by querying SQL,
  not by reading scattered application code.
- **Engineering attention rebalances.** Engineers maintain the
  evaluators and the permission model — high-leverage work — instead
  of plumbing rule-by-rule changes.

**Negative**

- **Multiple trigger tables = multiple meta-systems.** Each domain's
  evaluator must be written and maintained. If the Lambda evaluator is
  broken, all rules in that domain are silently inert — the worst
  failure mode.
- **Schema-less `jsonb` payloads.** Without disciplined Lambda-side
  validation, a malformed rule fails silently. The mitigation —
  dry-run mode plus payload schema validation per `condition_type` and
  `action_type` — is non-negotiable but easily forgotten.
- **Performance scaling.** A heavily-evaluated trigger table needs
  careful indexing on `(enabled, condition_type)` and a
  `last_evaluated_at` cap, plus per-domain rate limits on the
  evaluator. The pattern's simplicity hides its scaling traps.
- **Permission model is the new perimeter.** A SQL `INSERT` is now a
  deploy-shaped action. Treat the GRANT statements as the most
  security-critical part of the schema.

## Alternatives considered

- **Keep it tactical (don't generalise).** Continue using SQL-defined
  logic where it organically fits, without enforcing a shared shape.
  Rejected: invites pattern drift; future engineers re-derive instead
  of inheriting.
- **Adopt a third-party rules engine** (Drools, json-rules-engine,
  OpenFeature for flags). Rejected: heavier dependency surface, less
  alignment with the rest of the stack, hides rule history outside the
  database.
- **Codify rules as feature flags.** Rejected for the same reason as
  ADR-0006: boolean flags don't capture conditional-action logic;
  they're the wrong shape.

## Reversibility

Highly reversible per-table — any single trigger table can be retired
by burning down its rows and removing the evaluator Lambda. The whole
*pattern* can be retired by moving rules back into application code
domain-by-domain — slow but possible. Reversibility is one of the
things that made this pattern safe to adopt as a default in the first
place.

## Notes

This ADR is what it looks like when an experiment graduates into a
house default. Most patterns die because no one codifies the shape that
made them work the first time. The discipline added here — the
canonical schema, evaluator lifecycle, dry-run mandate, permission
scoping, naming convention — is the difference between a pattern that
gets re-discovered and a pattern that gets inherited.

Cross-reference: the AI-Native Handover doctrine in the journey and
journal docs depends on this pattern existing. A company whose
conditional logic lives in SQL is a company whose agent can answer
"what triggers what?" by querying. A company whose conditional logic
lives scattered across handlers is a company whose knowledge is a
bottleneck.
