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
