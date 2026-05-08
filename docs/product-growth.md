# Product & Growth Engineering

> What "founding engineer" actually meant in practice: not just shipping
> the system, but defining what the system was supposed to do, then
> measuring whether it worked.

## 1. The Lead Masking ROI

<p data-mode="founder"><strong>Strategy.</strong> We realised free users were extracting 100% of the value without paying. The free tier had become the product.</p>

<p data-mode="engineer founder"><strong>The Hack.</strong> I engineered a layer that "masked" the most valuable lead data. It wasn't just a UI blur — it was a logic-side filter, evaluated at the source so the unpaid client never received the masked fields in the first place.</p>

<p data-mode="founder human"><strong>Result.</strong> A churned customer was successfully converted back to a paying tier within 48 hours of deployment. <em>Happiest moment.</em></p>

## 2. Behavioural Observability (Mixpanel + Intersection Observer)

<p data-mode="founder engineer"><strong>The Hunch.</strong> We didn't know which part of the dynamically-generated websites was actually capturing user interest. We had pageviews, but pageviews don't tell you which fold the eye landed on.</p>

<p data-mode="engineer"><strong>The Execution.</strong> Implemented <code>IntersectionObserver</code> to track dwell time on specific hero / service sections and piped the events into Mixpanel — without shipping a heavyweight analytics SDK to the client.</p>

```js
// dwell-tracker.js — fire-and-forget dwell instrumentation
const observer = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const section = e.target.dataset.section;
    const start = performance.now();
    const stop = () => {
      const dwell = Math.round(performance.now() - start);
      mixpanel.track('section_dwell', { section, dwell_ms: dwell });
    };
    e.target.__stop = stop;
  }
}, { threshold: 0.6 });

document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));
```

<p data-mode="founder"><strong>Result.</strong> Allowed the team to run data-backed A/B tests on landing-page layouts. <strong>Conversion lifted ~15%.</strong></p>

## 3. Unblocking the Road: The PM-Engineer

<p data-mode="founder"><strong>Philosophy.</strong> When the Scheduling project stalled at the product-definition stage, I stepped in to do the PRD work and the data sanitisation myself. The blocker wasn't engineering capacity — it was an undefined input.</p>

<p data-mode="founder engineer"><strong>Metric.</strong> <strong>15+ seamless onboardings per day</strong> during the peak "adrenaline" growth season. Each onboarding routed through the masking layer, the dwell-tracking instrumentation, and the slot-integrity engine — three systems I had owned end-to-end.</p>

<p data-mode="human">This is the operational definition of "if the product isn't moving, move it yourself." When product is the bottleneck, the engineer becomes product. When the data is the bottleneck, the engineer becomes the analyst. The title is a label; the work is the role.</p>

## 4. The GBP "3-Pack" Drip-Feed Strategy

<p data-mode="founder"><strong>The Hunch.</strong> Bursting all media uploads at once gave the GBP "3-Pack" search ranker no reason to keep flagging a profile as active. The signal we actually wanted was <em>recency of activity</em>, not <em>volume of activity</em>. One loud day, then silence, looks dead. A trickle looks alive.</p>

<p data-mode="engineer founder"><strong>The Execution.</strong> Re-architected the pipeline as a <em>drip-feed</em> — batch media uploads to GBP across days, with a Node-side scheduler controlling cadence. On top of it, a WebSocket observability layer giving users and internal teams real-time visibility on every pipeline stage: <strong>Upload &rarr; Resize &rarr; SQS &rarr; Lambda &rarr; GBP / Website Live</strong>. No more "did it go through?" tickets. Every transition emits.</p>

```js
// pipeline-emit.js — one event per stage, one socket room per profile
io.to(`profile:${profileId}`).emit('pipeline:stage', {
  mediaId,
  stage: 'lambda:gbp_post',     // upload | resize | sqs | lambda | live
  status: 'ok',                  // ok | retry | failed
  ts: Date.now(),
});
```

<p data-mode="engineer"><strong>The Engineering numbers.</strong> SQS-backed Lambdas processing <strong>50+ media items in under 30 seconds</strong> per batch. The scheduler decoupled <em>throughput</em> from <em>delivery cadence</em> — the system could move fast internally while still drip-feeding GBP at a human-paced rhythm.</p>

<p data-mode="founder human"><strong>Result.</strong> Profiles stayed "active" in GBP's eyes — the ranker kept seeing fresh signal day after day instead of one burst and a flatline. Internal trust in the pipeline went up because every stage was observable in real time, not after the fact. The CS team stopped asking engineering for status; they watched the socket.</p>
