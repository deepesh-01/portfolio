# ADR-0012 — Master-Worker Pattern (Redis + NestJS Workers + Lambda Callbacks)

- **Status:** Accepted
- **Date:** 2025-02 (decision crystallised in February 2025 during the Stabilization Era)
- **Deciders:** Deepesh Rathod
- **Supersedes:** —
- **Related:** [ADR-0009 — Lambda Swarm](./0009-lambda-swarm-step-functions.md), [ADR-0010 — Recovery-First Architecture](./0010-cynical-architect-recovery-first.md), [`docs/case-studies/master-worker.md`](../docs/case-studies/master-worker.md), `docs/blueprints.md` §11.

## Context

The Node.js event loop is a single-threaded contract: keep it free, or
move the work elsewhere. By February 2025, the API server was hosting
heavy work — media transformations, website-generation pipelines that
fan out to dozens of LLM calls per tenant — directly inside request
handlers. Onboarding bursts were producing visible server crashes. Not
"slow"; *down*. The fix was not bigger instances; the fix was getting
the work off the API server.

Standard answers — child processes, worker threads, more memory —
capped out before they hit the actual problem shape. The work was
*bursty*, *long-running*, and *fan-out-shaped*. The API server should
not be the place that work runs.

## Decision

Adopt a **Master-Worker** architecture with **Redis** as the job
orchestrator:

- **Master.** The NestJS API server. Accepts requests, validates,
  enqueues to Redis, returns 202 immediately.
- **Workers.** NestJS processes subscribed to Redis. Pick up jobs,
  dispatch to handlers, write results back.
- **Heavy work → Lambda with a callback flow.** Workers that hit
  slices needing more than ~minutes of compute (LLM-driven
  website-generation, media transformations) invoke AWS Lambda
  asynchronously with a `callback_url`. The Lambda POSTs its result
  to the Master on completion. The Master's job state is updated by
  the Lambda's callback, not by the worker's polling.
- **Recovery built in.** Failed jobs go to a dead-letter queue with
  the error reason. Replay is a single Redis push. (Inherited from
  ADR-0010 — Cynical Architect / Recovery-First.)

## Consequences

**Positive**
- **API server stays responsive under burst.** Enqueue + return is a
  constant-time operation. CPU-bound work never touches the
  request-handler.
- **Workers scale independently of API instances.** When a feature
  triples the work-per-tenant, we add workers — not API capacity.
  Cost and scaling stay aligned with the actual bottleneck.
- **Lambda absorbs the heavy slices honestly.** Pricing is per
  invocation + duration; idle minutes don't cost. EC2 sitting at
  100% for an hour would.
- **The Lambda-callback flow eliminates a class of race conditions.**
  The Master's job state has a single writer (the callback) per job,
  not the worker's poll loop fighting with the Lambda's progress.
- **Recovery is the same shape as in ADR-0010.** Dead-letter queues
  + manual replay; no per-job recovery code.

**Negative**
- **Three moving parts (API, workers, Lambda) instead of one.**
  Operational surface area grows. Monitoring must cover all three
  layers; a missed alert in the worker layer is a silent failure.
- **Redis becomes load-bearing.** A Redis outage takes the entire
  enqueue/dispatch pipeline down. Mitigation: managed Redis with
  replicas, plus a fall-back path on the Master that synchronously
  rejects with 503 (so clients can retry) rather than queuing into
  a void.
- **Callback URLs are a security surface.** The Master endpoint that
  receives Lambda callbacks must be authenticated (signed tokens,
  IP allow-listing, or both). Otherwise, anyone with the URL can
  poison job state.
- **Cold starts on the Lambda side.** Bursty traffic occasionally
  pays cold-start latency. Provisioned concurrency where the SLA
  demands it.

## Alternatives considered
- **Bigger Node instances + worker threads.** Caps out at the box.
  Bursty fan-outs still saturate the box's IO and CPU. Wrong axis
  to scale on.
- **SQS instead of Redis.** SQS is the right answer for cross-region,
  long-retention, or high-durability queues. For low-latency local
  fan-out at this scale, Redis enqueue/dispatch is materially faster
  and cheaper, and the durability difference doesn't matter for this
  workload (jobs that fail are replayable from upstream state).
- **Pure synchronous Lambda invocation from the Master.** Removes the
  worker layer at the cost of the Master holding the connection for
  the Lambda's duration. The whole reason for the change is to *not*
  make the Master wait.
- **A heavyweight job-queue product (Bull, Sidekiq-style).** Drags in
  a UI surface and a dependency tree we don't need. Redis BLPOP + a
  small handler registry covers 95% of the value.

## Reversibility

Highly reversible by component. The Master-Worker boundary is a
Redis enqueue + a worker process; either can be replaced. The
Lambda-callback layer can be inlined back into the worker if a
slice's compute shrinks below the worker's tolerance. The whole
pattern can be retired by moving handler code back into the API
server, accepting the load consequences. Nothing in the data layer
depends on the architecture choice.

## Notes

ADR-0009 (Lambda Swarm) is this ADR's older sibling. ADR-0009 was
about *fan-out parallelism* across hundreds of independent units
(per-tenant insights). ADR-0012 is about *load-shedding* the
synchronous request path. Both use Lambda. Both use job-shaped state.
They compose: a Master-Worker handler can itself trigger a Lambda
Swarm for the per-unit fan-out underneath.

The pattern shipped in February 2025 and carried the 480-user
migration through Round Two with 0% data loss and zero downtime —
see [`docs/case-studies/master-worker.md`](../docs/case-studies/master-worker.md)
for the full story.
