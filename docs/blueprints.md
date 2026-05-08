# Technical Blueprints & Architectural Logic

> The systems behind the stories. Each blueprint is small enough to fit
> on one screen — that is the point.

## 1. Scheduling v1: The Integrity Engine

**The Problem.** High-concurrency booking against mutable service data
(prices change, providers change availability, services get renamed).

**The Solution.** Three locked-in invariants:

- **Entity Snapshotting.** Every booking stores a JSON snapshot of the
  service and price at the time of booking, so renaming a service later
  cannot rewrite history.
- **Transaction Blocks.** Every booking attempt runs inside a SQL
  transaction so two requests can never claim the same slot.
- **Slot Algorithm.** A custom Python utility that fetches provider
  availability, subtracts existing bookings, and overlays buffer times
  in a single pass — no N+1, no second round-trip.

**The "Pre-Bootup" Hygiene.** A script that runs *before* the Flask /
NestJS server accepts traffic, validating AWS Secrets Manager
connectivity and database migrations. If the environment is not healthy,
the process exits before binding to the port.

```python
# slot_algorithm.py — single-pass availability resolver
def available_slots(provider_id, day, services):
    windows  = fetch_provider_windows(provider_id, day)         # input
    bookings = fetch_bookings(provider_id, day)                  # input
    buffers  = fetch_service_buffers(services)                   # data context

    free = subtract(windows, bookings)                           # process
    free = overlay_buffers(free, buffers)                        # process
    return clip_to_slot_grid(free)                               # output
```

## 2. The Web-to-Mobile Event Bridge

**Context.** Website rendered inside a React Native WebView via iframe.
Two state stores (Redux on the app, vanilla on the web) needed to agree
without polling.

**Logic.** A bi-directional event bus:

- **Web → Mobile:** `window.ReactNativeWebView.postMessage(...)` to
  trigger native UI changes (e.g. opening the suggestions ledger).
- **Mobile → Web:** `webview.injectJavaScript(...)` to sync state from
  the app's Redux store back to the website's session.

```js
// web side — outbound
function emitToNative(type, payload) {
  if (!window.ReactNativeWebView) return;          // graceful no-op on desktop
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type, payload, ts: Date.now() })
  );
}

// web side — inbound (the app calls this via injectJavaScript)
window.__syncFromNative = function (state) {
  document.dispatchEvent(new CustomEvent('native:sync', { detail: state }));
};
```

## 3. The "Ignorance-Proof" Logging System

**The Trigger.** `AFTER DELETE` on every core table.
**The Action.** Writes the full `OLD.*` row, the actor's `user_id`, and
a `timestamp` into `security_audit_logs`.
**The Result.** Zero silently-lost rows since December 2022.

```sql
-- one trigger per core table, generated, not hand-written
CREATE TRIGGER audit_delete_bookings
AFTER DELETE ON bookings
FOR EACH ROW
INSERT INTO security_audit_logs (
  table_name, row_payload, actor_id, occurred_at
) VALUES (
  'bookings',
  row_to_json(OLD),
  current_setting('app.user_id', true)::int,
  now()
);
```

## 4. Recursive Polling Pattern (NestJS)

**Logic.** Instead of a standard cron, a self-invoking recursive
function with a static interval (or exponential backoff on failure).
This avoids drift and survives server restarts.

**State Management.** A `Last-Polled` pointer in Redis ensures that even
if the server restarts mid-cycle, no AWS event is missed in the gap.

```ts
// recursive-poll.ts
async function pollAwsEvents(): Promise<void> {
  const since = (await redis.get('aws:last_polled')) ?? '0';
  const events = await aws.listEvents({ since });

  for (const e of events) await handle(e);

  if (events.length) {
    await redis.set('aws:last_polled', events.at(-1)!.id);
  }
  setTimeout(pollAwsEvents, INTERVAL_MS);          // self-schedule, no cron
}
```

## 5. The "Pre-Bootup" Pipeline (general pattern)

A small idea with disproportionate payoff: do the failure *before* the
process binds to the port. If the environment is broken, the deploy
must fail loud, not serve a broken first request.

```bash
# entrypoint.sh
set -euo pipefail

./bin/check-secrets        # AWS Secrets Manager reachable, keys present
./bin/check-db             # migrations applied, no pending revs
./bin/check-redis          # PONG within 200 ms

exec gunicorn app:wsgi --workers 4 --bind 0.0.0.0:8000
```

## 6. The SQL-Defined Trigger Engine

**Context.** Every growth team eventually wants the same thing: "if a
user does X, send Y." The naive answer is to write a new handler, open
a PR, ship a deploy. That puts engineering in the critical path of
every marketing experiment.

**Concept.** Move the business-trigger logic from *code* into *data*.
A new rule becomes a SQL insert, not a code change.

**Implementation.** A Lambda pipeline reads enabled rows from a
`business_triggers` table, evaluates the condition payload against the
incoming event, and dispatches the matching action. Engineering owns
the evaluator; PMs and ops own the rows.

```sql
-- business_triggers — rules live in data, not in code
CREATE TABLE business_triggers (
  id               serial PRIMARY KEY,
  name             text        NOT NULL,
  condition_type   text        NOT NULL,   -- e.g. 'event_match'
  condition_payload jsonb      NOT NULL,   -- e.g. {"event":"signup","source":"referral_x"}
  action_type      text        NOT NULL,   -- e.g. 'send_email'
  action_payload   jsonb       NOT NULL,   -- e.g. {"template":"welcome_x"}
  enabled          boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- example row: "if user signs up from referral_x, send welcome_x"
INSERT INTO business_triggers (name, condition_type, condition_payload, action_type, action_payload)
VALUES (
  'welcome_referral_x',
  'event_match',
  '{"event":"signup","source":"referral_x"}'::jsonb,
  'send_email',
  '{"template":"welcome_x"}'::jsonb
);
```

**Impact.** A new growth rule shipped in minutes, not in a deploy
window. Non-engineers wrote SQL inserts; engineering kept its attention
on systems work. The rule-set became reviewable, auditable, and
revertable with `enabled = false` — no rollback PR required.

## 7. The Resilient Local Migrator

**Context.** 150GB of user media had to move from S3 Mumbai to
US-East-1. A single run took ~30 hours; the network would not stay up
that long, and neither would the laptop.

**Pattern.** Deterministic local-to-cloud sync that assumes failure
and treats every restart as routine.

**Logic.**

- **Manifest diff.** Scan the local manifest, hash-compare against the
  remote S3 listing, and produce the exact set of objects still owed.
- **Append-only progress log.** Every completed chunk is fsync'd into
  a persistent `.log`. Resume reads the last successful entry and
  continues from there.
- **Backoff on transient failure.** On `ECONNRESET`, sleep 5s and retry
  the same chunk — never skip, never reorder.
- **OS-level enabler.** `caffeinate` keeps the laptop awake for the
  full 30-hour run. The pipeline's resilience is irrelevant if the
  machine sleeps.
- **QC layer.** A batch is only marked complete after byte-for-byte
  integrity validation against the remote object hash.

```ts
// migrator.ts — the resume loop
async function migrate(manifest: Chunk[]): Promise<void> {
  const done = await readLog('.migrate.log');                  // input
  const todo = manifest.filter(c => !done.has(c.key));         // input

  for (const chunk of todo) {
    try {
      const bytes = await readLocal(chunk.key);                // process
      await s3.put(chunk.key, bytes);                          // process
      await verifyHash(chunk.key, chunk.sha256);               // QC
      await appendLog('.migrate.log', chunk.key);              // output (durable)
    } catch (e: any) {
      if (e.code === 'ECONNRESET') {
        await sleep(5_000);                                    // backoff
        manifest.unshift(chunk);                               // retry same chunk
        continue;
      }
      throw e;                                                 // fail loud
    }
  }
}
```

**Result.** 150GB migrated across regions with zero data loss across
multiple crashes and restarts. The script became reusable — every
later migration started from this same skeleton.

## 8. The Social Media Content Pipeline

**Context.** A multi-tenant SaaS where every paying customer needed a
credible social presence (Facebook Pages + Instagram Business) without
each one having to think like a marketer. The pipeline turns generated
content plus a posting schedule into actual posts on customer-owned
Meta accounts. Co-designed with a teammate.

**The Architecture.** Three layers, each replaceable on its own.

- **OAuth surface.** Meta's flows for FB Pages and IG Business
  accounts. Token refresh handled server-side; tenants never see a
  re-auth prompt unless Meta itself revokes. Scopes kept tight —
  `pages_manage_posts`, `instagram_content_publish`, nothing surplus.
- **Content calendar.** A tenant-scoped service with slots, recurrence
  rules, and content templates. Deliberately *generic*: it knows
  nothing about Meta. What fills a slot today is FB/IG; tomorrow it
  could be LinkedIn or Threads with no calendar rewrite.
- **Posting workers.** Queue-driven. Pick up due slots, hit the right
  Meta endpoint, log the result, reschedule on transient failure.
  Idempotent on retry — a post is keyed by `(tenant_id, slot_id)`, not
  by the Meta-side ID — so a retry can never double-post.

```sql
-- calendar_slots — platform-agnostic, tenant-scoped
CREATE TABLE calendar_slots (
  tenant_id     int         NOT NULL,                    -- input
  slot_id       uuid        NOT NULL,                    -- input
  scheduled_at  timestamptz NOT NULL,                    -- data context
  platform      text        NOT NULL,                    -- 'fb' | 'ig' | ...
  content_ref   uuid        NOT NULL,                    -- process: which asset
  status        text        NOT NULL DEFAULT 'pending',  -- pending|posted|failed
  external_id   text,                                    -- output: Meta post id
  PRIMARY KEY (tenant_id, slot_id)                       -- idempotency key
);
```

**The Generic-By-Design Win.** Decoupling the calendar from the
platform mattered the moment it shipped: the same calendar powered the
initial FB/IG launch with no platform-specific code in it. And when
Meta's API broke — which it does, regularly — only the posting layer
needed touching. The calendar and OAuth surfaces stayed still while
the worker was patched, which is the whole reason the boundary exists.

## 9. The Lambda Swarm — Step Functions + S3 JSON State

**Context.** A single-process Python pipeline took 2 hours to generate
per-tenant insights. Investors wanted a live demo; customers wanted
near-real-time. Two hours was unworkable for both. The boundary in the
data was already there — each tenant's insights were independent of
every other tenant's — so the architecture had to match the data, not
fight it. Co-built with a teammate.

**The Pattern.** A hierarchy of AWS Step Functions, narrow at the top
and wide at the leaves.

- **Master Orchestrator.** Gates each stage on the previous stage's
  completion. Knows nothing about tenants — only about stages.
- **Sub-orchestrators per analysis type.** One for scraping, one for
  LLM analysis, one for catalog audit. Each fans out across tenants
  inside its own execution.
- **Leaf Lambdas.** The actual per-tenant or per-cohort work, run in
  parallel. Stateless. Read their slice, write their slice, exit.

**State Surface — S3 JSON blobs.** State lives in S3, keyed by
`(tenant_id, stage)`. Each Lambda reads its slice, does its work,
writes the result back, emits completion. Step Functions track which
slices are done; the blobs are the durable record. Cheap, ordered,
recoverable, and the evaluator at each stage boundary is a tiny Lambda
that reads keys, not in-memory state.

**The Failure Modes That Drove The Design.**

- **Step Functions execution-history limits.** A single execution
  cannot hold the whole swarm — break the work across sub-orchestrators
  so no one history blows the cap.
- **Cold-start traps in custom recursion.** Self-recursive Lambdas at
  scale stall on cold starts and lose context. Replace with S3 +
  small evaluator at the stage boundary; the orchestrator decides
  when to advance.
- **Partial failures.** Idempotent per-`(tenant, stage)` writes. Resume
  reads existing state and skips what's already done — a re-run is
  cheap, not destructive.

```json
// state-machine.json — Master Orchestrator (stripped)
{
  "StartAt": "ScrapeStage",
  "States": {
    "ScrapeStage": {                                  // input: tenant_ids[]
      "Type": "Map",
      "ItemsPath": "$.tenants",
      "MaxConcurrency": 50,
      "Iterator": {
        "StartAt": "ScrapeTenant",
        "States": {
          "ScrapeTenant": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:::function:scrape_tenant",
            "End": true                               // process: per-tenant leaf
          }
        }
      },
      "ResultPath": "$.scrape",
      "Next": "GateScrape"
    },
    "GateScrape": {                                   // process: stage boundary
      "Type": "Task",
      "Resource": "arn:aws:lambda:::function:evaluate_stage",
      "Parameters": { "stage": "scrape", "tenants.$": "$.tenants" },
      "Next": "AnalyzeStage"
    },
    "AnalyzeStage": { "Type": "Task", "Resource": "arn:aws:states:::states:startExecution.sync",
      "Parameters": { "StateMachineArn": "arn:...:AnalyzeOrchestrator", "Input.$": "$" },
      "Next": "AggregateResults" },
    "AggregateResults": {                             // output: S3 result manifest
      "Type": "Task",
      "Resource": "arn:aws:lambda:::function:aggregate_results",
      "End": true
    }
  }
}
```

**Result.** 2 hours collapsed to ~5 minutes. ~24x speedup. The same
architecture later carried 480+ tenants without re-design — the swarm
widens at the Map step, nothing else changes. Idempotent state on S3
meant a mid-run failure cost minutes, not a re-run.

## 10. PSQL Snapshot Logic — Generic Before/After Audit

**Context.** §3 introduced per-table `AFTER DELETE` triggers in late
2022, after the row-deletion incident made silent data loss a board-level
problem. By late 2024, the same instinct had to scale: every entity,
every UPDATE, both states — before and after — without hand-writing a
50-line trigger per table. ADR-0008 (SQL-Defined Logic) had warned that
five copies of a pattern with no shared shape is how local customs are
born. This is what happens when that warning gets applied to audit.

**Concept.** A single PostgreSQL function — `audit_attach(entity_name)`
— that, given an entity name, generates the shadow log table, the
`AFTER UPDATE` trigger, and the before/after JSON capture function in
one call. Adding audit coverage to a new table is one line of SQL.

**The Schema.** One shadow log table per entity, generated, never hand-
written.

```sql
create table {entity}_audit_log (
  log_id              uuid primary key default gen_random_uuid(),
  entity_id           uuid not null,
  updates_json        jsonb not null,           -- {"before": {...}, "after": {...}}
  actor_id            int,
  updated_at_timestamp timestamptz not null default now()
);
create index on {entity}_audit_log (entity_id, updated_at_timestamp desc);
```

**The Trigger.** `row_to_json(OLD)` / `row_to_json(NEW)` read the live
row shape, so a column rename never silently breaks coverage. The
`WHEN` clause is load-bearing — it keeps no-op writes out of the log.

```sql
create or replace function audit_capture_{entity}() returns trigger as $$
begin
  insert into {entity}_audit_log (entity_id, updates_json, actor_id)
  values (
    NEW.id,                                              -- input
    jsonb_build_object(                                  -- process
      'before', row_to_json(OLD),                        -- data context (live shape)
      'after',  row_to_json(NEW)
    ),
    current_setting('app.user_id', true)::int            -- actor
  );                                                     -- output: one log row
  return NEW;
end;
$$ language plpgsql;

create trigger trg_audit_{entity}
after update on {entity}
for each row
when (OLD.* is distinct from NEW.*)        -- skip no-op updates; non-negotiable
execute function audit_capture_{entity}();
```

**The Three Invariants.**

- **Schema-drift-proof.** `row_to_json(OLD/NEW)` reads the live shape.
  Renaming a column doesn't silently break audit coverage — the new
  shape just shows up in the next log row.
- **No-op skip.** `WHEN (OLD.* IS DISTINCT FROM NEW.*)` keeps the audit
  log honest. A busy table that re-writes the same row twice does not
  double-log for free.
- **Idempotent attach.** `audit_attach('leads')` re-runs safely. `IF
  NOT EXISTS` guards on the table and trigger creation mean a redeploy
  is a no-op, not a duplicate.

**Result.** Every entity in the core schema gets a complete audit
trail with one SQL call per entity. "Show me how this lead got here"
becomes one query against `<entity>_audit_log` — no reconstruction,
no diff archaeology, no per-table trigger to read. The pattern that
§3 started by hand became a function the schema calls on itself.

## 11. The Master-Worker Pattern — Redis + NestJS Workers + Lambda Callbacks

**Context.** Heavy media handling and per-tenant website generation
were running on the same Node.js process that served the API. Under
onboarding bursts the event loop choked, requests stacked, and the
server crashed. The fix was not more CPU on the box. The fix was
getting the work off the API server entirely.

**The Pattern.** A clean master/worker split with a queue between them.

- **Master = NestJS API server.** Accepts the request, validates it,
  enqueues a job onto Redis, returns `202 Accepted` with a job id.
  Never does the heavy work itself. Stays responsive.
- **Workers = NestJS processes subscribed to Redis.** Pull jobs off
  the queue, do the work, write results to durable storage. Scale out
  horizontally; the queue is the load-balancer.
- **Lambda for the heavy slices.** When a job is genuinely CPU- or
  memory-bound (image processing, multi-page website synthesis), the
  worker invokes a Lambda and returns to the queue immediately. Lambda
  POSTs the completed payload back to a Master callback endpoint when
  it finishes. The 15-minute Lambda ceiling absorbs the long tail.

**Why Redis (not SQS).** Low-latency local enqueue from the API
process; sub-millisecond push, sub-millisecond pop. Simple worker
scale-out — point another NestJS process at the same Redis URL and
it joins the pool. Durability is sufficient for this workload (jobs
re-issuable from the source-of-truth tenant record on a worst-case
failure). Choose SQS when you need cross-region delivery or
multi-day retention; Redis wins when the job's lifetime is minutes
and the workers live next to the queue.

**The Recovery Habit (Cynical Architect — ADR-0010).** Failed jobs
do not disappear. They land on a dead-letter queue with the original
payload plus the error reason. Replay is a single Redis push from
ops once the underlying cause is fixed. Failure is a routine state,
not an incident.

```ts
// website_worker.ts — NestJS worker main loop
async function workerLoop(): Promise<void> {
  while (running) {
    const job = await redis.blpop('jobs:website', 5);              // input
    if (!job) continue;

    const ctx = await loadTenantContext(job.tenantId);             // data context
    try {
      const draft = await invokeLambda('render_website', {         // process
        tenant: ctx, payload: job.payload,
      });
      await persistDraft(job.tenantId, draft);                     // process
      await postCallback(job.id, 'done');                          // output
    } catch (err) {
      await redis.rpush('jobs:website:dlq',                        // recovery
        JSON.stringify({ job, reason: serialize(err) }));
    }
  }
}
```

**Result.** The API stayed responsive under burst — `p99` on the
master never crossed the queue-push budget. Workers scaled
independently of the API tier. Lambda's 15-minute ceiling absorbed
the heavy slices without blocking anything upstream. The 480-tenant
migration ran on this exact stack with **0% data loss and zero
production downtime**.

## 12. The AI Safety Layer — Serializers + Semantic Guardrails for LLM Outputs

**Context.** A 30-second website generator powered by LLMs. Early
outputs hallucinated *"iron nails"* on the homepage of a nail salon.
Funny once. Production-blocking from there onward — the moment that
ships to a paying tenant, the trust contract is broken.

**The Concept.** Treat the LLM as an untrusted contractor. Validate
the work at the perimeter — both the request shape going in and the
response shape coming out. Layer domain-specific *semantic*
guardrails on top of *structural* validation. Structure tells you
the contractor returned a JSON object with the right fields. Semantics
tell you the contractor did not write "iron nails" on a nail-salon
homepage.

**Three Layers.**

1. **Request Serializer.** Strict schema for what gets sent to the
   LLM — tenant context, business type, profile fields, brand voice
   tokens. No surprise inputs; no free-text concatenation. The
   request shape is the contract.
2. **Specialized Prompt Engineering.** Per-domain system prompts
   that anchor the LLM in the actual business category. A nail-salon
   prompt is not a hardware-store prompt. Few-shot examples are
   pulled from validated outputs of the same category, not from a
   generic exemplar pool.
3. **Response Serializer + Semantic Guardrails.** Structural
   validation first (JSON shape, required fields, length bounds),
   *then* domain-aware semantic checks. The pair `("iron nails",
   "nail salon")` together is an automatic reject; the worker
   triggers regeneration with a stricter prompt and the violation
   logged as a counter-example.

```typescript
// website_response_validator.ts
async function validateLlmOutput(
  output: string,
  domain: BusinessDomain
): Promise<ValidationResult> {
  // 1. Structural — shape and bounds                      // input
  const parsed = ResponseSchema.safeParse(output);
  if (!parsed.success) return reject(parsed.error);

  // 2. Domain-aware semantic guardrails                  // process
  const violations = SEMANTIC_RULES[domain](parsed.data);
  if (violations.length) return reject(violations);

  // 3. Pass — output is publishable                      // output
  return accept(parsed.data);
}
```

**The "Iron Nail" Lesson.** An LLM is a contractor, not an employee.
Verify the work at the perimeter. The cost of one bad website
hitting production — one tenant seeing "iron nails" on their nail-
salon homepage — is higher than the cost of every regeneration the
safety layer ever triggers. Regeneration is cheap; a broken trust
contract is not.

**Result.** The 30-second website generator went from "funny demo"
to "production system shipping for 480+ tenants." Reference
ADR-0013 for the strategic adoption of this layer as a non-optional
component of any LLM-in-the-loop pipeline.

## 13. Drizzle ORM Migrations + Terraform IaC — SOC2/HIPAA-Ready Infrastructure

**Context.** By Phase 9 (mid-2025) the company was preparing for
SOC2 + HIPAA. The two surfaces compliance auditors ask about first:
*what is in your database*, and *what is in your infrastructure.*
Both had to be reproducible, reviewable, and revertable from version
control. Same compliance-floor instinct as §3 — silent state is a
liability — applied to schema and infra instead of row-level deletes.

**Two interlocking patterns.**

- **Drizzle ORM** for the database surface. Every schema change is
  a typed migration, every migration's diff is reviewable, every
  migration is revertible.
- **Terraform** for the infrastructure surface. Every IAM role,
  security group, RDS parameter, and S3 policy lives in
  version-controlled HCL. No console-clicked infrastructure.

**Senior collaborator.** Worked with Himanshu Hazarika (IIT KGP '08)
on the Drizzle rollout and the early Terraform footprint.

### Drizzle ORM

**Why Drizzle, not Prisma / TypeORM.** Three reasons.

- **Generated SQL stays close to the SQL we already write.** No
  framework dialect to mentally translate during a review.
- **Migrations are real SQL diffs**, not opaque framework artefacts.
  A reviewer reads the migration in the language production speaks.
- **Typed schemas in TypeScript with no runtime overhead.** The
  types are the schema; the schema is the types.

**The migration shape.** Each file is a self-contained `up` / `down`
pair. The header comment carries the IPO framing — what the
migration consumes, what it does, what it leaves behind — so the
diff reads as a unit even months later during an audit.

```typescript
// drizzle/migrations/0042_add_consent_log_index.ts
// Input:   the live `consent_logs` table (~12M rows by Q3 2025)
// Process: add a partial index for compliance queries (HIPAA audit trail)
// Output:  a typed, revertible, review-friendly migration

import { sql } from 'drizzle-orm';

export const up = sql`
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consent_logs_recent
    ON consent_logs (tenant_id, created_at DESC)
    WHERE created_at > now() - interval '90 days';
`;

export const down = sql`
  DROP INDEX IF EXISTS idx_consent_logs_recent;
`;
```

### Terraform IaC

**The pattern.** Per-environment Terraform workspaces (dev /
staging / prod). Modules for each repeatable concern — RDS, ECS
service, IAM, S3 bucket policy. A new environment is a workspace
switch, not a re-creation effort.

**Compliance-relevant invariants encoded in HCL.**

- **All S3 buckets default to private + encrypted.** Public is an
  explicit override, reviewed in PR.
- **All RDS instances have backup-retention ≥ 7 days, encryption
  at rest enabled.** SOC2 minimum baked into the module.
- **IAM policies use least-privilege role-based access**; no
  wildcards on production resources. Wildcard in a prod plan fails
  CI.

```hcl
# terraform/modules/rds_audited/main.tf
# A compliance-shaped RDS module — every flag here is a SOC2/HIPAA review item
resource "aws_db_instance" "audited" {
  identifier                      = var.identifier
  engine                          = "postgres"
  storage_encrypted               = true                              # HIPAA at-rest encryption
  backup_retention_period         = max(var.backup_retention, 7)      # SOC2 minimum
  deletion_protection             = true                              # SOC2 change-control
  copy_tags_to_snapshot           = true                              # audit trail
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]         # HIPAA audit trail
  performance_insights_enabled    = true
}
```

### Why this pair, not just one

- **Drizzle alone** = reproducible schema, opaque infrastructure.
  *"Why is this RDS open to 0.0.0.0/0?"* — no answer in version
  control.
- **Terraform alone** = reproducible infrastructure, opaque schema.
  *"Show me when this column got added."* — `git log migrations/`
  is the answer; Terraform doesn't have it.
- **Together** = the floor compliance auditors expect. Everything
  that touches the production data path is a reviewable file in
  git.

**Result.** DB-migration visibility: every schema change diff'd,
reviewed, mergeable. **Zero "what is in production?" questions
during compliance prep.** Infrastructure visibility: every
parameter that compliance cares about is encoded in HCL with
policy guards, and a drift detector compares running state to HCL
state nightly — alerts on mismatch. The pair shipped during Phase
9 (April – November 2025). The infrastructure-as-code discipline
carried straight into the SOC2 + HIPAA audit windows.
