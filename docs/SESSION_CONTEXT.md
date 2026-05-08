# SESSION_CONTEXT.md — Handoff for the Next Session

> **Read this file first** when picking up this portfolio in a new session.
> It captures everything a future collaborator (Claude or human) needs to
> resume work without re-deriving context from scratch.
>
> **Last updated:** 2026-05-08, at end of the migration-to-Pages session.

---

## 1. The 60-second briefing

- **What this repo is:** A brutalist, zero-build, zero-framework personal portfolio for Deepesh Rathod (Founding Engineer / Tech Lead). Live at https://v1.deepesh-engg.in.
- **What was built last session:** v1 of the entire site — content, design, routing, deploy pipeline. Then migrated hosting from Cloudflare Tunnel to Cloudflare Pages mid-session.
- **What the next session needs to do:** **Phase 4 content** — write up the 2024 — 2026 era (Cloud Ownership & Tech Lead). The infrastructure is done; the story is what's missing.
- **Current state of the public site:** Phases 0 — 3 are written and live. Phase 4 has a placeholder banner saying *"Status · Drafting — lands as soon as it's ready."*

---

## 2. Files to read before doing anything

In this order:

1. **This file** (`docs/SESSION_CONTEXT.md`) — current
2. [`JOURNEY.md`](../JOURNEY.md) — 2-minute repo intro, file map
3. [`DEPLOYMENT.md`](../DEPLOYMENT.md) — operational runbook (deploy, cache-bust, rollback)
4. [`adr/0005-tunnel-to-pages-migration.md`](../adr/0005-tunnel-to-pages-migration.md) — most recent architectural decision; explains the cross-account DNS topology
5. [`docs/journal.md`](./journal.md) and [`docs/manifesto.md`](./manifesto.md) — voice + tone calibration before writing any new long-form content

---

## 3. Phase 4 — The Cloud Ownership & Tech Lead Era (2024 — 2026)

This is the bulk of what the next session is for.

### 3.1 Source material

The structured executive version lives in [`Deepesh_Rathod_Resume.pdf`](../Deepesh_Rathod_Resume.pdf). Key bullets to convert into long-form narrative:

**2024 era (Founding Engineer at Zoca, formerly Chrone)**
- Spearheaded mobile-app backend migration from Python monolith to Node.js services.
- Established team-wide developer-experience standards and shared utility tooling.
- Engineered a distributed media pipeline handling 1,000+ uploads/day across 900+ GB of S3 storage, with content-aware duplicate detection (0.1 — 5% reclaimed).
- Owned the entire AWS Cloud Infrastructure & DevOps after senior leaders departed — full infrastructure ownership during a critical leadership transition.
- Architected a hyper-local keyword demand system with 5-mile-radius geo-accuracy by integrating US Census data.
- Designed and shipped v1 of the Scheduling product end-to-end.

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

Per a decision in the previous session about case-study count:

- **Cap case studies at 3 — 5 max total.** The two existing (Christmas SQL, 175-Lead Bug) plus 1 — 2 from this era is the upper bound. Beyond that, the homepage list stops being scannable.
- **Don't add a case study for the Website Suggestions feature** — it's already mentioned in `journey.md` as the work that earned the salary hike + ESOPs. Without a deeper *transferable lesson*, it doesn't earn a case-study slot. (If a deeper story emerges in the next session, reconsider.)
- **Don't add a case study for the Scheduling system as a whole** — its architecture is in `blueprints.md` and its emotional arc is in `journal.md`. A case study would duplicate.

### 3.4 Once Phase 4 lands

1. Remove or replace the **"Status · Drafting"** banner in `index.html` (`<section class="banner">`).
2. Update the matching scope notes at the bottom of `journey.md` and `journal.md`.
3. Bump `?v=3` to `?v=4` in `index.html` if `assets/app.js` or `assets/styles.css` change at all (cache-bust per `DEPLOYMENT.md` §2).
4. Update **this file** (`SESSION_CONTEXT.md`) with the new state for the *following* session.

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
| Phase 4 content (this whole doc's reason for existing) | Pending | §3 above |
| **Pin repos** on github.com/deepesh-01 (portfolio, resume-bot, job-intake) | Pending — manual web UI step | https://github.com/deepesh-01 → "Customize your pins" |
| **r/forhire** post | Pending — needs account karma | Comment on a few r/freelance / r/cscareerquestionsIndia threads first to earn karma |
| **HackerNews Show HN** post | Optional next step | Format in conversation history; recommended time 8 — 10 AM PT |
| **Tunnel cleanup** (`v1-portfolio` tunnel + `serve.sh` python server) | Pending — redundant after Pages migration | See §7 below |
| `cert.pem` API-token rotation | Low priority | `cloudflared tunnel login` overwrites it |
| Reddit account aging (1 week + double-digit karma) | In progress | Required before posting to stricter subs |

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
