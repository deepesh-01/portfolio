# ADR-0010 — Recovery-First Architecture (the Cynical Architect doctrine)

- **Status:** Accepted
- **Date:** 2024-08 (formalised during the orphaned-builder period; the
  doctrine had been forming for two years, this ADR puts a name on it)
- **Deciders:** Deepesh Rathod
- **Supersedes:** —
- **Related:** [ADR-0007 — Fallback Migration Pattern](./0007-fallback-migration-pattern.md),
  [ADR-0009 — Lambda Swarm](./0009-lambda-swarm-step-functions.md),
  [`docs/blueprints.md`](../docs/blueprints.md) §3 (audit triggers), §5
  (pre-bootup), §7 (resilient migrator)

## Context

A pattern in the system designs of the previous two years: every system
that survived contact with production had its recovery path designed
*before* its happy path. The systems that didn't — the early SQL
queries that crashed Lambda, the migration scripts that died at hour 18
— paid for the omission with engineer-hours and trust.

By August 2024, after the orphaned-window when the Original Clan had
departed, this stopped being a pattern and started being a doctrine.
The engineer who used to be the guy who failed SQL queries and crashed
migration scripts had become the engineer who refused to build a system
whose first failure mode wasn't already drawn on the whiteboard.

The honest framing: this is *cynicism*, but the productive kind. Not
pessimism — pessimism doesn't ship. *Cynicism that has been turned into
a design discipline*. If a system can fail, the recovery is already
architected. Hope is not in the design.

## Decision

Adopt **Recovery-First Architecture** as the default doctrine for any
new system in this stack. The minimum recovery primitives a new system
must include before it ships:

1. **A replay path.** SQS dead-letter queues with explicit re-drive
   policies. *Every* asynchronous boundary gets one — no exceptions,
   even if the failure rate is currently zero.
2. **A real-time dashboard.** A live view of the system's health
   *before* the system goes to production, not after the first
   incident. The dashboard is the source of truth that beats Slack
   debugging.
3. **A deterministic fallback.** When the new path fails, the user gets
   a slightly slower but correct answer (see ADR-0007 — Fallback
   Migration Pattern). The user's experience of correctness is
   non-negotiable; latency is the budget you trade.
4. **An audit trail.** Every destructive operation is logged with
   `OLD.*`, the actor, and the timestamp. The trail is the source of
   truth that beats memory (see Blueprint §3 — Ignorance-Proof
   Logging).
5. **A pre-bootup check.** The deploy fails *loud* before the port
   binds, not silently after the first request fails (see Blueprint §5
   — Pre-Bootup Pipeline).
6. **A resume-from-log entry point.** Long-running operations
   (migrations, reconciliations, swarms) treat every restart as
   routine, not as recovery (see Blueprint §7 — Resilient Local
   Migrator).

The discipline: a new system that lacks any of the six is not
"shipped"; it is "in beta with the team holding their breath." A new
system that has all six is shipped — even if its happy path is rough.
Speed is a feature; correctness is the contract.

## Consequences

**Positive**

- **Every incident is observable in real time, not after the customer
  report.** This compresses the incident response window from hours to
  minutes.
- **Recovery is rehearsed in the design, not invented in the panic.**
  The team knows the recovery before they have to use it.
- **The on-call engineer at 2 AM is not the load-bearing component.**
  The dashboard, the DLQ, the audit trail, and the pre-bootup check
  are.
- **AI-Native Handover (Principle 4 in the manifesto) becomes
  feasible.** A system whose recovery is *documented* and *observable*
  is a system an agent can operate with the same confidence as a
  human.

**Negative**

- **Up-front engineering cost.** Building the dashboard before the
  feature ships is more work than building the feature first. The
  discipline is the cost; the trust is the return.
- **It looks slow from the outside.** A new system with all six
  primitives takes longer to "ship" by the calendar than the cowboy
  version. Stakeholders who don't see incidents won't see why the
  discipline matters until they do.
- **Doctrine drift.** Without a checklist, the six primitives degrade
  to four, then to two, then to "we'll add the dashboard later."
  Mitigation: PR templates that ask "DLQ? Dashboard? Fallback? Audit?
  Pre-bootup? Resume?" before the merge.

## Alternatives considered

- **Build for the happy path; add recovery after the first incident.**
  What we used to do. The pain is the reason for this ADR. The
  recovery added after an incident is always worse than the recovery
  designed before it.
- **Test-driven everything.** Tests find known unknowns; recovery
  primitives survive the unknown unknowns. They are not substitutes
  for each other; recovery primitives are the floor that lets tests
  be useful.
- **Buy a third-party "observability platform".** Useful but not a
  substitute. The discipline is in *what you observe and what you can
  recover*, not in the dashboarding tool. The platform is one of the
  primitives, not the doctrine.

## Reversibility

Reversible per-system: any individual primitive can be skipped if the
cost of building it genuinely exceeds the cost of an incident. But the
*doctrine* — the default — should not be reversed. A team that ships
systems without their six primitives ages backwards.

## Notes

This ADR puts a name on a discipline that had been forming since the
December 2022 row-deletion incident (Blueprint §3 was the first
primitive in this doctrine, written long before the doctrine had a
name). The orphaned-builder period of August 2024 is when the
discipline crystallised — when the people who would have caught my
mistakes weren't there anymore, the discipline had to be the catch.

See `docs/journal.md` (The Funding & Swarm Era → The Cynical Architect)
for the personal arc behind the doctrine. The doctrine is downstream of
every previous failure that survived as a system, not as an excuse.
