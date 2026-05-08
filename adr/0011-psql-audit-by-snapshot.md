# ADR-0011 — Audit-by-Snapshot (Generic PSQL Before/After Logging)

- **Status:** Accepted
- **Date:** 2024-12 (December 2024 — formalised during the Collision & Resilience era)
- **Deciders:** Deepesh Rathod
- **Supersedes:** —
- **Extends:** [ADR-0010 — Recovery-First Architecture (the Cynical Architect doctrine)](./0010-cynical-architect-recovery-first.md). The Cynical Architect builds with recovery from day one; the Audit Architect builds with traceability from day one. Same instinct, different layer.
- **Related:** [`docs/blueprints.md`](../docs/blueprints.md) §3 (the original AFTER DELETE trigger) and §10 (the generalised before/after snapshot), [`docs/case-studies/psql-audit-function.md`](../docs/case-studies/psql-audit-function.md), [ADR-0006](./0006-sql-defined-business-triggers.md), [ADR-0008](./0008-sql-defined-logic-pattern.md).

## Context

The original audit work in December 2022 (Blueprint §3) was a per-table AFTER DELETE trigger written by hand. It captured the OLD row, the actor, and a timestamp. It was the right shape for the problem at the time — a single column of trust to rebuild after a row-deletion incident.

By December 2024, three things had changed:
- Zoca had ~480+ tenants and a much wider entity surface (leads, clients, source channels, services, variations, campaigns, …).
- The audit need was no longer "did a row get deleted?" but "exactly how did this entity get to the state it is in right now?" Updates, not just deletes. Before *and* after, not just OLD.
- The team was preparing for legal review and investor due diligence. *Audit-proof* was no longer a nice-to-have; it was the floor.

Hand-writing a 50-line trigger per entity hits the pattern-drift problem ADR-0008 already named: five copies of a pattern with no shared shape is how local customs are born. The audit pattern needed to be a *generator*, not a copy-paste.

## Decision

Adopt **Audit-by-Snapshot** as the default audit pattern for every entity in the core schema:

1. **One PostgreSQL function — `audit_attach(entity_name)`** — generates the shadow log table, the AFTER UPDATE capture function, and the trigger in one call. Adding audit coverage to a new entity is a single line in the migration that creates the entity.

2. **Shadow log table per entity** — `{entity}_audit_log` with `log_id`, `entity_id`, `updates_json` (jsonb containing `before` and `after` snapshots), `actor_id`, `updated_at_timestamp`. Indexed on `(entity_id, updated_at_timestamp desc)` for fast "give me the history of this row" queries.

3. **Snapshot via `row_to_json(OLD/NEW)`** — the live row shape, not a hand-listed column set. Schema drift can never silently break audit coverage.

4. **`WHEN (OLD.* IS DISTINCT FROM NEW.*)` filter** — load-bearing. A busy table that writes the same row twice does not double-log for free.

5. **Actor sourced from session GUC** — `current_setting('app.user_id', true)::int`. The application sets it on connection check-out; the trigger reads it without an extra arg.

Implementation lives in Blueprint §10. The story behind it lives in `docs/case-studies/psql-audit-function.md`.

## Consequences

**Positive**
- **Audit-proof for due diligence.** Every business-actionable change has a complete before/after trail with timestamp and actor. For legal or investor review, "show me how this lead got here" is one query, not an archaeology project.
- **Self-healing under schema drift.** Renaming a column, adding a column, dropping a column — the audit keeps capturing whatever the live row is. The trigger does not need to be touched.
- **Zero per-table boilerplate.** A new entity gets full audit coverage with one line in its migration: `select audit_attach('new_entity_name');`.
- **The Audit Architect doctrine is now codified.** Future engineers (and future agents — see manifesto principle 4) can read this ADR + Blueprint §10 + the case study and operate the pattern without me in the room.

**Negative**
- **Doubled write volume on UPDATEs.** Every UPDATE on a covered entity becomes one INSERT into the shadow log. The `WHEN` filter mitigates no-ops, but a write-heavy entity carries a real cost. Mitigation: shadow tables can be moved to a separate tablespace with cheaper storage; periodic archival to S3 once `updated_at_timestamp` is older than N months.
- **`updates_json` size on wide rows.** Entities with large jsonb columns or long text columns produce large audit rows. Mitigation: a future variant could store `before/after` deltas (only the changed columns) instead of full row snapshots — accepting the trade-off that querying the historical state requires reconstructing from the deltas.
- **Replication lag risk.** Logical replication of write-heavy entities now has 2× the write volume. Plan for it. Don't surprise the replica.
- **GDPR / data-subject deletion.** A user requesting deletion will trigger DELETE on the live entity, but the audit log retains the historical state. Policy: when a deletion request is honored, the corresponding `{entity}_audit_log` rows are also redacted (set `updates_json` to `{"redacted": true, "reason": "<request_id>"}`). Audit of redactions is its own audit row.

## Alternatives considered
- **Per-table hand-written triggers (the §3 original).** Already had it. Drift and per-entity boilerplate were exactly the problem.
- **Application-layer audit (the app writes audit rows after every successful update).** Misses any update that bypasses the app (psql shell, migration scripts, support hot-fixes). The trigger is the only honest place for the capture.
- **Logical decoding / WAL-based audit** (e.g., `pgaudit`, `wal2json`). Captures more — every operation, not just intentional updates — but the storage and operational cost is materially higher, and the per-entity granularity has to be re-derived downstream. Right tool for compliance-grade reconstruction; wrong tool for "show me this lead's history."
- **Event-sourcing the entire schema.** Right answer for a brand-new system. Wrong answer for a 480-tenant production system that needs audit attached *now* without rewriting the data layer.

## Reversibility

Highly reversible per-entity. `audit_attach` has a sibling `audit_detach(entity_name)` that drops the trigger + the function (and optionally the shadow table). The pattern as a whole can be retired by detaching every entity and burning down the shadow tables. The application code never depended on the audit log existing — the audit log is observation, not control.

## Notes

This ADR closes a loop that opened on December 13th, 2022 — the row-deletion incident. The pattern has been forming for two years. The Collision & Resilience era of December 2024 is when it crystallised into a generator, because the team's bandwidth no longer permitted per-table hand-written triggers.

The line in the manifesto's principle 4 (AI-Native Handover) — *"my knowledge is the company's moat, not the company's bottleneck"* — is operationalised here. An agent reading this ADR + Blueprint §10 + the case study has everything it needs to attach audit coverage to a new entity without me, and to debug an audit miss without me.
