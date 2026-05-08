# Case Study 09 — The PSQL Audit Function

**Period.** December 2024.
**Surface.** Database-level audit logging for every entity in the Zoca core schema (leads, clients, source channels, services, etc.).
**Stakes.** "Audit-proof" traceability for legal review and investor due diligence — every business action traceable to its origin.
**Outcome.** A single PostgreSQL function generates a shadowed log table for any entity, automatically capturing nested `before` / `after` JSON snapshots on every row update.

## Context — From SEV-1 Trigger to Doctrine

<p data-mode="engineer founder">December 2022 was the row-deletion incident. The fix that came out of it — Blueprint section 3, the "Ignorance-Proof Logging" pattern — was one `AFTER DELETE` trigger per core table, hand-written, that wrote `OLD.*` plus an `actor_id` and a timestamp into a single `security_audit_logs` table. It was small. It worked. Zero silently-lost rows since. But it was scoped narrowly on purpose: deletes only, one shape, hand-maintained.</p>

<p data-mode="founder engineer">Two years later, the surface had changed. We had just closed the $6M round. Investors had asked the question every investor eventually asks — *show me how this lead got here, end to end* — and SOC2 / HIPAA prep was on the calendar. The audit requirement was no longer "don't lose a row." It was "every business-actionable change on every entity must be reconstructible — what it was, what it became, who did it, when." Deletes were the smallest part of that. Updates were the bulk of it.</p>

<p data-mode="engineer">The Cynical Architect (ADR-0010, Recovery-First) had built the recovery path before the happy path. The Audit Architect doctrine grew alongside it: *build the trace before the bug.*</p>

## The Decision — One Function, Generates the Whole Family

<p data-mode="engineer">The naive approach was to scale the December-2022 pattern: write one trigger per table, hand-maintained, now with `BEFORE` and `AFTER` payloads instead of just `OLD`. That hits the same drift problem ADR-0008 (SQL-Defined Logic) called out for business triggers — five hand-written copies of the same pattern, none of them documented as the same pattern, each one slightly out of step with the others six months in.</p>

<p data-mode="engineer">The decision: a single PostgreSQL function — `audit_attach(entity_name)` — that, given an entity name, generates the shadow log table, the per-entity capture function, and the `AFTER UPDATE` trigger in one call. Adding audit coverage to a new entity is one SQL statement at the bottom of its migration, not a 50-line hand-written trigger that drifts from its siblings.</p>

<p data-mode="engineer">The shape that mattered: the *generator* is hand-written once. The *triggers* are generated. The audit family stays in lock-step because there is exactly one definition of what audit means, and it lives in one function.</p>

## The Schema

The shadow log table, one per entity, generated:

```sql
-- per-entity shadow log table (auto-generated)
create table {entity}_audit_log (
  log_id              uuid primary key default gen_random_uuid(),  -- output
  entity_id           uuid not null,                               -- FK to live row
  updates_json        jsonb not null,                              -- {"before":..,"after":..}
  actor_id            int,                                         -- app context
  updated_at_timestamp timestamptz not null default now()
);

create index on {entity}_audit_log (entity_id, updated_at_timestamp desc);
```

<p data-mode="engineer">The index is keyed on `(entity_id, updated_at_timestamp desc)` because every read against this table is "show me the history of this row, newest first." That's the only access pattern. The index matches it exactly.</p>

The trigger body, one per entity, generated alongside:

```sql
-- generated trigger body (one per entity)
create or replace function audit_capture_{entity}() returns trigger as $$
begin
  insert into {entity}_audit_log (entity_id, updates_json, actor_id)
  values (
    NEW.id,                                                        -- input
    jsonb_build_object(                                            -- process
      'before', row_to_json(OLD),
      'after',  row_to_json(NEW)
    ),
    current_setting('app.user_id', true)::int                      -- data context
  );
  return NEW;                                                      -- output
end;
$$ language plpgsql;

create trigger trg_audit_{entity}
after update on {entity}
for each row
when (OLD.* is distinct from NEW.*)
execute function audit_capture_{entity}();
```

<p data-mode="engineer">Two clauses are load-bearing. First: <code>row_to_json(OLD)</code> and <code>row_to_json(NEW)</code> read the live row shape — not a hand-listed column projection. Whatever the table looks like at trigger-fire time, the snapshot captures. Add a column tomorrow, the trigger captures it tomorrow with no edit. Second: <code>WHEN (OLD.* IS DISTINCT FROM NEW.*)</code> filters out no-op updates — rows touched by an `UPDATE` statement that didn't actually change anything. Without that clause, a busy table doubles its write volume in the audit log for nothing. With it, the audit log only carries real state transitions.</p>

## The Generator Function

The meta-function takes an entity name and produces the whole family:

```sql
-- audit_attach('leads') -- and the entity has a full audit surface
create or replace function audit_attach(entity_name text) returns void as $$
declare
  log_table text := entity_name || '_audit_log';
  fn_name   text := 'audit_capture_' || entity_name;
  trg_name  text := 'trg_audit_' || entity_name;
begin
  -- shadow log table (idempotent)
  execute format('create table if not exists %I (
    log_id uuid primary key default gen_random_uuid(),
    entity_id uuid not null,
    updates_json jsonb not null,
    actor_id int,
    updated_at_timestamp timestamptz not null default now()
  )', log_table);

  -- read-pattern index (idempotent)
  execute format('create index if not exists %I on %I (entity_id, updated_at_timestamp desc)',
                 log_table || '_idx', log_table);

  -- per-entity capture function (omitted for brevity — same shape as above)
  -- per-entity AFTER UPDATE trigger (omitted for brevity — same shape as above)
end;
$$ language plpgsql;
```

<p data-mode="engineer"><code>format('%I', ...)</code> uses Postgres's <em>identifier</em> escaping — the right one for dynamically-named tables and triggers. Anything else is an injection surface. <code>%I</code> is non-negotiable in code that builds DDL from a string.</p>

## Why This Was The Right Shape

<p data-mode="engineer">**Idempotent.** Re-running <code>audit_attach('leads')</code> is safe. Every <code>CREATE</code> in the generator carries <code>IF NOT EXISTS</code> or <code>CREATE OR REPLACE</code>. New entities onboard at the bottom of their own migration with one extra line; existing entities are not disturbed by re-runs.</p>

<p data-mode="engineer">**Self-healing against schema drift.** The trigger captures <code>row_to_json(NEW)</code>, not a hand-listed projection. A developer renames a column, adds a column, drops a column — the trigger keeps capturing whatever the live row looks like. Schema drift cannot silently break audit coverage. There is no "we forgot to update the trigger when we added the field" failure mode.</p>

<p data-mode="engineer">**Cheap on writes that don't change anything.** The <code>WHEN (OLD.* IS DISTINCT FROM NEW.*)</code> clause means the trigger doesn't fire on no-op updates. ORM frameworks happily issue full-row updates where nothing actually moved; the audit log stays clean.</p>

<p data-mode="founder engineer">**Audit-proof for due diligence.** Every business-actionable change — every lead status update, every client-tier change, every service price modification — has a complete <em>before / after</em> trail with timestamp and actor. For legal review or investor diligence, "show me how this lead got here" is a single query against <code>leads_audit_log</code>, ordered by timestamp.</p>

## The Cynical Architect Doctrine — Evolved

<p data-mode="engineer founder">Recovery-First (ADR-0010) said: <em>build the recovery path before the happy path</em>. The Audit Architect doctrine adds: <em>build the trace before the bug.</em> When something goes wrong — a deleted row, a misclassified lead, a price change that shouldn't have happened — the audit log is already there. You don't reconstruct the state from logs and Slack messages. You query it.</p>

<p data-mode="founder">For an early-stage company that has just closed $6M and is staring at SOC2 / HIPAA prep, "every change is traceable" is not a feature. It is the floor. You build it once and it stops being a question.</p>

## The Lesson

<p data-mode="engineer">- **Generic audit beats per-table audit.** Five hand-written triggers drift; one generator function doesn't. The generator is the contract — every entity using it is auditable in the exact same shape, no exceptions.
- **`row_to_json` over hand-listed columns.** Schema drift can't break what reads the live row.
- **`WHEN (OLD.* IS DISTINCT FROM NEW.*)` is non-negotiable.** Otherwise a busy table double-writes for nothing — and the audit log becomes a compliance burden instead of a compliance answer.
- **`format('%I', ...)` for identifiers.** Anything less in dynamic DDL is an injection surface.
- **Audit is a Day-0 design, not a Day-1 retrofit.** Retrofitting audit on a multi-million-row table after the fact is a different problem than calling `audit_attach('leads')` when you create the table. Put the line in the migration.</p>

<p data-mode="founder">This case study is the **Monitor** pillar of the Develop → Deploy → Monitor → Cost lifecycle. You cannot monitor what you cannot trace. The audit function makes traceability a default property of every entity in the schema, not a per-table favour you have to remember to do.</p>

> *"Build the trace before the bug. The bug is already in the calendar."* — me, on the audit-by-snapshot pattern, December 2024.
