# ADR-0018 — Persona-Gated Hybrid Dashboard for the Strategic Command Center

**Status:** Accepted
**Date:** 2026-05-12
**Author:** Deepesh Rathod
**Context window:** the Strategic Command Center retool — the final shape of `v1.deepesh-engg.in` after the Zoca volume closes.

---

## Context

The portfolio has been through three iterations:

1. **Boring Markdown v1** (2024) — one long page, no covers. Single
   audience, single voice. Good for an engineering peer; opaque to a
   founder or a TA recruiter.
2. **Lens-Picker v1** (early 2026) — three audience-targeted cover
   pages (`/founder.html`, `/leader.html`, `/recruiter.html`) reached
   via a 3-card picker on `/`. Each cover is hand-tuned, but the home
   page itself was still mostly a long-form Novel that the reader had
   to scroll through before deciding whether to click into a cover.
3. **Strategic Command Center v1** (this ADR) — a **persona-gated
   hybrid dashboard** on the home page itself. Every persona gets a
   scannable column above the fold; the deep-dive Novel sits
   underneath, expandable but not in the way.

The retool is driven by a single observation: the median visitor to
this site is a CTO, a founder, or a TA recruiter who has thirty
seconds. The site previously made them work for the thirty-second
take. The retool gives it to them directly, while preserving the
long-form for the reader who actually wants it.

## Decision

The home page (`/`) becomes a **Strategic Command Center** with the
following surfaces, in order:

1. **Receipt Strip** — six hard numbers above the fold.
2. **Growth Arc** — six-year stack-plot timeline.
3. **Persona Gate** — three-column grid (Founder / Engineering / TA-HR)
   replacing the Lens-Picker. Each column carries 4 metric bullets +
   a one-sentence hook + a CTA into the legacy cover page.
4. **AI-Native Ecosystem Capstone** — a single featured card carrying
   the four primitives that distinguish the Phase 11 era (Rspack,
   Docker-less swarm, 10× QA loop, $200/mo composition).
5. **Phase Bento** — six expandable cards (Phase 4 — 11), each leading
   with a Bento Metric + a Technical Blueprint diagram, with the
   long-form memoir behind a `<details>` toggle.
6. **Field Notes** — three visual milestone tiles (First Office, Town
   Hall, 1,500km Solo Ride) with grayscale-to-colour hover.
7. **Reserved Warrior Banner** — the volume-close summary, the
   integrity quote, the trajectory grid (Status / Comp baseline /
   Availability).
8. **Contact + Footer** — unchanged structure; footer gains the
   Integrity quote.

The three cover pages (`founder.html`, `leader.html`, `recruiter.html`)
remain reachable from the Persona Gate. They are deep-dives for the
reader who has chosen a lens; the home page is the dashboard for the
reader who hasn't.

## Why

**Scannable for the CTO, deeply rewarding for the biopic reader.** The
hybrid is the resolution. A Brutalist long-form is great for a
specific reader and intolerable for everyone else. A dashboard is
great for everyone for thirty seconds and shallow forever. The hybrid
serves both without compromising either.

**The persona gate is the contract.** Each column is a structured
promise: *if you are this kind of reader, here are the four numbers
that matter to you, here is the hook, here is the way into the
deeper read.* The reader is never stuck guessing.

**The bento is the navigation.** Six phases × one metric each gives
the reader an instant map of the volume. The "View Memoir" toggle
keeps the long-form available without forcing it on anyone.

**The capstone is the proof.** AI-native primitives — bundler swap,
portless runtime, Chrome-side QA — show that the engineer has
*already* crossed into the era the reader is hiring for, not merely
adjacent to it.

**The Field Notes are the soul.** Three places, three captions. The
volume isn't just code; it's a six-year arc of an engineer becoming
a Reserved Warrior. The tiles are the punctuation.

## Consequences

- The home page becomes the canonical entry point. The three cover
  pages become *secondary surfaces* — still maintained, still loaded
  with cover-specific deep content, but no longer the first impression.
- The Persona Gate replaces the Lens-Picker in `assets/covers.css`.
  The Lens-Picker styles stay in the file (used by no one now) until
  the next cleanup pass — leave the dead code, document it; don't
  rewrite history.
- Six new component classes added to `covers.css`: `.persona-gate`,
  `.capstone`, `.bento`, `.field-notes`, `.warrior-banner`,
  `.integrity-quote`. All inherit the existing token system; no new
  CSS variables introduced.
- Asset cache-bust bumped: `styles.css?v=16`, `covers.css?v=2`,
  `app.js?v=16`.
- The "Volume Closed" banner becomes the Reserved Warrior trajectory
  block. The compensation baseline (28L + 37L ESOPs) is now public —
  framed as a *floor for future partners*, not a brag.

## Alternatives considered

- **Keep the Lens-Picker as-is, push everything into the cover pages.**
  Rejected: the home page is the first impression. If it fails the
  30-second test, the cover pages never load.
- **Replace the home page with a single SPA-style dashboard.**
  Rejected: violates *boring is the moat*. The site is a working
  sample of the brand's engineering doctrine.
- **Use real photographs for Field Notes.** Deferred: the source
  photos exist but aren't yet curated to the brutalist palette. ASCII
  placeholder tiles ship today; real photographs can swap in later
  without touching the layout.
- **Add a 4th persona (Investor).** Rejected: the Founder column
  already covers the investor read. Adding a column dilutes the scan.

## Reversibility

The retool is purely a home-page rewrite. The Markdown source files
under `docs/` are unchanged. Reverting is a single `git revert` of the
relevant commit; the cover pages would continue to work even with the
old Lens-Picker because their entry points are independent URLs.

## Links

- Surface: [`/`](../index.html) — the Strategic Command Center
- Source strategy: [`docs/marketing_cover_page_strategy.md`](../docs/marketing_cover_page_strategy.md)
- AI-Native memoir: [`docs/memoir_phase_9_ai_native_infrastructure.md`](../docs/memoir_phase_9_ai_native_infrastructure.md)
- Identity: [`docs/identity.md`](../docs/identity.md)
- Prior art: [ADR-0002 Perspective Toggle](./0002-perspective-toggle-data-mode.md), [ADR-0017 AI as Force Multiplier vs Liability](./0017-ai-as-force-multiplier-vs-liability.md)
