# ADR-0016 — System Wisdom vs Framework Knowledge (the Founding Logic doctrine)

- **Status:** Accepted
- **Date:** 2025-Q4 (formalised during the Institutional Resilience era after the 5-minute RCA on the Infra-Flip)
- **Deciders:** Deepesh Rathod
- **Supersedes:** —
- **Related:** [`docs/case-studies/infra-flip-rca.md`](../docs/case-studies/infra-flip-rca.md), [ADR-0010 — Recovery-First Architecture](./0010-cynical-architect-recovery-first.md), [ADR-0014 — Drizzle ORM + Terraform IaC](./0014-drizzle-orm-iac-compliance.md).

## Context

By late 2025 the company was running on senior external consultants
alongside the Founding-engineer core. The collaboration had shipped
real, valuable work — Drizzle ORM migrations, Terraform IaC, the
SOC2/HIPAA compliance floor (ADR-0014). When the consultant model
worked, it shipped fast.

When the consultant model hit its limits, it hit them at the **seams**:
the integration boundaries between new infrastructure and old
application plumbing, between framework-level patterns and
company-specific quirks accumulated since 2020. The canonical
incident: a post-Infra-Flip war room of senior infrastructure and
platform engineers spent an hour unable to identify why the CI/CD
pipeline stalled. The Founding engineer fixed it in five minutes.

The fix was not in the new infrastructure. The fix lived in a piece
of legacy plumbing the framework view had no reason to look at — the
kind of code only the engineers who had built it in the first place
still carried in their heads.

This ADR records the doctrine the incident named.

## Decision

Recognise **System Wisdom** and **Framework Knowledge** as two
distinct, complementary muscles. Operate accordingly:

1. **Framework Knowledge** — pattern fluency, tool fluency, the
   ability to execute migrations cleanly inside a framework's own
   contract. Brought reliably by senior external consultants.
   Necessary; not sufficient.

2. **System Wisdom** — institutional memory of every quirk the
   company has accumulated, every seam between layers, every reason
   *why* the thing is the way it is. Carried by founding engineers
   and the small set of long-tenured engineers around them.
   Sufficient at the seams; not scalable without deliberate effort
   to transfer.

3. **The seam between them is the surface that breaks first.**
   Frameworks see the framework's own contract. Systems contain
   contracts the framework was not aware of. The seam is where
   the unfixed bug lives — until the institutional memory carrying
   it is in the room.

4. **The unfixed problem the doctrine names:** how to transfer
   System Wisdom to outsiders fast enough that the seams stop being
   load-bearing on individual people. ADRs (like this one),
   Blueprints, Case Studies, and the wider AI-Native Handover
   doctrine (manifesto principle 4) are the company's current
   answer. The answer is not yet sufficient. It is the work.

## Consequences

**Positive**
- **Hiring + staffing decisions get a vocabulary.** "We need framework
  knowledge here" is a different request than "we need system
  wisdom here." Naming the difference helps the hiring loop.
- **The five-minute RCA stops being a person-shaped story and
  becomes a process-shaped lesson.** *That* is the move from
  individual heroism to organisational pattern.
- **The AI-Native Handover doctrine gets a clearer target.** The
  thing the documentation needs to encode is not just *what the
  systems do* — it is *the seams the framework view cannot see*.
  Document the seams. Document the *why* of the legacy plumbing.
  The agent reading the docs in 2027 will need exactly that
  context.
- **Consultant collaboration becomes more honest.** Bring in
  consultants for framework-level work; pair them with
  System-Wisdom carriers for the seams; document the
  collaboration so the seam transfers, not just the code.

**Negative**
- **The doctrine can be misread as anti-consultant.** It is not.
  Framework Knowledge is necessary, valuable, and frequently
  faster at the framework-level work than the System-Wisdom
  carriers would be. The doctrine is a separation of concerns,
  not a hierarchy.
- **System Wisdom is fragile.** It lives in heads. People leave.
  Without explicit transfer effort, the System Wisdom evaporates
  with attrition. *That is the unfixed problem.*
- **Documenting seams is harder than documenting systems.**
  Systems have shapes; seams have *contexts*. A blueprint can
  capture a system; a case study + an ADR + a journal entry can
  capture a seam. The portfolio you are reading is the in-flight
  attempt at exactly this transfer.

## Alternatives considered
- **Treat consultants as second-class engineers.** Wrong on the
  facts. Framework Knowledge is real expertise; the company
  benefits from it. The right answer is *complementary muscles*,
  not *hierarchy*.
- **Treat founding engineers as the only "real" engineers.** Same
  failure mode in the other direction. The company that runs only
  on System Wisdom is a company that cannot scale headcount; the
  company that runs only on Framework Knowledge is a company that
  cannot survive its own seams.
- **Document everything until the seam disappears.** A noble goal,
  not yet attainable in any company at any scale. The doctrine
  is to *operate well in the meantime*, not to claim the
  meantime is short.

## Reversibility

The doctrine is a vocabulary, not a system change. It is reversible
by ignoring it; it is also unprovable in advance and only verifies
in incidents like the 5-minute RCA. The right test of the doctrine
is whether the next incident at the seam — when it arrives — gets
fixed faster *because the doctrine made the response shape obvious*.

## Notes

The 5-minute RCA on the Infra-Flip CI/CD seam was the canonical
incident; see [`docs/case-studies/infra-flip-rca.md`](../docs/case-studies/infra-flip-rca.md)
for the full walk-through. The doctrine extends the *Cynical
Architect* family (ADR-0010): both ADRs are about reading a system
honestly. ADR-0010 says *build the recovery before the bug*;
ADR-0016 says *know which kind of knowledge the bug requires before
the room agrees on a fix*.

The portfolio you are reading is, among other things, the live
attempt to convert the System Wisdom this doctrine names into a
form an outsider — human or agent — can ingest. See manifesto
principle 4 (*AI-Native Handover*) for the long-form intent.
