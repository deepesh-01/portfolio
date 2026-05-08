# ADR-0009 — The Lambda Swarm: Step Functions Hierarchy + S3 JSON State

- **Status:** Accepted
- **Date:** 2024-08 (the $6M funding sprint)
- **Deciders:** Deepesh Rathod, with a partner on the Arrow team
- **Supersedes:** —
- **Related:** [`docs/case-studies/lambda-swarm.md`](../docs/case-studies/lambda-swarm.md), `docs/blueprints.md` §9, [`docs/product-growth.md`](../docs/product-growth.md) §5

## Context

A "Revenue Opportunity" insights pipeline took 2 hours per run as a
single-process Python script. Investors needed a working version in 5
minutes. After the funding sprint, the same engine had to run for 480+
live tenants on a regular cadence. The bottleneck was not CPU — it was
the loop. Each tenant's analysis was already independent of every other
tenant's; the parallelism existed in the data, not in the code that
processed it.

Standard answers — bigger Python instance, threaded loop, async IO —
capped out at ~30 — 40 minutes. An order of magnitude off. The right
answer was a different architecture, not a faster loop.

## Decision

A **Swarm of AWS Lambdas** orchestrated by a **hierarchy of AWS Step
Functions** with **S3 JSON blobs as the durable state surface**:

- **Master Orchestrator (Step Function)** — gates each stage on the
  previous stage's completion.
- **Sub-orchestrators (Step Functions)** — one per analysis type
  (scraping / LLM analysis / catalog audit). Each fans out to its own
  pool of Lambdas.
- **Leaf Lambdas** — per-tenant or per-cohort, doing the actual work in
  parallel.
- **State** — S3 JSON blobs keyed by `(tenant_id, stage)`. Each Lambda
  reads its slice, writes its result, emits completion. The next stage
  only starts when its prerequisite slices exist.

Stripped state-machine sketch — fan-out across tenants, then aggregate
at the stage boundary:

```
{
  "Comment": "Stage: scraping fan-out + aggregator",
  "StartAt": "FanOutTenants",
  "States": {
    "FanOutTenants": {
      "Type": "Map",
      "ItemsPath": "$.tenants",
      "MaxConcurrency": 100,
      "Iterator": {
        "StartAt": "ScrapeTenant",
        "States": {
          "ScrapeTenant": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:::function:scrape-leaf",
            "ResultPath": "$.s3_slice",
            "End": true
          }
        }
      },
      "ResultPath": "$.slices",
      "Next": "AggregateStage"
    },
    "AggregateStage": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:::function:stage-aggregator",
      "Comment": "Reads (run_id, stage) slices from S3, emits completion.",
      "End": true
    }
  }
}
```

## Consequences

**Positive**

- **Parallelism matches the data shape.** Each tenant runs
  independently. Throughput scales by adding Lambda concurrency, not by
  re-architecting.
- **Resume is free.** Crashed mid-run? Restart the Step Function.
  Existing `(tenant, stage)` slices in S3 are skipped. Only outstanding
  work re-executes.
- **Observability is durable.** S3 *is* the audit trail. You can
  re-construct the run state of any tenant at any stage by reading the
  bucket.
- **Cost is comically low for parallel fan-outs.** Lambda
  per-invocation pricing for short-lived parallel work is cheaper than
  running the equivalent EC2 capacity continuously.

**Negative**

- **Step Functions execution-history limits.** A single Step Function
  execution holds bounded history; long-running fan-outs hit it.
  Mitigation: break the work across sub-orchestrators, each with its
  own execution.
- **Cold starts on leaf Lambdas.** For latency-sensitive parallel
  fan-outs, provisioned concurrency may be needed on the leaves.
  Otherwise the first invocation per region pays the cold-start tax.
- **State proliferation in S3.** Without lifecycle rules on the state
  bucket, runs accumulate. Mitigation: prefix the state path with the
  run ID, and apply an S3 lifecycle policy that expires runs older than
  N days.
- **Master Orchestrator complexity.** The aggregator at the stage
  boundary is the load-bearing piece. The original implementation hit a
  state-management dead end (see the case study). The redesign — small
  evaluator that reads S3 slice presence + emits completion event — is
  the part of the pattern that has to be done right.

## Alternatives considered

- **Bigger single-process Python (more memory, threaded loop).** Caps
  at ~30 — 40 minutes. Off by an order of magnitude.
- **EC2 Auto Scaling Group with a queue.** Works but introduces a fleet
  to manage, scaling lag, and meaningfully higher floor cost. Lambda is
  the better default at this fan-out shape.
- **EMR / Spark.** Overkill for the data volume. Heavyweight cluster
  startup time alone would have eaten the demo budget.
- **Self-built recursive orchestrator inside one Lambda.** Hits
  cold-start traps and the Lambda 15-minute hard ceiling. Step
  Functions exists precisely to avoid building this in the first place.

## Reversibility

Reversible per-component. The Master Orchestrator can be replaced by a
simpler one-shot driver if the workload shrinks. Sub-orchestrators can
be inlined into the Master if hierarchy stops paying for itself. Leaf
Lambdas can be promoted to Fargate tasks if any one of them outgrows
the 15-minute ceiling. The S3 state surface is the most durable piece
— it survives any other architectural change.

## Notes

The Master Orchestrator's state-management redesign was the first time
an LLM (Claude, recently launched at the time) was a meaningful
architectural collaborator on this stack. The redesign — S3-keyed state
slices + small evaluator at the stage boundary — was Claude's
suggestion; the work of validating it against real failure modes was
mine. This was the seed of the AI-Native Handover doctrine recorded
later in the manifesto (Principle 4).

See the case study `docs/case-studies/lambda-swarm.md` for the full
story including the $6M funding context and the Arrow / Shield team
dynamic.
