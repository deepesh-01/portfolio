# Marketing · Cover-Page Strategy

> Internal positioning doc for the home page (`/`).
> Codifies why the Strategic Command Center exists, who each surface is
> for, and what the 30-second scan must convey for each persona.

## North Star

> A CTO must be able to scan the page in 30 seconds and decide whether
> to keep reading. A recruiter must be able to find the resume in three
> clicks. A founder must be able to find the receipts (ARR, customers,
> $6M close) above the fold. The novel sits underneath, unhidden but
> not in the way.

**Aesthetic:** Hybrid Dashboard. Scannable visuals on top. Expandable
"Novel" (long-form memoir) underneath.

**Tone:** Brutalist, declarative, monospace. *Logs over excuses.*

---

## The Three Personas

| Lens | Audience | Page they enter | Hook |
|---|---|---|---|
| **Founder** | Seed → Series-A founders, hiring a Founding Engineer | `/founder.html` (or the persona-gate column on `/`) | "Pre-revenue → $3.5M ARR. The Founding Engineer who's already lived your dark night." |
| **Engineering** | CTOs, EMs, Tech Leads, Staff peers | `/leader.html` (or the persona-gate column on `/`) | "18 ADRs. 13 case studies. Six years of decisions, written at the time they were made." |
| **TA / HR** | Recruiters, sourcers, ATS-driven readers | `/recruiter.html` (or the persona-gate column on `/`) | "Senior SWE · 4+ yrs pro · resume + keyword vault · available Jun 2026." |

## The Founder Column — GTM Speed & ROI

Hard numbers above the fold. Money first. The bullets:

- **$6M Series A closed** · Lambda Swarm rescue · 2hr → 5min
- **30-second Web Gen** · AI-native end-to-end
- **10× Bug-to-Fix** loop · QAs raise fixes via Claude Chrome Testing
- **$3.5M ARR · 1,500+ customers · 140+ humans** · 0 → here

The Founder doesn't want a code listing. The Founder wants the line
*"this person has shipped under the conditions I am about to be in."*
Every bullet maps a verifiable claim to a case study or ADR underneath.

## The Engineering Column — Architecture & RCA

Architecture artefacts above the fold. ADR count, blueprint count,
characteristic patterns. The bullets:

- **55 MB prod footprint** · Rspack vs Webpack memory win
- **5-minute RCAs** · Claude Code + Metabase MCP + AWS CLI (25–35× faster)
- **Master-Worker Redis** · NestJS + Lambda callbacks · 480 users · 0% loss
- **18 ADRs published** · written at the time the decision was made

The Engineering reader wants to know whether the substrate is
*portable*. The bullets are picked to demonstrate that this engineer
ships *systems*, not features.

## The TA / HR Column — Skills & Leadership

ATS-friendly. Title-laden. Availability-first. The bullets:

- **EM** · Lead Architect · Crisis Engineering Manager · Institutional Guardian
- **4+ yr** professional · 6 yr arc · Founding Member at Zoca (Sep 2022 → May 2026)
- **20+** interviews led · Senior Buddy to 4+ engineers · scaled 2 → 15-18
- **KV** Keyword Vault · AWS · NestJS · React · TS · LLM · Stripe · Drizzle · IaC

The TA reader is filtering against a JD. The keyword vault, the title
ladder, the availability date — these are the three answers a sourcer
needs in six seconds.

---

## The Capstone — AI-Native Ecosystem

Below the Persona Gate, before the phase bento. Single featured card.
Four cells:

1. **Bundler win** — Rspack 55 MB
2. **Docker-less swarm** — PM2 / Caddy / portless
3. **10× QA loop** — Claude Chrome Testing
4. **Cost & composition** — $200/mo · 3 engineers

This is the *capstone proof* — it's what makes the rest of the volume
read as "this engineer has already crossed into the AI-native era,"
not "this engineer used to ship Python services."

## The Phase Bento

Six cards. One per Phase 4, 6, 8, 9, 10, 11. Each card:

- Bento Metric (the one number that matters for that phase)
- Technical Blueprint (ASCII diagram)
- 2 — 3 case-study / ADR references
- "View Memoir" toggle that opens the long-form

The reader can scan the metrics, pick the phase that matters to them,
and open exactly one memoir without scrolling through five they don't
need.

## Field Notes — Visual Milestones

Three tiles. Grayscale by default; colour on hover. The Reserved Warrior
philosophy expressed in places:

- **The First Office** (Sep 2022) — two chairs, one router. Founding.
- **The Town Hall** (Nov 2025) — 140+ humans. Peak.
- **The 1,500km Solo Ride** (May 2026) — Himalayan 450. Liberty.

Each tile carries one sentence of context. The point is not to show
photographs; it is to remind the reader that this is a person, not a
résumé.

## The Reserved Warrior Banner

Replaces the old volume-close banner. Two trajectory cells:

1. **Status** — Founding Member & Institutional Technical Guardian
2. **Available For** — Staff-level / Founding Engineer / Crisis EM

Specific compensation figures are deliberately kept off the public site
— terms are a private conversation, not a public number. The integrity
quote sits inside the banner, lifted out of the body text:

> *"Professional excellence is a byproduct of personal stability.
> Integrity over Inertia."*

## The Footer Quote

> *"Work is the byproduct of life, not the other way around."*

Single-line. Italic. The page closes the way the volume closed.

---

## What the Strategic Command Center is NOT

- It is **not** a portfolio site that exists to look modern.
- It is **not** a brag list — every number is sourced to a case study
  or an ADR.
- It is **not** a CV. The CV lives at `/Deepesh_Rathod_Resume.pdf` and
  the Strategic Command Center links to it.
- It is **not** a blog. There is no recency bias — the volume is
  closed; the doctrines compound.

## Build invariants

- One stylesheet pair: `assets/styles.css` + `assets/covers.css`.
- One script: `assets/app.js` (vanilla, ~120 LOC markdown parser).
- Zero build step. `git push` is the deploy.
- Cache-bust via `?v=N` on the three asset links.
- Brutalist palette: bg #0a0a0a, fg #f5f5f5, three accents
  (yellow / green / pink) — one per persona.

These constraints are deliberate. The site is a working sample of the
**boring is the moat** doctrine — boring substrate, expressive surface.
