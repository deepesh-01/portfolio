# Case Study 13 — Scheduling & Payments v2

**Period.** February 2026.
**Surface.** A unified Scheduling & Payments engine for 1,500+ tenant businesses — the Master Stroke feature that had to land to solve the company's NRR crisis.
**Constraints.** **One month** of build time. **$200/mo Claude Max** as the engineering pair. Tenant isolation. Full Stripe Connect integration. Booking-item snapshot logic for price-and-policy invariants.
**Outcome.** Shipped on time. The Cynical Architect + Audit Architect + Master-Worker doctrines stacked underneath. The team — three engineers — operating at sustained 10x velocity through the Claude Max integration.

## Context — Scheduling v1 → v2

<p data-mode="engineer">The original Scheduling Engine (Blueprint §1) shipped in late 2023 as the Integrity Engine — entity snapshots, transaction blocks, slot algorithm, pre-bootup hygiene. It carried the company through 2024-2025 and into the Zoca unified-service migration (Case Study 07). By early 2026 the surface had outgrown its first design: 1,500+ tenants demanding tenant isolation at a level v1 hadn't anticipated; the Stripe Connect integration that would unlock NRR retention; cart-and-policy logic that v1 had never been required to model.</p>

<p data-mode="engineer">v1's invariants still held. The slot algorithm still ran in a single pass; the transaction block still made double-booking impossible; the entity snapshot still froze the row at commit time. What v1 didn't model: a money path. A cart that survives a session. A policy doc per tenant. A Stripe account on the other side of every booking. v2's job was to bolt those onto v1's spine without rewriting the spine.</p>

<p data-mode="founder">The brief: rebuild the surface, ship in one month, do not break what's working.</p>

## The Decision — Stand On The Doctrines, Don't Re-Derive Them

<p data-mode="engineer">Three years of doctrine on this site existed exactly for a moment like this. v2 was not built from scratch; it was built on the floor that had been laid:</p>

- **Cynical Architect (ADR-0010)** — every recovery primitive had to be in place before the happy path shipped. DLQs on payment events, audit-by-snapshot on every booking write (ADR-0011), pre-bootup checks for Stripe Connect credentials and tenant-scoped database access.
- **Master-Worker (ADR-0012)** — the booking flow accepts requests, enqueues work, returns 202; workers handle Stripe webhooks and reconciliation off the request path.
- **Audit-by-Snapshot (ADR-0011)** — every booking writes a complete `before/after` snapshot to the tenant-scoped audit log. Compliance-readable. Reversible.
- **Drizzle ORM + Terraform IaC (ADR-0014)** — the schema migrations were typed, reviewable, revertible. The infrastructure footprint was HCL'd. Zero console-clicked exceptions in the v2 stack.

<p data-mode="engineer">Stated as a stack: Drizzle/Terraform was the floor (the change-management substrate); the Cynical Architect was the perimeter (the recovery primitives that ran before any happy-path code); the Master-Worker was the load-shedding tier (the queue between the API and the slow work); the Audit Architect was the receipt layer (every commit traceable). v2 added two pieces on top of that stack — booking-item snapshots and tenant-scoped policy docs — and nothing else. <em>The point of doctrine is that the next build is mostly composition.</em></p>

## The Architecture

```
Client (web / mobile)
        │
        ▼
NestJS API (tenant-scoped session)
   - validate request                       ← pre-bootup hygiene (Blueprint §5)
   - materialise booking snapshot           ← snapshot at commit (v1 carry-over)
   - reserve slot inside TX block           ← v1 invariant
   - enqueue Stripe + audit work            ← Master-Worker (ADR-0012)
   - return 202
        │
        ▼
Redis queue
        │
        ├── Stripe Connect worker → paymentIntents.create + webhook reconciliation
        ├── Audit worker          → before/after snapshot to tenant audit log (ADR-0011)
        └── Cart-TTL worker       → release abandoned cart reservations
        │
        ▼
Stripe webhook → signed callback → Master finalises booking state
```

## The Three Pillars Of v2

### 1. Tenant Isolation

<p data-mode="engineer">Every read and write enforces tenant-scoping at the DB layer (PostgreSQL row-level security where applicable, application-layer enforcement everywhere else). A bug in tenant scoping would leak booking data across customers — <em>not a SOC2/HIPAA gray area; a hard fail.</em> The isolation primitive was tested before the feature was tested.</p>

<p data-mode="engineer">The shape, in practice: a <code>tenant_id</code> on every row, a session-scoped <code>SET app.tenant_id</code> at the start of every connection, an RLS policy that scopes <code>SELECT/INSERT/UPDATE/DELETE</code> to that setting, and an application-layer guard that refuses to issue a query without a tenant context bound. Three layers, not one — because any single layer can be bypassed by the bug we haven't written yet.</p>

### 2. Stripe Connect Integration With Booking-Item Snapshots

<p data-mode="engineer">Every booking captures a JSON snapshot of the service, price, tax, and tenant payment configuration <em>at the time of booking</em>. Renaming a service later cannot rewrite a customer's history. Refund logic reads the snapshot, not the live row.</p>

```typescript
// booking_snapshot.ts — the contract that closes a class of disputes
type BookingSnapshot = {
  service: { id: string; name: string; price_cents: number; ... };
  tenant: { id: string; stripe_account_id: string; tax_config: TaxConfig };
  policies: { cancellation: PolicyDoc; reschedule: PolicyDoc; ... };
  created_at: string; // ISO-8601
};

async function createBooking(req: BookingRequest): Promise<Booking> {
  const snapshot = await materialiseSnapshot(req.tenantId, req.serviceId);  // input
  const reservation = await reserveSlot(req.tenantId, req.slotId);          // process: with TX block
  const intent = await stripe.paymentIntents.create({                       // process: Stripe Connect
    amount: snapshot.service.price_cents,
    currency: 'usd',
    on_behalf_of: snapshot.tenant.stripe_account_id,
    transfer_data: { destination: snapshot.tenant.stripe_account_id },
    metadata: { booking_id: reservation.id, snapshot_hash: hash(snapshot) },
  });
  return persist({ reservation, snapshot, intent });                        // output
}
```

<p data-mode="engineer">Three clauses are load-bearing. <code>materialiseSnapshot</code> freezes service, price, tax, and policy as a single JSON object — the row the customer agreed to, not the row that exists today. <code>reserveSlot</code> runs inside the v1 transaction block (Blueprint §1) so two requests can never claim the same slot. The Stripe <code>paymentIntents.create</code> uses <code>on_behalf_of</code> + <code>transfer_data.destination</code> to route funds straight to the tenant's connected account — the platform never sits in the money path. The <code>snapshot_hash</code> in metadata makes every Stripe event traceable back to the exact booking shape that produced it.</p>

<p data-mode="engineer">Refunds and disputes read the snapshot, never the live row. A tenant who renames a service three months after a booking does not retroactively change what the customer is owed; the snapshot says what the customer paid for, and the refund logic obeys it. This single discipline — <em>read the snapshot, not the row</em> — closes a class of disputes that v1's entity-snapshot pattern was already designed for; v2 just extended the pattern across the money boundary.</p>

### 3. Cart Logic, Blocked Slots, Cart Persistence

<p data-mode="engineer">A booking is rarely a single click. Carts hold across sessions. Blocked slots reflect both pre-existing bookings <em>and</em> in-flight cart reservations. Service-policy variations (cancellation windows, reschedule fees, partial-payment rules) live in tenant-scoped policy documents — read at cart-resolution time, not at create-booking time, so policy changes propagate cleanly.</p>

<p data-mode="engineer">The blocked-slot view is the critical join. v1's slot algorithm subtracted bookings from windows in a single pass; v2 extends that subtraction with cart reservations on a TTL — a slot held by an in-flight cart is unavailable to a second customer, but if the cart abandons, the slot returns to inventory without a cron sweep. Same shape as v1, one more set in the subtraction.</p>

## The Velocity Story — Claude Max And The High-Agency Four

<p data-mode="engineer">Paid the $200/mo for Claude Max access. Lived inside it for 30 days. The engine I had been collaborating with on architecture since the Lambda Swarm (Phase 6, August 2024) had reached operational peak — <em>the AI was the second engineer in every session.</em> Architecture reviews, code shape decisions, edge-case enumeration, schema-shape iteration. Not generation; collaboration. The 10x claim is not marketing; it is what made one month of work possible at this scope.</p>

<p data-mode="engineer">The cadence: open the session with the doctrine in scope ("Cynical Architect on the Stripe webhook handler — what's the recovery path before I write the happy path?"); iterate on the shape until the failure modes were enumerated; then write the code. The AI's job was to surface the edge case I would have found in week three, in week one. <em>The judgment about which doctrine to apply at which seam never left the engineer.</em> The AI never picked the doctrine; it stress-tested the application of it.</p>

<p data-mode="founder">The team — one engineer on the frontend / surface integration, one on the booking-flow + cart-logic backend, one on the Stripe Connect integration and reconciliation — operated at the same velocity because they were the kind of team that does not need to be told the same thing twice. <em>High-agency teams don't need management; they need vocabulary.</em> The Cynical Architect / Audit Architect doctrines on this site provided the vocabulary; the team did the rest.</p>

## Why This Was Different From v1

<p data-mode="engineer">v1 was a clean-room build against an empty surface — late 2023, no production users on the new code, every shape derived from first principles. v2 was the inverse. 1,500+ tenants were already booking against v1; the website team's read shape (Case Study 07) was already locked; the audit trail (ADR-0011) was already producing receipts that compliance was reading. v2's design constraint was not "what is the right shape" but "what is the right shape <em>that does not break any of the four contracts already in production</em>." The doctrines were the contracts. The build was the negotiation.</p>

## The Outcome

- Shipped on time. NRR-critical surface live for 1,500+ tenants.
- The audit trail (per ADR-0011) made every booking traceable end-to-end for compliance review.
- Zero double-booking, zero payment-side discrepancies in the first month of production.
- The doctrines stacked: Cynical Architect (recovery primitives) + Audit Architect (audit trail) + Master-Worker (load shedding) + Drizzle/Terraform (compliance-readable changes) — *all four working at once on the same surface.*

<p data-mode="founder">The receipt was not in the launch metrics; it was in what didn't happen afterwards. No emergency patches in week two. No "we missed a tenant config" in week three. No Stripe-side reconciliation delta at month-end. The same silence the Zoca migration produced from the website team (Case Study 07), produced one tier deeper — by the doctrines, on the surface that was supposed to be the company's hardest build of the year.</p>

## The Lesson

- **Three years of doctrine on this site bought a one-month build.** The doctrines are the leverage. The build was the application.
- **Booking-item snapshots are the right shape for any payment-touching surface where the underlying entity can mutate.** Take the snapshot at the moment of commitment; never trust the live row to remember what the customer agreed to.
- **AI-as-collaborator is the engineering ceiling, not floor, of velocity.** The Claude Max sessions did not write the system; they let me think faster about the system. The judgment about which doctrine to apply at each seam stayed with the engineer.
- **A small high-agency team beats a large team on a 30-day clock.** Three engineers + a senior + an AI pair > eight engineers without the doctrines.

> *"The doctrines are the leverage. The build is the application."* — me, on the v2 ship, late February 2026.
