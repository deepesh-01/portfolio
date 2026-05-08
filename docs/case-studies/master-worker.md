# Case Study 10 — The Master-Worker Architecture

**Period.** February — March 2025.
**Surface.** Heavy media + website-generation tasks (each tenant onboarding could fan out to dozens of asynchronous jobs).
**Bottleneck.** The Node.js event loop was choking under sustained load. Server crashes during onboarding bursts.
**Outcome.** Redis-backed Master-Worker queue + Lambda-callback flow. **API stays non-blocking. Crashes eliminated. 480-user migration ran on this stack with 0% data loss and zero downtime.**

## Context — Where the Event Loop Broke

<p data-mode="engineer">The Node.js single-threaded event loop is a feature until it isn't. For request/response work it is excellent — one thread, one queue, predictable latency. For heavy work — media transformations, website-generation pipelines, fan-outs to dozens of LLM calls per tenant — sustained CPU on the main thread starves the API. By February 2025, onboarding bursts were producing visible server crashes. Not "slow under load"; <em>down</em>. A health-check failing, a pod restarting, a customer onboarding that had to be retried by hand.</p>

<p data-mode="engineer">The shape of the failure mattered. It wasn't a single slow endpoint; it was the API server's <em>everything</em> getting starved by background work that had no business being on the request thread. Login latency would spike during a website-generation burst three customers over. The event loop had become a shared resource that nobody respected.</p>

## The Decision — Get The Work Off The API Server

<p data-mode="engineer">The naive answers — bigger Node instances, child processes, worker threads — capped out before they hit the actual problem shape. The work was <em>bursty</em>, <em>long-running</em>, and <em>fan-out-shaped</em>. Worker threads share a process; a runaway website-generation job still pulls memory and GC pauses against the API. Child processes solve the GC problem but not the orchestration problem — you still need a queue, retries, dead-lettering, backpressure. At which point you have built half a queue, badly.</p>

<p data-mode="engineer">The decision: a <strong>Master-Worker</strong> architecture with <strong>Redis</strong> as the job orchestrator. The API server (Master) accepts requests, enqueues jobs to Redis, returns immediately. Specialized <strong>NestJS workers</strong> subscribe to the queue and process jobs. For the truly heavy slices — the LLM-driven website-generation step, the media-transformation pipeline — workers fan out to <strong>AWS Lambda</strong> with a custom <strong>callback flow</strong>: the Lambda processes, then pings a server-side endpoint when it's done. The Master sees the result; the Master never waited.</p>

## The Architecture

```
Client / API request
        │
        ▼
NestJS API server (Master)
   - validate request
   - enqueue job to Redis (returns 202 immediately)
        │
        ▼
Redis queue
        │
        ├── NestJS Worker(s) — subscribe, pick up jobs
        │     │
        │     ├── Light work: handled in the worker
        │     │
        │     └── Heavy work: invoke AWS Lambda
        │              │
        │              └── Lambda calls back to Master endpoint on completion
        │
        ▼
Master receives the callback, finalizes state, notifies the client
(websocket or polling, per the use case)
```

<p data-mode="engineer">Three tiers, three responsibilities. The Master owns request validation and state finalization. The Worker owns dispatch and light work. The Lambda owns the long-running, CPU-or-LLM-heavy slice. Each tier's job is bounded; each tier scales on its own axis.</p>

## The Code Shape (NestJS Worker)

```typescript
// worker.ts — subscribes to Redis, dispatches to handlers
async function workerLoop(): Promise<void> {
  const job = await redis.brpop('jobs:onboarding', 30);    // input: blocking pop
  if (!job) return workerLoop();                           // idle, continue

  const payload = JSON.parse(job[1]);                      // data context
  const handler = HANDLERS[payload.type];                  // process
  if (!handler) {
    await deadLetter(payload, 'unknown_type');             // recovery (ADR-0010)
    return workerLoop();
  }

  try {
    const result = await handler(payload);                 // do the work
    if (result.invokesLambda) {
      await invokeLambdaWithCallback(result);              // fan-out to Lambda
    } else {
      await notifyMaster(payload.callbackUrl, result);     // callback the API
    }
  } catch (err) {
    await deadLetter(payload, err.message);                // SQS-replay habit
  }
  return workerLoop();                                     // output: next job
}
```

<p data-mode="engineer">Two clauses are load-bearing. First: <code>brpop</code> with a 30-second blocking timeout — workers don't spin, they wait, and Redis wakes them when work arrives. Second: every failure path goes to a dead-letter, never to a swallowed exception. The Cynical Architect doctrine (ADR-0010) says <em>build the recovery path before the happy path</em>; this loop has exactly two exits, and both are observable.</p>

## The Lambda Callback Flow

<p data-mode="engineer">For heavy work — LLM-driven website generation, media transformations — the worker invokes a Lambda <em>asynchronously</em>. The Lambda is given a <code>callback_url</code> (a server-side endpoint on the Master). When the Lambda finishes, it POSTs the result to that URL. The Master treats the callback as the source of truth for "this job is done."</p>

<p data-mode="engineer">This decouples three things: (1) the API never waits on Lambda execution time; (2) Lambda invocations can run for the full 15 minutes if needed — well past any reasonable HTTP timeout; (3) the Master's job state is updated by the Lambda's success, not by the worker's polling — fewer race conditions, less coordination, no "did the worker miss the completion event" failure mode.</p>

<p data-mode="engineer">The callback endpoint is signed and idempotent. A Lambda retry doesn't double-finalize; a delayed callback doesn't overwrite a newer state. The Master is the arbiter, the Lambda is a producer, the contract between them is a single POST.</p>

<p data-mode="engineer">The same shape used in the Lambda Swarm (Case Study 08) — Step Functions orchestrating Lambdas keyed by S3 state — was a heavier hammer for an offline analytics workload. For online onboarding flows, Step Functions execution-history overhead is too much ceremony per job. Redis + signed-callback is the lighter, faster equivalent at the API tier. Same doctrine; different cadence.</p>

## Why This Was The Right Shape

- **The API server stays responsive.** Even under burst load, the Master's job is enqueue + return. No CPU-bound work touches the request-handler. The event loop's contract is restored: short, predictable, non-blocking.
- **Workers can be scaled independently.** When a feature ships that triples the work-per-tenant, we add workers — not API instances. Cost and scaling stay aligned with the actual bottleneck, not with the request volume.
- **Lambda for the heavy slices keeps cost honest.** The 15-minute LLM-generation cycle costs Lambda pricing, not "an EC2 instance sitting at 100% CPU for an hour" pricing. Same trade as the Lambda Swarm (Case Study 08): bursty parallel work is what Lambda was built for.
- **Recovery is free** (Cynical Architect doctrine — see ADR-0010). Failed jobs go to a dead-letter queue with the error reason. Replay is a single Redis push. Nothing to reconstruct, nothing to grep through logs for.

## The 480-User Migration — Round Two

<p data-mode="engineer founder">The same 480-user population that ran through the Phase 6 unified-service migration (Case Study 07) was migrated again — this time onto the Master-Worker stack with the audit-by-snapshot trail underneath (Case Study 09). <strong>0% data loss. Zero production downtime.</strong> The doctrines stacked: Cynical Architect (recovery) + Audit Architect (traceability) + Master-Worker (load-shedding) all in one operation. Each doctrine had been earned in a separate fire; the migration was the first time they ran together as a single stack.</p>

<p data-mode="founder">The shape was the same shape that closed the $6M round — fan-out where the data is parallel, queue where the work is bursty, callback where the latency is unbounded. The Lambda Swarm did it for the Revenue Opportunity engine (Case Study 08); the Master-Worker did it for the API tier. Same pattern, different surface. The doctrine compounds.</p>

## The Lesson

- **The Node.js event loop is a contract: keep it free, or move the work elsewhere.** The "elsewhere" is a queue. Don't try to thread your way around it — worker threads, child processes, and clever batching all converge on "you should have used a queue" once the work is bursty enough.
- **Redis as the job orchestrator beats SQS for low-latency enqueue + worker fan-out at this scale.** SQS still wins for cross-region, longer-retention, or higher-durability queues. Pick by the workload, not by reflex.
- **Lambda-callback flows trade architectural complexity for operational simplicity.** The Master's job state is one source of truth (the callback writes); the workers stay stateless; the Lambdas stay short-lived. Every tier's failure mode is bounded and observable.
- **A Master-Worker stack is also where the AI-Native engineering work compounds.** Most LLM calls in this stack are inside Lambdas, behind the queue, with the AI Safety Layer (ADR-0013) at the perimeter. The queue isolates the LLM's failure modes from the API's contract — a hallucinating model takes down a job, never a request.

<p data-mode="founder">This case study is the <strong>Monitor + Cost</strong> pillar of the Develop → Deploy → Monitor → Cost arc. A queue you can observe is a system you can size. The Master-Worker shape made the question "how much work is the platform doing right now" answerable — Redis depth, worker concurrency, Lambda invocations per minute, all visible — and once that question is answerable, every cost and capacity decision downstream becomes one query, not a guess.</p>

> *"The event loop is a contract. Keep it, or move the work."* — me, on the Master-Worker pivot, March 2025.
