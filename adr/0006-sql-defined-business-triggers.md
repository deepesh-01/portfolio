# ADR-0006 — SQL-Defined Business Triggers (the LOCA pattern)

- **Status:** Accepted
- **Date:** 2024-02-XX (approximate — decision crystallised during the LOCA Ghost Sprint, Jan — Feb 2024)
- **Deciders:** Deepesh Rathod, with the LOCA founding team (Shambhav et al.)
- **Supersedes:** —
- **Related:** [`docs/loca_ghost_sprint.md`](../docs/loca_ghost_sprint.md), `docs/blueprints.md` §3 and §6

## Context

Every business-trigger rule change at LOCA required an engineering
deploy. The shape of these rules was always the same:

- "If a user joins from source X, send them message Y."
- "If a user's signup city is Z, route them to onboarding flow W."
- "If a user has been idle for N days, fire reminder R."

These were **business decisions** — owned by PM, growth, and ops — but
they lived inside application code, expressed as if-else chains in the
onboarding handlers, the campaign service, and the routing layer. Every
new condition required:

1. An engineer to translate the rule into code.
2. A pull request, code review, and merge.
3. A deploy cycle (minutes to hours, depending on what else was queued).
4. A QA pass on staging before promoting to prod.

At LOCA's pace — a 0-to-1 rebuild on a two-month legal clock with a
team of 10+ engineers — that lead time was a tax we couldn't afford.
The work was also misallocated: engineers were doing rule-by-rule
plumbing instead of systems-level work, and PMs were blocked on
engineering bandwidth for changes that were, in essence, configuration.

## Decision

Move trigger **conditions** and **actions** into a SQL table. A Lambda
pipeline reads the active rows on a schedule (and on event), evaluates
each row's condition against incoming events, and executes matching
actions. Adding a new business trigger is now a **SQL `INSERT`**, not
a code deploy.

The table schema:

```sql
create table business_triggers (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  condition_type     text not null,       -- e.g. 'signup_source', 'city_match', 'idle_days'
  condition_payload  jsonb not null,      -- the parameters for that condition
  action_type        text not null,       -- e.g. 'send_message', 'route_flow', 'tag_user'
  action_payload     jsonb not null,      -- the parameters for that action
  enabled            boolean not null default true,
  created_at         timestamptz not null default now(),
  last_evaluated_at  timestamptz
);

create index on business_triggers (enabled, condition_type);
```

One example row:

```sql
insert into business_triggers (name, condition_type, condition_payload, action_type, action_payload)
values (
  'welcome_msg_for_instagram_signups',
  'signup_source',
  '{"source": "instagram_ad_q1"}',
  'send_message',
  '{"template_id": "welcome_v3", "channel": "whatsapp", "delay_seconds": 300}'
);
```

The Lambda evaluator handles a fixed registry of `condition_type` and
`action_type` strings — adding a *new kind* of condition or action
still requires code, but adding a new *instance* of an existing kind
does not. In practice, the registry stabilised quickly and 90%+ of
new triggers were pure SQL.

## Consequences

**Positive**

- Non-engineers (PM, ops) can add or modify triggers via SQL without
  engineering involvement.
- Rule-change lead time goes from a deploy cycle (hours) to a SQL
  insert (minutes).
- Engineering attention is freed for systems-level work, not
  rule-by-rule plumbing.
- Audit trail is the SQL table itself — every rule's history is
  visible; `enabled=false` rows are tombstones, not deletions.

**Negative**

- The pipeline becomes a meta-system. A bad SQL insert can break
  business logic without a code review. **Mitigation:** the table
  lives in a controlled schema; only certain roles get `INSERT`
  rights; a `dry_run` mode validates conditions against a sample of
  recent events before persisting `enabled=true`.
- `condition_payload` and `action_payload` are `jsonb` — schema-less
  by design but require careful Lambda-side validation. A malformed
  trigger is otherwise silently inert (no error, no action), which is
  the worst failure mode.
- A busy trigger table evaluated frequently becomes its own
  bottleneck. The pattern needs careful indexing on the evaluation
  columns (`enabled`, `condition_type`) and a `last_evaluated_at`
  cap to avoid re-running settled rules on every tick.

## Alternatives considered

- **Hard-coded if-else chains in application code.** What we already
  had. The pain it caused is the reason for this ADR.
- **A rules-engine library (e.g. `json-rules-engine`).** Heavier
  dependency surface, less aligned with the rest of the stack —
  which favours SQL as the source of truth (see the
  Ignorance-Proof Logging System trigger pattern in
  `docs/blueprints.md` §3). A rules engine also hides the rule
  history; a SQL table makes it trivially auditable.
- **Feature flags as triggers (LaunchDarkly-style).** Boolean flags
  capture on/off, not *conditional action* logic. Wrong shape for
  the problem.

## Reversibility

Highly reversible per-trigger: any rule can be disabled by setting
`enabled=false` — no deploy, no code change. The pattern as a whole
can be retired by burning down the table once individual triggers
have either been moved back into application code or are no longer
needed. The Lambda evaluator is small and removable; nothing else in
the stack depends on the table existing.

## Notes

This pattern shipped during the LOCA Ghost Sprint (Jan — Feb 2024,
see [`docs/loca_ghost_sprint.md`](../docs/loca_ghost_sprint.md)).
LOCA itself wound down two months later for legal reasons unrelated
to the engineering. The SQL-defined trigger pattern survived as the
gold-standard approach for business-trigger logic in every project
that followed. The implementation sketch lives in
`docs/blueprints.md` §6; the full story is in
`docs/case-studies/loca-ghost-sprint.md`.
