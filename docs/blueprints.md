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

## 6. The SQL-Defined Trigger Engine (LOCA)

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
