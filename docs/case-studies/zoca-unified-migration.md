# Case Study 07 — The Zoca Unified Migration

**Period.** August — late 2024.
**Surface.** 480+ existing users → Zoca's unified Service Management system (Categories / Services / Variations).
**Stakes.** A live multi-tenant SaaS with paying customers; the website team must not change a single line.
**Outcome.** **0 failures. 0 production downtime. 0 website-side code changes.**

## Context

<p data-mode="founder">Three layers of pre-Zoca service modeling had accumulated organically — Categories, Services, Variations — each with its own tables, its own assumptions, its own edge cases. They had grown in different quarters, by different hands, against different product requirements. They worked. They did not compose. The unified Service Management system collapsed all three into one consistent model.</p>

<p data-mode="engineer">The migration's hard constraint was not the database. It was the website. 480+ tenant websites read directly from the service model, and those websites could not be touched. Every business on the platform had its own public surface — booking pages, service catalogs, pricing — and every one of them was speaking to the legacy shape. The new model had to be backwards-compatible at the read API, byte-for-byte, before a single tenant could be moved.</p>

## The Decision — A Read-API Compatibility Contract

<p data-mode="founder">The migration could have been faster with a hard cutover and a coordinated website redeploy. The faster path would have failed. 480+ tenant websites = 480+ deploy windows = 480+ ways to break. Even if we owned every line of website code — and we did — coordinating a synchronized cutover across that many surfaces is a planning exercise, not an engineering one. Planning exercises at that scale do not finish on time.</p>

<p data-mode="engineer">The decision was to absorb all the complexity inside the migration itself and present the website team with an unchanged surface. The contract: the new unified-service backend must answer every existing read endpoint with byte-identical responses for the duration of the cutover. Field names, ordering, nesting — preserved. The migration logic does the unification. The website sees what it has always seen.</p>

<p data-mode="founder">Stated plainly: the team that wasn't being migrated set the contract. Their inability to absorb change was the binding constraint. Everything else — schema design, batch ordering, rollback strategy — was downstream of that one decision.</p>

## The Approach — Three Invariants

<p data-mode="engineer">The migration ran on three invariants. Break any one and the contract breaks with it.</p>

- **Read-API compatibility.** Every legacy endpoint kept its shape. Field names, ordering, nesting — preserved. Internally, the new unified model translated to the old shape on every read. The translation layer was not optional, not temporary, not a "we'll clean it up later" — it was the contract, written in code.
- **Idempotent batch migration.** Tenants migrated in batches. Each batch was idempotent — re-running it never double-migrated, never partially-migrated, never left orphan rows. Tenant-id was the migration key; restart was a no-op for already-migrated tenants. A batch that crashed halfway through could be re-run without thinking.
- **Per-tenant fallback.** If a single tenant's migration tripped any post-flight check, that tenant was rolled back to legacy reads in seconds, while all other tenants stayed on the new system. The blast radius was always 1 tenant, never 480. Failure was a per-tenant event, never a per-platform event.

<p data-mode="engineer">The post-flight check pattern, in shape:</p>

```ts
// migration — per-tenant post-flight verification (stripped)
//
// Input:    a tenant that has just been migrated to the unified model
// Process:  replay a sample of legacy read endpoints against both the
//           legacy backend and the new unified backend; compare
//           responses byte-for-byte; on any drift, mark the tenant
//           for immediate rollback to legacy reads
// Data context:
//           the comparison is structural, not semantic — the contract
//           is byte-identity at the read API, so anything short of
//           identity is a contract violation regardless of meaning
// Output:   a verdict (ok | rollback) and, on rollback, a diff payload
//           that names the exact field where the new model drifted

async function verifyTenant(tenantId: string): Promise<Verdict> {
  const samples = await pickReadSamples(tenantId);     // representative endpoints
  for (const sample of samples) {
    const legacy = await legacyRead(tenantId, sample);
    const unified = await unifiedRead(tenantId, sample);
    if (!byteEqual(legacy, unified)) {
      await flipTenantToLegacy(tenantId);              // blast radius = 1
      return { verdict: 'rollback', diff: diffOf(legacy, unified) };
    }
  }
  return { verdict: 'ok' };
}
```

<p data-mode="engineer">The check ran on every tenant, every batch, before the tenant was considered migrated. A tenant that passed the check was on the new system. A tenant that failed was back on legacy reads inside seconds — and the diff payload told us exactly which field had drifted, so the fix was a targeted patch, not a debugging expedition.</p>

<p data-mode="founder">The cost of that strictness was real — byte-equality is a harder bar than semantic-equality, and we paid for it in extra translation logic for every legacy quirk we had to preserve. We took that trade on purpose. A "mostly compatible" contract is not a contract; it's a list of bugs the website team would discover one at a time, in production, on different days. Byte-identity was the only bar that closed the loop.</p>

## The Engineering Numbers

<p data-mode="engineer">480+ tenants migrated in waves. Zero customer-visible failures across the entire window. Zero production downtime. The website team's git log for the migration window: empty.</p>

<p data-mode="founder">That last metric — *the website team didn't have to deploy* — is the migration's signature. Not the tenant count, not the failure count, not the latency dashboards. The empty git log on the team that owned the read surface. They received no tickets, opened no PRs, ran no rollbacks. The migration happened around them, not through them.</p>

<p data-mode="engineer">The fallback rate told the same story from the inside. Early waves saw a small but real number of post-flight rollbacks — every one a translation-layer bug, a field-ordering edge case, an unhandled nullable that the legacy backend coerced silently and the new model exposed. Each rollback was a fix-and-retry at the per-tenant scope, never a platform-wide pause. Later waves saw the rollback rate decay toward zero. That curve was the migration's actual heartbeat.</p>

## Why This Was Different From The Ghost Sprint Migration

<p data-mode="engineer">The Ghost Sprint (Case Study 03) was a 0-to-1 rebuild — clean room, no live users on the new code, every shape re-derived from first principles on a deadline. The Zoca unified migration was the opposite. *All* live users had to keep working *during* the move. There was no clean room. There was no quiet hour. There was a running platform with paying customers, and the work was to rewire it without anyone noticing.</p>

<p data-mode="founder">Different muscle: not "build it in two months from nothing" but "rewire the live system without anyone noticing." The Ghost Sprint asked how fast a foundation could be poured. This migration asked how invisibly an existing foundation could be replaced. Both belong in the same playbook; neither replaces the other. A senior engineering identity needs both — the willingness to start from zero, and the discipline to move what's already running without breaking it.</p>

<p data-mode="engineer human">There is a third sibling in this arc: the Fallback Protocol (Case Study 05). That one absorbed risk inside the mobile client. This one absorbed risk inside the migration backend. Same instinct — make the safety net invisible to whoever can't afford to see it — applied at a different layer of the stack. The Fallback Protocol protected one client app. The unified migration protected 480 of them.</p>

## The Lesson

<p data-mode="founder">Three lessons, named explicitly:</p>

- **A migration's hard constraint is the system that *isn't being migrated*.** Find it. Make it the contract. The website team did not move; therefore the website team's read API did not move. Every other engineering decision flowed from that single anchor. Migrations that ignore the un-migrated surface fail at the un-migrated surface.
- **Idempotent + per-tenant fallback is the smallest dependency-set for "0 downtime at 480+ scale."** Idempotency means a batch that crashes is a batch that retries, not a batch that corrupts. Per-tenant fallback means a failure is a failure of one customer, not 480. Together they are the floor; without either, the migration's blast radius is uncapped.
- **The most reliable signal that a migration succeeded is what you *didn't* hear from downstream teams — not what you said about it in the demo.** No tickets, no escalations, no Slack DMs from the website team. An empty git log on the team that owned the read surface. Silence from the layer that would have screamed first if anything had drifted. That is the receipt — not the metric on the slide.

<p data-mode="engineer">This case study is the *Deploy* pillar of the Builder doctrine — Develop → Deploy → Monitor → Cost — at scale. The Ghost Sprint covered Develop. The Fallback Protocol covered Deploy under a live mobile app. This one covers Deploy under a live multi-tenant SaaS, where the constraint isn't a single client app but 480+ independent read surfaces that each had a veto. The Monitor and Cost pillars come later; they only earn their keep on top of a Deploy story like this one.</p>

> *"They didn't ask questions. The website team's empty git log was the receipt."* — me, looking back, late 2024.
