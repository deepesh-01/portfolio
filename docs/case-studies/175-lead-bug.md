# Case Study 02 — The 175-Lead Bug

**Period.** 2023.
**Surface.** Lead-delivery pipeline. Mixpanel → S3 → Postgres → SMS.
**Detected via.** Internal audit.
**Resolution time.** ~7 days of dual-track work — manual delivery in parallel with the RCA.

## What broke

<p data-mode="engineer">Leads were captured correctly upstream and landed in Postgres without issue. The SMS-out leg of the pipeline was silently dropping a subset of them — the user-facing notifications that customers depended on never went out. The data was there. The delivery was not.</p>

<p data-mode="founder">From a customer perspective, this is the worst possible failure mode: the system <em>looks</em> healthy from every dashboard we had at the time, while customers experience a slow degradation of the product's core value (timely lead alerts).</p>

## How it surfaced

<p data-mode="engineer founder">An internal audit caught the gap. The audit was a deliberate guardrail — periodic reconciliation between what the lead-capture pipeline ingested and what was confirmed delivered downstream. The audit found a divergence; that divergence was the bug.</p>

## Why I owned it

<p data-mode="human">I had been heads-down on the Website Suggestions feature when the audit came back. My quiet assumption had been that someone else on the team was watching the SMS leg of the pipeline. Nobody explicitly was. When the gap was found, the blame landed on me.</p>

<p data-mode="founder human">I could have argued the attribution. I didn't. The product had degraded; that was the only fact that mattered to a customer. <strong>I took the issue end-to-end.</strong></p>

## The recovery (week-long, dual-track)

<p data-mode="engineer">Two streams of work, run in parallel:</p>

- **Visibility.** I built a Metabase dashboard against the Postgres warehouse — every captured lead, the expected delivery state, the actual delivery state, the gap. For the first time we could see the failure mode in real time, not after the fact.
- **Reconciliation queries.** A set of sync queries that diffed the capture-side state against the delivery-side state and produced a list of leads that were captured but never delivered.
- **Manual delivery.** For seven days I ran the reconciliation queries on a cadence and sent the missing leads over SMS by hand, while the long-form RCA continued.
- **RCA + permanent fix.** Once the root cause was identified and patched, the Metabase dashboard stayed in place as a permanent guardrail so the same class of drift could never go invisible again.

```sql
-- the reconciliation query (shape)
-- captured leads that should have triggered an SMS but never did
SELECT l.id, l.captured_at, l.contact_phone, l.business_id
  FROM leads l
  LEFT JOIN sms_deliveries d
    ON d.lead_id = l.id
   AND d.channel = 'lead_alert'
 WHERE l.captured_at >= now() - interval '24 hours'
   AND l.is_deliverable = true
   AND d.id IS NULL          -- no delivery row at all
   AND NOT l.suppressed
 ORDER BY l.captured_at;
```

## The lesson

<p data-mode="founder">A system without a continuous reconciliation between what was <em>ingested</em> and what was <em>delivered</em> is a system you can't trust at scale. Dashboards on uptime and latency tell you the pipes are open. They don't tell you the right things flowed through them. The audit caught the bug; the dashboard made sure no future audit would have to.</p>

<p data-mode="engineer human">A second lesson: <em>quiet assumptions about ownership are the most expensive bugs in the org chart.</em> If you can't name who is watching a critical leg of a pipeline, the answer is "nobody," and you don't get to find that out from a customer. From this incident onward, I have refused to assume someone else is watching — if a leg of the pipeline matters, I either own it or I get someone to put their name against it explicitly.</p>

<p data-mode="human">A third lesson, the one that mattered most personally: <strong>ownership beats attribution.</strong> Arguing whose fault it was would have cost a week of trust and changed nothing about the customer outcome. Taking the issue, building the dashboard, sending the SMSes by hand, and standing under the dashboard for seven days bought the trust back faster than any post-mortem could have.</p>
