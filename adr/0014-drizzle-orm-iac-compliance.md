# ADR-0014 — Drizzle ORM Migrations + Terraform IaC for SOC2/HIPAA-Ready Infrastructure

- **Status:** Accepted
- **Date:** 2025-Q3 (decision crystallised during the Enterprise era of Phase 9, mid-2025)
- **Deciders:** Deepesh Rathod, with a senior enterprise consultant as the collaborator on the Drizzle migration and the early Terraform footprint
- **Supersedes:** —
- **Related:** [ADR-0011 — Audit-by-Snapshot](./0011-psql-audit-by-snapshot.md), [`docs/blueprints.md`](../docs/blueprints.md) §13.

## Context

By Phase 9 (mid-2025) the company was preparing for SOC2 + HIPAA
compliance. The two pillars compliance auditors will ask about first:

1. *What is in your database*, and how do you know it didn't change
   without a review?
2. *What is in your infrastructure*, and how do you know it matches
   the access-control policy you said you have?

Both surfaces had been managed *some of the time* in version control,
*some of the time* in console clicks, *some of the time* in DBA
sessions that nobody logged. That state was incompatible with the
compliance posture the company needed.

The pre-Drizzle ORM in use produced opaque migration artefacts —
hard to review, hard to revert. The pre-Terraform infrastructure had
console-clicked exceptions everywhere. Both had to be replaced with
*everything-in-git* surfaces before any auditor walked in.

## Decision

Adopt **Drizzle ORM** for the database surface and **Terraform** for
the infrastructure surface. Together: every change to anything that
touches the production data path is a reviewable file in git.

**Drizzle ORM:**
- Typed schemas in TypeScript, no runtime overhead.
- Migrations are real SQL diffs, not opaque framework artefacts.
- Forward + reverse migrations as separate files; `down` is mandatory.
- Generated SQL stays close to hand-written SQL — engineers read
  the migration and know what it does, without learning a DSL.

**Terraform:**
- Per-environment workspaces (dev / staging / prod).
- Modules for each repeatable concern (RDS, ECS service, IAM, S3
  bucket policy). Compliance-relevant invariants encoded in module
  defaults — encryption at rest, backup retention, deletion
  protection, audit-log exports — so the *default* is the
  compliant configuration.
- Drift detection nightly: running state compared to HCL state;
  alerts on mismatch.

## Consequences

**Positive**
- **Compliance-readable.** SOC2 + HIPAA auditors get *"every change is
  a reviewed git commit"* as the answer to both pillar questions —
  the strongest answer this kind of audit has.
- **Migration visibility.** *"When was this column added?"* is
  `git log migrations/`. *"Why?"* is the PR description. *"Can we
  revert?"* is the `down` migration.
- **Infrastructure visibility.** *"Why is this RDS configured this
  way?"* is the HCL file. *"Has anyone changed it manually since?"* is
  the nightly drift report.
- **Onboarding compounds.** A new engineer reading `migrations/` +
  `terraform/` understands the production data path without paging
  the senior team.

**Negative**
- **Migration discipline costs sprint speed.** Writing a reverse
  migration on every change is friction. The friction is the cost of
  reversibility. We pay it.
- **Terraform's blast radius.** A bad `apply` to prod can take down
  infrastructure faster than a bad SQL migration can. Mitigation: PR
  reviews on prod-touching modules, plan-only previews on PRs, manual
  approval gate before `apply` on production workspaces.
- **Drift detection has false positives.** Resources that legitimately
  change outside Terraform (e.g. RDS minor-version auto-upgrades) need
  ignored-attribute lists. Without curation, the alarm fires
  constantly and stops being trusted.
- **Two skill surfaces.** Drizzle's TypeScript-first model and
  Terraform's HCL/state-file model are different muscles. Engineers
  need both. Mitigation: PR templates that include "schema diff?"
  and "infra diff?" prompts so neither slips through.

## Alternatives considered
- **Prisma.** Closer to a framework than to SQL — opaque migration
  artefacts that the compliance review treats as "we trust the
  framework," which auditors do not love. Drizzle's *real-SQL
  migration files* are the easier compliance story.
- **TypeORM / Sequelize.** Mature, but the same opacity problem on
  migrations as Prisma plus older-generation TS ergonomics.
- **Pulumi instead of Terraform.** Pulumi-in-TypeScript is attractive
  for a TypeScript-first team. Rejected because Terraform's industry
  inertia makes the auditor's review path easier — they have a
  template for *"show me your terraform"*; Pulumi adds friction the
  audit doesn't reward.
- **CDK (CloudFormation).** AWS-only. We are AWS-only today; we may
  not be tomorrow. Terraform keeps the option open.
- **Status quo (console-clicked infrastructure + opaque ORM
  migrations).** What we had. The compliance posture made it
  untenable.

## Reversibility

Reversible per-system, expensive in aggregate. A single migration can
be rolled back via its `down` file. A single Terraform module can be
removed and replaced with a different abstraction. The whole pattern
can be retired by walking back to console-clicked infrastructure +
opaque migrations — which would also walk us back out of compliance.
The reversibility is real; the *desirability* of reversing is not.

## Notes

This ADR pairs with [ADR-0011 — Audit-by-Snapshot](./0011-psql-audit-by-snapshot.md).
ADR-0011 records *what changed in the data*; ADR-0014 records *what
changed in the schema and infrastructure*. Together they form the
"every change is reviewable" floor that SOC2 + HIPAA compliance
expects.

The pattern shipped during Phase 9 (April — November 2025) and carried
straight into the early SOC2 + HIPAA audit windows. The collaboration
with a senior enterprise consultant on the Drizzle migration is
recorded here in gratitude — the compliance-readable database surface
is materially their contribution as much as mine.

See [`docs/blueprints.md`](../docs/blueprints.md) §13 for the
implementation patterns and code shapes.
