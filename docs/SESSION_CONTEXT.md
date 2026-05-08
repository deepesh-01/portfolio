# SESSION_CONTEXT.md — Handoff for the Next Session

> **Read this file first** when picking up this portfolio in a new session.
> It captures everything a future collaborator (Claude or human) needs to
> resume work without re-deriving context from scratch.
>
> **Last updated:** 2026-05-09, at end of **The Golden Bloom** session
> (Phase 9 — April to November 2025 — landed live; victory-lap chapter before the Bubble Burst).

---

## 1. The 60-second briefing

- **What this repo is:** A brutalist, zero-build, zero-framework personal portfolio for Deepesh Rathod (Staff Engineer / Founding Engineer). Live at https://v1.deepesh-engg.in.
- **What was done in the most recent session:** Shipped Phase 9 — The Golden Bloom (April — November 2025). Victory-lap chapter before the coming Bubble Burst. The shift from Lead → **Internal Consultant / Institutional Encyclopedia**. The Town Hall successor monologue ("the Noob Coder is dead"). The War Room era with **Sachin Shenoy** (Dockerized testing pipeline, pragmatism over TDD). The Enterprise era with **Himanshu Hazarika (IIT KGP '08)** — Drizzle ORM migration, Terraform IaC, SOC2/HIPAA prep. The 4-Agent rebrand (Local SEO / Win / Loyalty / Social). The Win Agent's invariant-based deterministic testing suite. Metabase dashboards built with Claude Code as the pair. Personal: the Himalayan 450, Pondicherry ride with girlfriend, the Alpha Male wall coming down, living 500m from partner. Peak metrics: **$3.5M ARR · 1,500+ customers · 140+ headcount**. New Case Study 11 (Win Agent Testing), new Blueprint §13 (Drizzle ORM + Terraform IaC), new ADR-0014 (Drizzle ORM + IaC for compliance), new ADR-0015 (Deterministic LLM Testing). Identity title bumped to **Founding Member & Internal Technical Consultant at Zoca**.
- **What was done in earlier sessions:** Phase 6 (Funding & Swarm Era). The orphaned-window retelling + the Cynical Architect doctrine. The Arrow / Shield team dynamic (a partner and I = Arrow; two more teammates = Shield). The 11 AM to 2 PM battle (US-based CEO, 3-hour feedback loops, $6M on the line). The Streamlit Revenue Opportunity engine. The Lambda Swarm + Step Functions hierarchy with S3 JSON state — 2hr → 5min, first meaningful Claude collaboration on architecture. The Zoca unified-service migration (480+ users, 0 failures, 0 downtime, 0 website-side code changes). Two new case studies (`zoca-unified-migration`, `lambda-swarm`). New blueprint §9 (Lambda Swarm). New product-growth §5 (Revenue Opportunity Engine). Two new ADRs (0009 Lambda Swarm + Step Functions, 0010 Recovery-First Architecture / Cynical Architect doctrine). Identity title bumped to **Staff Engineer / Founding Engineer**. The Oath now sits at the top of identity.md alongside the Motto.
- **What the next session needs to do:** Whatever the user brings next. Possible threads still in the résumé that haven't fully landed: the AWS ECS/Fargate consolidation specifics, the Hyper-local keyword demand system (US Census), the Senior Buddy / hiring program (20+ interviews), the 90 → 1,500 scale-up internals (tenant isolation, SOC2/HIPAA prep), the AI-native RCA toolchain (Claude Code + Metabase MCP + AWS CLI, 2-3hr → ~5min RCAs).
- **Current state of the public site:** Phases 0 — 6 are written and live. The home-page banner now reads *"Status · Live · Shipping On The Go — Phase 6"*. **$6M funding closed** appears on the home page. **8 case studies** live (cap was 6; the 6→8 raise is per this session — treat 8 as the new soft cap).

---

## 2. Files to read before doing anything

In this order:

1. **This file** (`docs/SESSION_CONTEXT.md`) — current
2. [`JOURNEY.md`](../JOURNEY.md) — 2-minute repo intro, file map
3. [`DEPLOYMENT.md`](../DEPLOYMENT.md) — operational runbook (deploy, cache-bust, rollback)
4. [`adr/0005-tunnel-to-pages-migration.md`](../adr/0005-tunnel-to-pages-migration.md) — most recent architectural decision; explains the cross-account DNS topology
5. [`docs/journal.md`](./journal.md) and [`docs/manifesto.md`](./manifesto.md) — voice + tone calibration before writing any new long-form content

---

## 3. Phase 5 — May 2024 — May 2026 — Cloud Ownership & Tech Lead

This is the bulk of what the next session is for. **Phase 4 (The Thunderstorm — Jan to May 2024) already shipped this session.** The earlier chunks of "Phase 4" from previous notes — mobile-backend migration, distributed media pipeline, hyper-local keyword demand, Scheduling v1 — *partially* landed in The Thunderstorm. What remains is the May 2024 onwards material.

### 3.1 Source material

The structured executive version lives in [`Deepesh_Rathod_Resume.pdf`](../Deepesh_Rathod_Resume.pdf). Key bullets that **still need long-form**:

**Mid-to-late 2024 (still Founding Engineer at Zoca)**
- Owned the entire AWS Cloud Infrastructure & DevOps after senior leaders departed — full infrastructure ownership during a critical leadership transition.
- Architected a hyper-local keyword demand system with 5-mile-radius geo-accuracy by integrating US Census data.
- (The mobile-backend Python → Node.js migration and the distributed media pipeline already touched in The Thunderstorm — extend them with mid-late 2024 detail if there's more story.)

**2025 — present era (Founding Engineer / Tech Lead at Zoca)**
- Defined the foundational AWS ECS / Fargate stack that scaled the company from **90 → 1,500 customers (1,000+ paying, $1M+ ARR)**.
- Consolidated 3 servers + 50 — 60 Lambdas into 6 autoscaling services + 10 workers + 10 Lambdas.
- Led **zero-failure migration** of all legacy users — no data loss, no production incidents, no rollbacks.
- Built an **AI-native engineering toolchain** (Claude Code + custom Metabase MCP server + AWS CLI) compressing RCAs from 2 — 3 hours to ~5 minutes (25 — 35× speedup).
- Auto-updating doc pipeline + Mac-based local infra clone for AI-driven E2E testing.
- Designed tenant isolation + database-layer audit logging for SOC2 / HIPAA readiness.
- Integrated Retell / Voice AI for an early cohort with full observability layer.
- Led the Scheduling & Payments Pod — RFC processes, code-review standards, architectural guidelines.
- Helped scale engineering from 2 — 3 → 15 — 18; ran 20+ technical interviews; Senior Buddy for 4+ engineers.

### 3.2 Where each piece should live

| Material | Suggested home |
|---|---|
| Timeline overview of Phase 4 (compressed) | Add Phase 4 section in [`docs/journey.md`](./journey.md) — replace the current "drafting" placeholder |
| Raw narrative / "I lived this" entries (uncompressed) | Add 2024 — 2026 sections to [`docs/journal.md`](./journal.md) — replace the "Loading Soon" placeholder |
| AWS ECS / Fargate decision, Lambda consolidation, audit-trigger evolution, pre-bootup pipeline updates | Extend [`docs/blueprints.md`](./blueprints.md) (architecture deep-dives) |
| AI-native RCA toolchain | **Strong candidate for a new case study** (`docs/case-studies/ai-native-rca.md`) — has a clear before/after metric (2 — 3hr → 5min), a transferable lesson, and is the most distinctive recent work |
| Zero-failure migration | **Second strong case-study candidate** (`docs/case-studies/zero-failure-migration.md`) — high stakes, specific timeframe, transferable migration choreography lesson |
| Hiring / Senior Buddy / leadership content | Add to [`docs/product-growth.md`](./product-growth.md) (4th section) or a new doc on engineering leadership |
| Tech Lead title update | Update [`docs/identity.md`](./identity.md) headline — current says "Logic-First Systems Architect"; consider adding "Tech Lead" |

### 3.3 What NOT to add

Per case-study-count discipline:

- **Case studies are now at 11** (Christmas SQL, 175-Lead Bug, Ghost Sprint, 150GB Migration, Flask-to-Node Fallback, SQL Optimisation 15m→75s, Zoca Unified Migration, $6M Lambda Swarm, PSQL Audit Function, Master-Worker Architecture, Win Agent Testing). The cap kept moving; treat 11 as the new ceiling. Past 11, the home-page list stops being scannable — retire an older one before adding. Likely candidate for retirement: 175-Lead Bug (least transferable-lesson-shaped of the eleven).
- **Don't add a case study for the Website Suggestions feature** — already in `journey.md` as the salary-hike + ESOPs trigger; no deeper transferable lesson on file.
- **Don't add a case study for the Scheduling system as a whole** — architecture in `blueprints.md`, emotional arc in `journal.md`.
- **Don't add the Mobile-Backend migration as its own case study** — already covered in The Thunderstorm (Ghost Sprint context) and journey.md.

### 3.4 Once the May 2024 — May 2026 chapter lands

1. Replace the home-page banner ("Status · Shipping On The Go") in `index.html` (`<section class="banner">`) with the next-period announcement, or remove the banner entirely if all eras are caught up.
2. Update the closing scope notes at the bottom of `journey.md` and `journal.md` accordingly.
3. Bump `?v=4` to `?v=5` in `index.html` if `assets/app.js` or `assets/styles.css` change (cache-bust per `DEPLOYMENT.md` §2).
4. Update **this file** (`SESSION_CONTEXT.md`) with the new state for the *following* session.

### 3.5 Editorial-name policy — UPDATED, IRREVERSIBLE

**The user issued a final policy** (this turn, across all phases): *"no name calling — we don't want to write anything about anyone which can be misused — we will take accountability and share only my story."*

**Rule, going forward:** **No real names of colleagues anywhere on the public site.** Use role-based phrasing only: *"the Founder", "leadership", "the CEO", "a co-founder", "a senior engineer", "a mentor", "the lead engineer I partnered with", "a teammate", "a junior frontend engineer", "another teammate", "one of our core engineers"*. Where a story structurally requires identifying *who* did *what*, prefer reframing to focus on the user's actions / feelings / learnings — *"share only my story"* is the principle.

**Story-essential phrases that survived the scrub (these all work without names):**
- "the Founder reported 'zero friction'" — the *Ghost Sprint* DevEx win
- "the Founder's 'negative motivation'" — the *150GB Migration* recovery
- "Arrow / Shield" — the *Funding Sprint* team-split metaphor (no names, just the dynamic)
- "physical and verbal confrontation between leadership and the lead engineer" — the *Dec 22 Collision*
- "two of my closest teammates left, including the lead I'd partnered with on the funding" — the *Phase 7 Fracture*
- "to leadership, returning from the Pune trip" — the *Stabilization Oath* attribution
- "one of our core engineers blacked out from exhaustion" — the Phase 7 *Blackout*

**For the next session:** Do NOT name colleagues, even if the user's source material does. If new source material includes names, replace with role-based phrasing during extraction. Quotes attributed to named people get role-based attribution. The user has explicitly delegated this judgment.

**Exception carry-over (Phase 9):** Two senior external collaborators are publicly credited by name on the live site because the user *explicitly named them in the task brief* with positive professional context: **Sachin Shenoy** (War Room collaborator) and **Himanshu Hazarika, IIT KGP '08** (Enterprise / Drizzle / IaC collaborator). This exception applies to these two names only and only because the user explicitly authorized them in the Phase 9 brief. Do not extrapolate the exception. Future sessions: same default rule — names get scrubbed unless the user explicitly authorizes them in that turn's brief.

**Brand-name policy carry-over** (unchanged): No predecessor brand names anywhere in legal/compliance context. Zoca (current employer) is fine. *"the existing brand identity"* / *"the new entity"* / *"the stealth pivot"* / *"the predecessor identity"* are the canonical phrasings.

---

## 4. Editorial constraints (decided in previous sessions, do not relitigate)

These are settled. Don't second-guess them while writing Phase 4 — re-deriving voice mid-narrative breaks consistency.

- **No real names of colleagues — universal rule, no exceptions.** Use "leadership", "a senior teammate", "the team", "the Founder", "the lead engineer I partnered with", "a teammate", etc. The user's principle: *"share only my story."*
- **Roles are OK; names are not.** Story-essential roles ("the CEO", "the Founder", "the lead engineer") are fine where they're structurally needed. Gratuitous roles attached to identifiable people (e.g. naming the PM) are not.
- **Brutalist voice.** Declarative, terse, story-driven. No marketing fluff. Reference: `docs/journal.md` for raw, `docs/manifesto.md` for principle-tone, `docs/blueprints.md` for technical-tone.
- **IPO Framework as backbone.** Every new blueprint or case study should fit the **Input → Process → Data Context → Output** lens (see `docs/identity.md` and `docs/manifesto.md` §I).
- **"Logs over excuses"** — concrete numbers, dates, durations beat vague claims. *"Scaled 90 → 1,500 customers (~1,000 paying, $1M+ ARR)"* beats *"scaled significantly"*.
- **Em-dashes are fine** — they match the existing voice. Code-switching to Hindi where authentic (e.g., *"Yaar, dar lag rha hai"*) is also fine.
- **`<p data-mode="…">` markup** for perspective tagging. Tags: `founder`, `engineer`, `human`. Multiple allowed (`data-mode="founder engineer"`). Untagged paragraphs are universally visible.

---

## 5. Settled architecture (do not redo)

| Thing | Status | Where |
|---|---|---|
| Markdown parser (vanilla, ~120 LOC) | Settled | `assets/app.js` — see `adr/0003-vanilla-markdown-parser.md` |
| Perspective toggle (`data-mode` attr + CSS) | Settled | `assets/styles.css` + `assets/app.js` — see `adr/0002-perspective-toggle-data-mode.md` |
| Brutalist dark mode (no animations beyond opacity) | Settled | `assets/styles.css` |
| BACK button inside the nav (sticky, history-aware) | Settled | `index.html` `#navBack` + `assets/app.js` `wireNavBack()` |
| Cache-bust convention (`?v=N`) | Settled | `index.html` — see `DEPLOYMENT.md` §2 |
| Hosting on Cloudflare Pages | Settled | `adr/0005-tunnel-to-pages-migration.md` |

If something on this list feels wrong while working on Phase 4, **don't change it** — write down why and surface it as an item for a *separate* refactor session.

---

## 6. Open / pending items (carried forward)

| Item | Status | Where to pick up |
|---|---|---|
| **May 2024 — May 2026 chapter** (the new Phase 5) | Pending | §3 above |
| **Pin repos** on github.com/deepesh-01 (portfolio, resume-bot, job-intake) | Pending — manual web UI step | https://github.com/deepesh-01 → "Customize your pins" |
| **r/forhire** post | Pending — needs account karma | Comment on a few r/freelance / r/cscareerquestionsIndia threads first to earn karma |
| **HackerNews Show HN** post | Optional next step | Format in conversation history; recommended time 8 — 10 AM PT |
| **Tunnel cleanup** (`v1-portfolio` tunnel + `serve.sh` python server) | Pending — redundant after Pages migration | See §7 below |
| `cert.pem` API-token rotation | Low priority | `cloudflared tunnel login` overwrites it |
| Reddit account aging (1 week + double-digit karma) | In progress | Required before posting to stricter subs |
| **Phase 4 (The Thunderstorm)** | ✅ Shipped 2026-05-08 | journey.md / journal.md / case studies 03 + 04 / blueprints §6-7 / product-growth §4 / ADR-0006 |
| **Phase 5 (The Full-Stack Builder Era)** | ✅ Shipped 2026-05-08 | journey.md (Phase 5) / journal.md (Pune + Builder section) / case studies 05 + 06 / blueprints §8 / ADR-0007 + ADR-0008 / manifesto §4 (AI-Native Handover) / identity title update |
| **Phase 6 (The Funding & Swarm Era)** | ✅ Shipped 2026-05-08 | journey.md (Phase 6) / journal.md (Funding & Swarm memoir, 13 sub-sections) / case studies 07 (Zoca migration) + 08 (Lambda Swarm) / blueprints §9 (Lambda Swarm) / product-growth §5 (Revenue Opportunity Engine) / ADR-0009 (Lambda Swarm) + ADR-0010 (Recovery-First / Cynical Architect) / identity title bumped to Staff Engineer / Founding Engineer |
| **Phase 7 (The Collision & Resilience Era)** | ✅ Shipped 2026-05-08 | journey.md (Phase 7, 9 sub-sections) / journal.md (Collision memoir, 10 sub-sections, the literal middle-man framing) / case study 09 (PSQL Audit Function) / blueprints §10 (PSQL Snapshot Logic) / ADR-0011 (Audit-by-Snapshot — extends the Cynical Architect doctrine) / identity gains "Battle-Tested Leader · Guardian of the Product's Survival" + ADR-0011 in doctrine line |
| **Phase 8 (The Stabilization & Founding Recognition Era)** | ✅ Shipped 2026-05-08 | journey.md (Phase 8, 11 sub-sections) / journal.md (Stabilization memoir, 12 sub-sections, "productivity is a byproduct of personal stability" close) / case study 10 (Master-Worker Architecture) / blueprints §11 (Master-Worker pattern) + §12 (AI Safety Layer) / ADR-0012 (Master-Worker) + ADR-0013 (LLM Guardrails) / identity bumped to "Founding Member & Lead Architect at Zoca" with comp 26+4+37; doctrine line gains ADR-0012 + ADR-0013 + RAG-ready framing |
| **Phase 9 (The Golden Bloom)** | ✅ Shipped 2026-05-09 | journey.md (Phase 9, 13 sub-sections) / journal.md (Golden Bloom memoir, 16 sub-sections, Pondicherry-ride close) / case study 11 (Win Agent Testing Suite) / blueprints §13 (Drizzle ORM + Terraform IaC) / ADR-0014 (Drizzle + IaC for compliance) + ADR-0015 (Deterministic LLM Testing) / identity bumped to "Founding Member & Internal Technical Consultant at Zoca" with peak metrics ($3.5M ARR · 1,500+ customers · 140+ headcount); two senior collaborators publicly credited (Sachin Shenoy, Himanshu Hazarika IIT KGP '08) |

---

## 7. The tunnel cleanup decision

The `v1-portfolio` Cloudflare Tunnel and the local `serve.sh` python server are now **redundant** — DNS for `v1.deepesh-engg.in` points to Cloudflare Pages, not the tunnel. They're not actively serving traffic; they're just consuming a small slice of laptop CPU/RAM.

Three options, in order of conservatism:

1. **Leave them running.** They'll die naturally on the next reboot. No work needed. The redundancy keeps a fallback alive in case Pages has an outage (you can re-PATCH the CNAME back to the tunnel target — see ADR-0005 reversibility).
2. **Kill the local processes** (the running `cloudflared tunnel run v1-portfolio` and the python `serve.sh`). The tunnel definition stays in CF Account A and can be restarted with a single command if needed.
3. **Full cleanup** — also delete the `v1-portfolio` tunnel from Account A via `cloudflared tunnel delete v1-portfolio`. Cleanest for the long term; loses the one-command-rollback ability.

The previous session ended without a decision. **Pick one in the next session** based on how confident you are in Pages (probably option 2 or 3 by then).

---

## 8. Quick reference — useful commands

```bash
# Run locally
./serve.sh                          # http://localhost:4173/

# Deploy (auto)
git push                            # Pages picks it up; ~30s

# Verify live
curl -sSI -H "User-Agent: Mozilla/5.0" https://v1.deepesh-engg.in/ | head -5

# Edit DNS in Account A via cert.pem (only if you can't access dashboard)
# Recipe in adr/0005-tunnel-to-pages-migration.md §"How the DNS edit happened"

# List CF tunnels
cloudflared tunnel list

# Stop the v1-portfolio tunnel (laptop-side process)
# Find via `ps aux | grep cloudflared` and kill the PID, or just close the terminal it's in.
```

---

## 9. Voice calibration — read these before writing

When you sit down to write Phase 4 narrative, read these three short sections first to lock in the tone:

1. **[`docs/journal.md`](./journal.md) §"The Christmas SQL Call"** — for the *human* voice (struggle, specific date, quoted phrases, single-sentence punch line).
2. **[`docs/manifesto.md`](./manifesto.md) §II "Innocence vs. Ignorance"** — for the *principle* voice (rule, *Why:*, *How to apply:*).
3. **[`docs/blueprints.md`](./blueprints.md) §"Scheduling v1: The Integrity Engine"** — for the *technical* voice (problem → solution → invariants → code block).

The Phase 4 content will need all three voices distributed across the journey/journal/blueprints/case-studies files.

---

## 10. Notes for *the next* update of this file

After Phase 4 lands, the *next* version of this doc should:

- Remove §3 (Phase 4 plan) since it's done; replace with Phase 5 plan if applicable.
- Move "tunnel cleanup" out of pending (it should be resolved by then).
- Update §1 timeline ("Last updated") and current-state line.
- Carry forward §4 editorial constraints unchanged unless deliberately rethinking them.
- Update §5 settled architecture if anything new was added.

Treat this file as an **append-only log of project state** — each session leaves the next session a working snapshot.
