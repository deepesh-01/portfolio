# Case Study 08 — The $6M Lambda Swarm

**Period.** August — September 2024.
**Surface.** A "Revenue Opportunity" insights engine for the funding pitch — what investors needed to see, and what existing users would later need to use.
**Bottleneck.** A single-process Python script took **2 hours** per run. Investors had **5 minutes** of attention.
**Outcome.** Lambda Swarm + Step Functions hierarchy. Run time **2 hours → ~5 minutes**. Funding closed at **$6M**.

## Context — The 11 AM to 2 PM Battle

<p data-mode="founder">Shambhav was in the US, twelve hours ahead of Bangalore. He woke at 11 AM IST and demanded a working demo by 2 PM IST. Three-hour window. Every day. The funding round was on the line and the asset that had to perform was a single thing — an insights engine that scraped StyleSeat and Booksy, analysed city-wide trending keywords via LLMs, and audited service catalogs for pricing gaps. *That* was the "Revenue Opportunity" the round was being raised on. *That* engine could not take 2 hours.</p>

<p data-mode="founder engineer">The team split, and naming the split was half the win. Pravesh and I were the **Arrow** — the funding demo, the engine, the architecture, the all-nighters. Durga and Sahil were the **Shield** — protecting 600+ existing users and shipping live features so the company didn't bleed product velocity while the funding battle ran in parallel. Two teams, two clocks, one company. The Shield is the reason the Arrow could fly.</p>

<p data-mode="engineer">The makeshift demo surface was a Streamlit frontend wired straight to the engine outputs — no polish, no design system, just the raw numbers in a table investors could read. The point was never the UI. The point was the engine behind it.</p>

## The Decision — A Swarm, Not A Faster Loop

<p data-mode="engineer">The naive instinct in the room was the wrong one — *optimise the Python script, throw more memory at it, faster IO*. I ran the math. Even a maximum bare-metal optimisation on the existing single-process shape maxes out somewhere around 30 — 40 minutes. Off by an order of magnitude from what investors needed. Off by a factor of six from the 5-minute budget. The shape was the bug, not the speed.</p>

<p data-mode="engineer">The right approach is parallelism at the boundary that already exists in the data: *each tenant's analysis is independent of every other tenant's*. There is no shared state between Tenant A's keyword analysis and Tenant B's. That is a Lambda-shaped problem. You don't make the loop faster — you replace the loop with a fan-out.</p>

<p data-mode="engineer">The decision: a **Swarm** of Lambdas, fanned out by tenant *and* by analysis stage, orchestrated by a hierarchy of AWS Step Functions. Master Orchestrator at the top. Sub-orchestrators per analysis type. Leaf Lambdas doing the actual work. Each layer of the hierarchy gates the next.</p>

## The Architecture

```
Step Functions (Master Orchestrator)
        ├── Step Functions (Scraper sub-orchestrator)
        │       └── Lambdas (one per tenant, parallel)
        ├── Step Functions (LLM-analysis sub-orchestrator)
        │       └── Lambdas (one per keyword cohort, parallel)
        └── Step Functions (Catalog-audit sub-orchestrator)
                └── Lambdas (one per service category, parallel)
```

<p data-mode="engineer">**State management.** S3 JSON blobs as the durable state surface. Each Lambda reads its slice of state, writes its result back, and emits a completion event. Step Functions track which slices are done. The Master Orchestrator gates the next stage on the previous stage's completion. No shared memory. No cross-Lambda chatter. Every Lambda's universe is its slice of S3.</p>

```json
// master-orchestrator.asl.json — stripped-down Step Functions definition
{
  "Comment": "Revenue Opportunity Swarm — Master Orchestrator",
  "StartAt": "ScrapeAllTenants",
  "States": {
    "ScrapeAllTenants": {                                          // input
      "Type": "Map",
      "ItemsPath": "$.tenants",
      "MaxConcurrency": 80,
      "Iterator": {
        "StartAt": "ScrapeTenant",
        "States": {
          "ScrapeTenant": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:::function:scrape-tenant", // process
            "ResultPath": "$.scrape_result",
            "Retry": [{ "ErrorEquals": ["States.TaskFailed"],
                        "MaxAttempts": 2, "BackoffRate": 2.0 }],
            "End": true
          }
        }
      },
      "ResultPath": "$.scrape_results",
      "Next": "GateScrapeStage"
    },
    "GateScrapeStage": {                                           // data context
      "Type": "Task",
      "Resource": "arn:aws:lambda:::function:gate-stage",
      "Parameters": {
        "stage": "scrape",
        "state_bucket": "swarm-state",
        "state_prefix.$": "$.run_id"
      },
      "Next": "AnalyseKeywords"
    },
    "AnalyseKeywords": {                                           // process
      "Type": "Task",
      "Resource": "arn:aws:states:::states:startExecution.sync:2",
      "Parameters": {
        "StateMachineArn": "arn:aws:states:::sm:llm-analysis",
        "Input": { "run_id.$": "$.run_id" }
      },
      "Next": "AuditCatalogs"
    },
    "AuditCatalogs": {
      "Type": "Task",
      "Resource": "arn:aws:states:::states:startExecution.sync:2",
      "Parameters": {
        "StateMachineArn": "arn:aws:states:::sm:catalog-audit",
        "Input": { "run_id.$": "$.run_id" }
      },
      "End": true                                                  // output
    }
  }
}
```

<p data-mode="engineer">The shape that mattered: each stage's parallel branch writes results to S3 keyed by `(run_id, stage, tenant_id)`. The gate Lambda between stages reads the slice and decides whether to proceed, retry the failures, or fail the run. The Master Orchestrator does not hold per-tenant state in its execution history — S3 does.</p>

## The Dead End

<p data-mode="engineer">Two days in, I hit a wall on the Master Orchestrator's state-management logic. Specifically: how to aggregate per-tenant results across stages without re-running settled stages, and how to handle partial failures without re-running the world. The standard Step Functions patterns I tried hit the execution-history size limit — the per-tenant state I was carrying through `ResultPath` blew the 25KB-per-event ceiling once you got past a few hundred tenants. Custom recursion to checkpoint and resume landed in cold-start traps and timeout cliffs.</p>

<p data-mode="engineer">The bug had the shape of a state-machine problem that the standard playbook didn't have a clean answer for. I had been around this loop for the better part of a day. Pravesh had been on the scraper side. The clock was the clock.</p>

## Claude, First Time

<p data-mode="engineer">I turned to the newly-launched Claude. Pasted the state-machine definition, the failure mode, the constraints — execution-history limit, partial-failure recovery, cold-start sensitivity. Claude returned a redesign: S3-backed state slices keyed by `(tenant_id, stage)`, with a small evaluator Lambda at the end of each stage to gate the next, and the Master Orchestrator carrying *only* the `run_id` through its execution history. The state lived in S3. The orchestrator carried a pointer.</p>

<p data-mode="engineer">The redesign worked. The execution history stayed flat. Partial failures became cheap — re-run only the failed slices, the rest are already in S3. The cold-start cliffs went away because each Lambda's input was bounded by a single S3 read.</p>

<p data-mode="engineer human">Honest framing: this was the first time an LLM was a meaningful collaborator on *architecture* for me, not a typing-faster tool. The work was still mine — picking which suggestion fit the actual constraints, validating the redesign against the failure modes I'd seen in the previous day, measuring the deltas against real tenant counts. But the velocity of the *architectural research* phase went up by what felt like an order of magnitude. A day's worth of Step Functions docs and forum posts, compressed into a forty-minute exchange.</p>

<p data-mode="founder">This was the seed of what later became the AI-Native Handover doctrine — the engineer's job shifting from "knowing every answer" to "knowing which question to ask, and which of the answers to trust against a real measurement." See the manifesto, principle 4. August 2024 is where the doctrine started, in the middle of a funding battle, at 3 AM, with a state-machine that wouldn't gate.</p>

## The Engineering Numbers

<p data-mode="engineer">**2 hours → ~5 minutes.** Roughly **24× speedup**. Per-tenant runs scaled out to 480+ tenants without re-architecting — the Swarm was already shaped right because the parallel boundary was in the data, not in the orchestration. The orchestration just stopped being the bottleneck.</p>

<p data-mode="engineer">Cost was acceptable, and quietly excellent. Lambda's per-invocation pricing for parallel-fanout work where each Lambda finishes in seconds is comically cheap compared to a 2-hour EC2 process running every refresh. The Swarm was faster *and* cheaper. That is not the usual trade.</p>

## The Outcome — $6M Closed

<p data-mode="founder">The funding round closed. **$6M.** The engineering bet — Step Functions hierarchy + S3 JSON state + Claude-redesigned state management — got market validation in the most blunt form available: a term sheet. The 2 PM demo, every day for the back half of the sprint, ran clean. Investors saw the Revenue Opportunity surface populate in 5 minutes instead of waiting 2 hours for a number.</p>

<p data-mode="engineer">The Swarm continued running in production after the demo, powering the Revenue Opportunity surface for the full 480+ tenants. The architecture I built under a 2 PM clock kept running on a no-clock cadence for months after.</p>

## The Lesson

<p data-mode="engineer">- When the boundary in your data is parallel, the boundary in your architecture should be parallel too. Don't optimise the loop — replace the loop with a fan-out. A 30-minute loop is a 30-minute loop. A 5-minute fan-out is a different problem.
- S3 JSON blobs are the most underrated state surface for stateful Lambda fan-outs. Durable, ordered by key, cheap, and the failure modes are the failure modes you already understand. Step Functions execution history is for *control flow*, not for *state*. Keep state out of the orchestrator's blood.
- AI is a velocity multiplier on the *architectural research* phase of a hard problem. It is not a substitute for measuring the redesign against your real constraints — execution-history limits, cold-start cliffs, your real tenant count. But the velocity gain is real, and ignoring it is a senior-engineering mistake.</p>

<p data-mode="founder">This case study is the **Deploy** pillar of the Develop → Deploy → Monitor → Cost arc — but it's also where the AI-Native Handover doctrine got its origin story. The Swarm is the architecture. Claude was the collaborator. The term sheet was the measurement.</p>

> *"State management is just file management with extra steps."* — me, after the Claude redesign, August 2024.
