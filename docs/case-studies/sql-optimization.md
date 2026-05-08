# Case Study 06 — SQL Optimisation: 15 Minutes to 75 Seconds

**Period.** Mid-2024.
**Surface.** Campaign analytics / funnel queries running on AWS Lambda.
**Bottleneck.** 15-minute Lambda timeouts. DB deadlocks. 70+ internal users blocked.
**Outcome.** Same answer in **1 minute 15 seconds**. ~12× speedup. Pipeline stable.

## Context

<p data-mode="founder">The campaign-funnel queries answered a single, load-bearing question: for any given campaign, how many leads moved from impression to click to qualified to converted, broken down by source, day, and segment. Every internal dashboard the success team opened in the morning hung off that question. 70+ internal users — success managers, campaign ops, the analytics team — had this query somewhere in their critical path.</p>

<p data-mode="engineer">The query ran on AWS Lambda. Lambda has a 15-minute hard timeout. By mid-2024, the query was *brushing* that ceiling — and on bad days it was hitting it. A timed-out Lambda doesn't return a slow answer; it returns *no answer*. The dashboards weren't lagging anymore. They were missing.</p>

<p data-mode="founder human">Internally, the framing had drifted from "the campaign analytics is slow" to "the campaign analytics is unreliable." Those are different bugs. The first one you tolerate; the second one corrodes trust in the pipeline that drives revenue attribution. It had to stop.</p>

## The Investigation

<p data-mode="engineer">Honest framing: the query had grown organically over eighteen months. Every new campaign feature added one more JOIN — funnels, then segments, then attribution, then suppression rules. Each addition, in isolation, was a small change. Together they were a quadratic mess. The planner had quietly given up choosing hash joins and was nested-looping its way through tens of millions of rows.</p>

<p data-mode="engineer">The first instinct in the room was the wrong one — *throw more Lambda memory at it*. Lambda memory scales CPU linearly, so it would have shaved something. Maybe 20%. Not 92%. The right instinct was to stop guessing and read the query plan.</p>

<p data-mode="engineer">`EXPLAIN ANALYZE` is the only honest document in a database. Dashboards lie. Logs lie. The plan does not — it shows you, row by row, what the planner actually decided to do and how wrong its estimates were. The first plan I pulled was twelve screens tall, with three nested loops over scans of the leads table. That is the bug.</p>

## The "AI-Native" Research

<p data-mode="engineer">I used GPT-4 as a research collaborator on three things: index design, CTE (Common Table Expression) restructuring, and the finer points of join planning. I want to be precise about what that means and what it does not.</p>

<p data-mode="engineer human">GPT-4 is not a magic wand. It is a senior DBA you can ping at 2 AM without guilt. It will give you a CTE rewrite that compiles; it will not tell you whether that rewrite is correct against your schema, your data distribution, or your concurrency model. The work was still mine — picking which suggestion fit our actual schema, validating against `EXPLAIN ANALYZE`, measuring the deltas on production-shaped data, throwing out the suggestions that looked clever but didn't move the plan.</p>

<p data-mode="engineer founder">What GPT-4 did change was the velocity of the *research* phase. A question that would have been an hour of scrolling through Postgres docs became a five-minute exchange. The synthesis — five candidate index designs, three CTE shapes, two LATERAL alternatives — arrived in an afternoon instead of a week. That is the actual unlock.</p>

<p data-mode="founder">This was an early data point on what I now call the AI-Native Handover doctrine: the engineer's job is shifting from "knowing every answer" to "knowing which question to ask the AI, and which of its answers to trust against a real measurement." The measurement does not move. The research velocity does.</p>

## The Three Wins

### 1. CTEs to materialise the funnel stages once, not per join.

<p data-mode="engineer">The old query computed each funnel stage inline inside a JOIN — meaning the planner re-derived "leads who reached qualified" once per downstream join. Three joins, three derivations. A CTE that materialises each funnel stage once, up front, lets every downstream join read a small, indexed result set instead of recomputing the universe.</p>

```sql
-- campaign_funnel.sql — CTE-materialised funnel stages
WITH impressions AS (                                          -- input
  SELECT campaign_id, lead_id, occurred_at
    FROM lead_events
   WHERE event_type = 'impression'
     AND occurred_at >= $1 AND occurred_at < $2
),
clicks AS (                                                    -- input
  SELECT campaign_id, lead_id, MIN(occurred_at) AS first_click_at
    FROM lead_events
   WHERE event_type = 'click'
     AND occurred_at >= $1 AND occurred_at < $2
   GROUP BY campaign_id, lead_id
),
qualified AS (                                                 -- process
  SELECT c.campaign_id, c.lead_id, l.qualified_at
    FROM clicks c
    JOIN leads l USING (lead_id)
   WHERE l.qualified_at IS NOT NULL
)
SELECT i.campaign_id,                                          -- output
       COUNT(DISTINCT i.lead_id)                       AS impressions,
       COUNT(DISTINCT c.lead_id)                       AS clicks,
       COUNT(DISTINCT q.lead_id)                       AS qualified
  FROM impressions i
  LEFT JOIN clicks    c USING (campaign_id, lead_id)
  LEFT JOIN qualified q USING (campaign_id, lead_id)
 GROUP BY i.campaign_id;
```

<p data-mode="engineer">The CTE shape also changed lock acquisition order — more on that below.</p>

### 2. Composite indexes on the actual query predicates, not the obvious foreign-key suspects.

<p data-mode="engineer">The "obvious" indexes — single-column on `lead_id`, on `campaign_id`, on `occurred_at` — already existed. They were not being used. Three reasons, all of them boring:</p>

- **Data skew.** `event_type` had four values; `'impression'` was 95% of the table. A single-column index on `event_type` was useless because the planner correctly chose a sequential scan over fetching most of the table by index.
- **Type mismatches.** One join column was `bigint`; the predicate was being coerced from `int`. Postgres will silently disqualify the index in that case.
- **Leading-column rules.** A composite index on `(lead_id, campaign_id)` is not used by a query that filters on `campaign_id` alone. The leading column has to match.

```sql
-- composite indexes that match the actual predicate shape
CREATE INDEX CONCURRENTLY idx_lead_events_campaign_type_time
  ON lead_events (campaign_id, event_type, occurred_at DESC)
  WHERE event_type IN ('impression', 'click', 'conversion');

CREATE INDEX CONCURRENTLY idx_leads_campaign_qualified
  ON leads (campaign_id, qualified_at)
  WHERE qualified_at IS NOT NULL;
```

<p data-mode="engineer">The partial-index `WHERE` clauses are the real win — they cut the index size by an order of magnitude and made the planner pick them every time, not "sometimes."</p>

### 3. Replacing one LATERAL join with a window function.

<p data-mode="engineer">There was a LATERAL join in the old query that fetched, for each lead, the most recent qualifying event. LATERAL is correct, expressive, and — in this shape — forced the planner into a nested-loop plan: for every lead row, run the subquery once. With tens of millions of leads, that is exactly the cost it sounds like.</p>

<p data-mode="engineer">A window function on the same CTE expresses the same intent — "the most recent qualifying event per lead" — but lets the planner pick a hash-aggregate plan instead. One pass. No nested loop.</p>

```sql
-- before — LATERAL forces nested-loop
SELECT l.lead_id, latest.event_type, latest.occurred_at
  FROM leads l
  LEFT JOIN LATERAL (
    SELECT event_type, occurred_at
      FROM lead_events e
     WHERE e.lead_id = l.lead_id
       AND e.event_type IN ('qualified','converted')
     ORDER BY occurred_at DESC
     LIMIT 1
  ) latest ON true;

-- after — window function lets the planner hash-aggregate
WITH ranked AS (
  SELECT lead_id,
         event_type,
         occurred_at,
         ROW_NUMBER() OVER (
           PARTITION BY lead_id
           ORDER BY occurred_at DESC
         ) AS rn
    FROM lead_events
   WHERE event_type IN ('qualified','converted')
)
SELECT lead_id, event_type, occurred_at
  FROM ranked
 WHERE rn = 1;
```

## The Result — and the Deadlocks

<p data-mode="engineer">**The numbers:** 15 minutes (timing out) → 1 minute 15 seconds. ~12× speedup. The Lambdas now finish well inside the 15-minute budget — and well inside the 5-minute soft-budget the success team actually cares about.</p>

<p data-mode="engineer">A second result, unplanned: the rewrite resolved a class of DB deadlocks the old query had been triggering during high-concurrency reads. The old shape acquired locks on the `leads` and `lead_events` tables in a different order depending on which campaign was being analysed; under concurrent load, two analyses would grab the locks in opposite order and deadlock. The CTE-materialised version reads each stage once, in a fixed order, and holds the locks for a fraction of the time. The deadlock surface shrank to nothing.</p>

<p data-mode="founder">The 70+ internal users got their dashboards back. The campaign pipeline that runs on these queries stopped flapping. Nobody wrote a thank-you email — they just stopped writing the *"is the dashboard down?"* messages, which is the better signal.</p>

## The Lesson

<p data-mode="engineer">- An organically-grown query is a debt instrument. Reading the `EXPLAIN ANALYZE` plan is the only honest interest payment. Dashboards and logs will tell you the symptom; only the plan tells you what the planner actually decided.
- AI is a velocity multiplier on the *research* phase of optimisation. It is not a substitute for measuring against your real schema, your real data distribution, your real concurrency. The measurement does not move; the research does.
- Optimisation that incidentally resolves deadlocks is a sign that the original query was wrong about more than just speed. A correct query, in the database sense, holds the right locks for the right time in the right order. If that falls out of an optimisation pass, the original was wrong twice.</p>

<p data-mode="founder">This case study is the **Cost** pillar of the Develop → Deploy → Monitor → Cost arc, in disguise. A query that takes 15 minutes on Lambda costs ~12× a query that takes 75 seconds — before you count the engineer-hours spent debugging deadlocks, the success-team hours spent waiting on dashboards, and the trust cost of a pipeline that flaps. The optimisation paid for itself in the first week and kept paying every Monday after that.</p>

> *"Read the plan. The plan is the truth."* — me, somewhere around the third `EXPLAIN ANALYZE`.
