# SESSION_CONTEXT.md — Handoff for the Next Session

> **Read this file first** when picking up this portfolio in a new session.
> It captures everything a future collaborator (Claude or human) needs to
> resume work without re-deriving context from scratch.
>
> **Last updated:** 2026-05-08, at end of **The Collision & Resilience Era** session
> (Phase 7 — December 2024 — landed live).

---

## 1. The 60-second briefing

- **What this repo is:** A brutalist, zero-build, zero-framework personal portfolio for Deepesh Rathod (Staff Engineer / Founding Engineer). Live at https://v1.deepesh-engg.in.
- **What was done in the most recent session:** Shipped Phase 7 — The Collision & Resilience Era (December 2024). The rawest period of the Zoca transition: Spike Mode (top floor, Red Bull, sofas), Harshpal's blackout, the December 22nd collision and the Jan 1st deadline clash, the physical confrontation between the Founder and Pravesh with me as the literal middle man, the team fracture (Pravesh and Kushal left), the Stay-or-Leave interrogation, the oath reaffirmed, the transition from "Tech Leader" to **Guardian of the Product's Survival**. Plus the technical work that defined the era: the **PSQL audit-by-snapshot function** — a single PostgreSQL function that generates a shadow log table for any entity with nested before/after JSON snapshots. New Case Study 09 (PSQL Audit Function), new Blueprint §10, new ADR-0011 (Audit-by-Snapshot, extends the Cynical Architect doctrine).
- **What was done in earlier sessions:** Phase 6 (Funding & Swarm Era). The orphaned-window retelling + the Cynical Architect doctrine. The Arrow / Shield team dynamic (Pravesh + me = Arrow, **Durga** + Sahil = Shield). The 11 AM to 2 PM battle (US-based CEO, 3-hour feedback loops, $6M on the line). The Streamlit Revenue Opportunity engine. The Lambda Swarm + Step Functions hierarchy with S3 JSON state — 2hr → 5min, first meaningful Claude collaboration on architecture. The Zoca unified-service migration (480+ users, 0 failures, 0 downtime, 0 website-side code changes). Two new case studies (`zoca-unified-migration`, `lambda-swarm`). New blueprint §9 (Lambda Swarm). New product-growth §5 (Revenue Opportunity Engine). Two new ADRs (0009 Lambda Swarm + Step Functions, 0010 Recovery-First Architecture / Cynical Architect doctrine). Identity title bumped to **Staff Engineer / Founding Engineer**. The Oath now sits at the top of identity.md alongside the Motto.
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

- **Case studies are now at 9** (Christmas SQL, 175-Lead Bug, Ghost Sprint, 150GB Migration, Flask-to-Node Fallback, SQL Optimisation 15m→75s, Zoca Unified Migration, $6M Lambda Swarm, PSQL Audit Function). **The 8-cap was overruled by the user in this session — 9 is the new hard cap.** A 10th must retire one of the older ones first. Likely candidate for retirement: 175-Lead Bug (least transferable-lesson-shaped of the nine).
- **Don't add a case study for the Website Suggestions feature** — already in `journey.md` as the salary-hike + ESOPs trigger; no deeper transferable lesson on file.
- **Don't add a case study for the Scheduling system as a whole** — architecture in `blueprints.md`, emotional arc in `journal.md`.
- **Don't add the Mobile-Backend migration as its own case study** — already covered in The Thunderstorm (Ghost Sprint context) and journey.md.

### 3.4 Once the May 2024 — May 2026 chapter lands

1. Replace the home-page banner ("Status · Shipping On The Go") in `index.html` (`<section class="banner">`) with the next-period announcement, or remove the banner entirely if all eras are caught up.
2. Update the closing scope notes at the bottom of `journey.md` and `journal.md` accordingly.
3. Bump `?v=4` to `?v=5` in `index.html` if `assets/app.js` or `assets/styles.css` change (cache-bust per `DEPLOYMENT.md` §2).
4. Update **this file** (`SESSION_CONTEXT.md`) with the new state for the *following* session.

### 3.5 Editorial-name policy carry-over (important)

Authorised names on the live site (cumulative across sessions): **Shambhav** (Founder/CTO of the stealth entity, Thunderstorm), **Vishal** (engineer who paired with Shambhav, later a departing mentor), **Animesh** (Junior FE, Thunderstorm), **Robin** (co-founder/CTO), **Ashish** (CEO), **Vinay** (mentor who departed, August 2024), **Ruddhi** (mentor who departed, August 2024), **Pravesh** (Arrow team Phase 6; departed in the Phase 7 fracture), **Sahil** (Shield team), **Durga** (Shield team), **Harshpal** (engineer who blacked out — NEW in Phase 7), **Kushal** (engineer who left with Pravesh — NEW in Phase 7). Older 2023 entries that previously anonymised "Robin" / "Ashish" remain anonymised — over-publishing without explicit re-confirmation is harder to undo than under-publishing.

**Brand-name policy carry-over:** The user asked us to scrub the *new entity's* actual brand name from the public site to avoid carrying any legal/compliance smell into the portfolio (this file is publicly reachable at `/docs/SESSION_CONTEXT.md`, so we keep it scrubbed here too). The story reads as a **stealth pivot to an unnamed new entity** triggered by legal/compliance issues on the existing brand. The predecessor brand is also softened in legal contexts to "the existing brand identity". Carry this forward: when documenting the next chapter, do not name the stealth entity, and do not surface the predecessor brand name alongside any legal/compliance language. Naming Zoca (the current employer) is fine; it appears in the resume.

For the next session: **default back to anonymisation** unless the user names someone explicitly. Do not extrapolate the Thunderstorm exception. If the user mentions a colleague by name in source material for the next phase, ask for confirmation before publishing the name.

---

## 4. Editorial constraints (decided in previous sessions, do not relitigate)

These are settled. Don't second-guess them while writing Phase 4 — re-deriving voice mid-narrative breaks consistency.

- **No real names of colleagues.** Use "leadership", "a senior teammate", "the team", etc. Phrases like *"Robin, my CTO, said…"* become *"the response that came back was…"*.
- **No specific job titles** of individuals where avoidable. Story-essential titles ("the CEO") are OK; gratuitous ones ("the PM, Kushagra") are not.
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
| **Phase 7 (The Collision & Resilience Era)** | ✅ Shipped 2026-05-08 | journey.md (Phase 7, 9 sub-sections) / journal.md (Collision memoir, 10 sub-sections, Harshpal + Kushal + the literal middle-man framing) / case study 09 (PSQL Audit Function) / blueprints §10 (PSQL Snapshot Logic) / ADR-0011 (Audit-by-Snapshot — extends the Cynical Architect doctrine) / identity gains "Battle-Tested Leader · Guardian of the Product's Survival" + ADR-0011 in doctrine line |

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
