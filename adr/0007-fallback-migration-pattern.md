# ADR-0007 — The Fallback Migration Pattern (client-side safety net)

- **Status:** Accepted
- **Date:** 2024-Q3 (mid-2024 — pinned to the quarter the Flask → Node mobile-backend cutover started)
- **Deciders:** Deepesh Rathod, with the mobile and backend leads
- **Supersedes:** —
- **Related:** [`docs/case-studies/flask-to-node.md`](../docs/case-studies/flask-to-node.md), `docs/blueprints.md`

## Context

A live mobile app's backend was being migrated from a legacy Flask
monolith to a set of modern Node.js services. The constraints:

- **Live users.** Paying customers, not a beta cohort.
- **Mobile clients on the App Store and Play Store.** No graceful
  "please update" path that's faster than 1 — 7 days, and a long tail
  of installs that lag updates by weeks.
- **No tolerance for user-facing errors during the cutover.** A failed
  request on a paid app is a churn event, not a log line.

The standard server-side migration patterns — blue-green, gradual
rollout, percentage-based feature flags, reverse-proxy health routing —
all assume the *client* doesn't notice. They work because the client is
a browser that re-fetches on the next interaction. With a mobile app,
the client is the user's device — it absolutely notices, and it can't
be redeployed in seconds. A server-side rollback fires *after* a real
user has already failed.

The mental model "the client is a dumb pipe" breaks here. The client is
the only place fast enough to react to a bad migration in real time.

## Decision

A safety net inside the client. Every API request first targets the new
Node backend. If the request fails or exceeds a tight time budget
(800ms, tuned per endpoint), the client silently retries the same
request against the legacy Flask backend. The user sees one outcome —
success or controlled failure. The engineer sees a *fallback rate*
metric that quantifies migration health in real time.

Sketch of the client wrapper:

```
# Input:  request (method, path, payload)
# Process:
#   1. Fire request at Node backend with budget=800ms.
#   2. If 2xx within budget → return response.
#   3. If timeout, 5xx, or transport error → fire same request at Flask.
#   4. Tag the response with `fellback=true` for telemetry.
# Output: response to caller (Node-served or Flask-served, indistinguishable
#         to the UI), plus a fallback-rate event to the metrics pipeline.

async def call(request):
    try:
        resp = await node_client.send(request, timeout_ms=800)
        if resp.ok:
            emit("api.call", {"backend": "node", "fellback": False})
            return resp
        raise BackendError(resp.status)
    except (Timeout, BackendError, TransportError):
        emit("api.call", {"backend": "flask", "fellback": True})
        return await flask_client.send(request)
```

The fallback rate is a single number — `fellback=true / total` over a
rolling window. It is the migration's vital sign.

## Consequences

**Positive**

- **Zero user-facing failures during the cutover.** Migration health is
  observable as fallback rate, not as user complaints or crash reports.
- **Faster feedback loop.** A spike in fallback rate is an early signal
  of Node-side health — hours faster than waiting for crash analytics,
  app-store reviews, or churn cohorts.
- **Forces graceful API-shape parity.** The two backends must respond
  to the same request shape, which catches contract drift earlier than
  a server-side-only migration would. A Node response that's
  *technically* successful but shaped differently from Flask becomes a
  client bug, not a silent regression.
- **Reversible at the client level.** Flip a config to send 100% of
  traffic to Flask if Node has a major regression. No infra change, no
  reverse-proxy rule, no DNS edit.

**Negative**

- **Two backends running.** Flask must stay alive and patched until the
  fallback rate is reliably zero. The exit ramp is engineering effort,
  not just a cron job.
- **Latency variance widens.** A request that fell back paid two
  round-trip times — Node timeout plus Flask call. p95/p99 latency
  reporting needs adjustment to separate clean Node calls from
  fallbacks; otherwise the migration looks slower than it is.
- **Doubled error surface.** A Flask bug now hits paying customers via
  the fallback path even after Flask was supposed to be "deprecated."
  Treat Flask as actively-maintained until the fallback wrapper is
  removed.
- **Telemetry tax.** The fallback rate metric must be first-class —
  dashboarded, alerted, owned. Without it, the wrapper has added
  complexity without observability, and the migration is flying blind.

## Alternatives considered

- **Strict cutover.** A flag-flip from Flask to Node, with rollback on
  alarms. Rejected: the rollback signal is too slow at the network edge
  — by the time you trip the alarm, real users have failed. Mobile
  amplifies this because the alarm round-trip plus the config-fetch
  round-trip are both on the user's connection.
- **Server-side blue-green.** A reverse proxy that routes between Flask
  and Node based on health. Rejected: requires infrastructure ownership
  the team didn't have at the time, and the client still pays the
  latency of the proxy switch — the failure is *closer* to the user but
  still server-side.
- **Mobile force-update.** Push a new app version that only talks to
  Node, gate the old version's traffic via API versioning. Rejected:
  mobile rollouts take days, ~10 — 30% of installs lag updates by
  weeks, and the gating layer becomes its own migration.

## Reversibility

Highly reversible. The fallback is a config knob in the client:

- **Node regresses badly:** flip the priority order to "Flask first,
  Node fallback" until Node is fixed.
- **Node stabilises:** flip the budget to 0ms (i.e., never fall back)
  to confirm Node is carrying traffic alone.
- **Flask decommissioned:** remove the wrapper entirely; the call site
  becomes a plain Node client.

The mobile app's binary doesn't change in any of these scenarios. Only
the runtime config does. The same property that made the original
migration safe — client-side control — makes the exit safe too.

## Notes

The non-obvious part of this decision, at the time, was *where the
safety net lives*. Most migration writing assumes "the client" is a
browser that can be force-refreshed, so the literature concentrates on
server-side patterns: blue-green, canary, traffic-shadowing, header-
based routing. Mobile breaks that mental model. The client is durable,
out of date, and on the user's network — the only place fast enough to
react before the user notices is the client itself.

Cross-references:
[`docs/case-studies/flask-to-node.md`](../docs/case-studies/flask-to-node.md)
for the full migration narrative; `docs/blueprints.md` for the broader
resilience-architecture thesis this pattern sits inside.
