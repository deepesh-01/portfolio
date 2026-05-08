# JOURNEY.md — Pick This Repo Up In Two Minutes

> A how-to guide for *this specific portfolio*. Read this once and you
> can run, edit, and deploy the site without help.

---

## TL;DR

```bash
git clone https://github.com/deepesh-01/portfolio.git
cd portfolio
./serve.sh                  # local dev: http://localhost:4173/
git push                    # production deploy: https://v1.deepesh-engg.in/
```

For the operational runbook (cache-bust, rollback, cross-account DNS),
see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## 1. The Stack

This is a **zero-build, zero-framework** static site:

```
portfolio/
├── index.html              # the entire UI shell + landing page
├── assets/
│   ├── styles.css          # brutalist dark mode
│   └── app.js              # router + markdown parser + perspective machine
├── docs/                   # the content. plain markdown.
│   ├── identity.md
│   ├── manifesto.md
│   ├── journey.md
│   ├── blueprints.md
│   ├── product-growth.md
│   ├── perspectives.md
│   ├── journal.md
│   └── case-studies/
│       ├── christmas-sql.md
│       └── 175-lead-bug.md
├── adr/                    # architecture decision records
├── serve.sh                # python3 -m http.server 4173 (local dev)
├── DEPLOYMENT.md           # production runbook
├── JOURNEY.md              # this file
└── Deepesh_Rathod_Resume.pdf
```

There is **no `package.json`**, **no `node_modules`**, **no build
output directory**. What you see is what gets served.

The full reasoning is in the ADRs:

- [ADR-0001 — The Boring Markdown Stack](./adr/0001-boring-markdown-stack.md)
- [ADR-0002 — The Perspective Toggle](./adr/0002-perspective-toggle-data-mode.md)
- [ADR-0003 — The Hand-Rolled Markdown Parser](./adr/0003-vanilla-markdown-parser.md)
- [ADR-0004 — Static Serve + Cloudflare Tunnel](./adr/0004-static-serve-cloudflare-tunnel.md) *(superseded)*
- [ADR-0005 — Tunnel → Cloudflare Pages migration](./adr/0005-tunnel-to-pages-migration.md)

---

## 2. Local Development

### Prerequisites

- **Python 3.** Pre-installed on macOS and most Linux distros.
  Verify with `python3 --version`.

That's it. No npm, no Docker, no global tools.

### Run

```bash
./serve.sh
```

Binds `127.0.0.1:4173`. Open `http://localhost:4173/`. Edit any file,
save, refresh the browser. There is no hot-reload daemon and there
isn't one needed.

### Adding a new article

1. Create `docs/<slug>.md`.
2. Add `'<slug>': 'docs/<slug>.md'` to the `SLUG_TO_PATH` table at the
   top of `assets/app.js`.
3. Add an `<a href="#<slug>">` somewhere in `index.html`'s home view.

That is the entire authoring loop. There is no manifest file, no SSG,
no front-matter contract.

### Tagging perspectives

Wrap any block-level element with a `<p data-mode="…">` tag (Markdown
allows raw HTML). Modes are space-separated: `data-mode="founder
engineer"` opts the paragraph into both the Founder and Engineer
lenses.

```markdown
This paragraph is always visible (no data-mode tag).

<p data-mode="founder">Highlights for Founder mode; dims for Engineer / Human.</p>

<p data-mode="engineer human">Shows for Engineer and Human; dims for Founder.</p>
```

A paragraph with **no** `data-mode` is universally visible.

---

## 3. Production Deployment

The site is live at **https://v1.deepesh-engg.in**, served by
**Cloudflare Pages**, deployed automatically on every `git push` to
`main`.

### Day-to-day deploy

```bash
git push    # triggers Pages auto-deploy in ~30 seconds
```

### Detailed runbook

Everything else — cache-bust convention, branch previews, rollback
procedure, the cross-account DNS setup, the list of other apps on
the same domain, common Cloudflare UI gotchas — lives in
[`DEPLOYMENT.md`](./DEPLOYMENT.md).

Read it once before doing anything more than a normal `git push` deploy.

---

## 4. Where Things Live (cheat sheet)

| Question | File |
|---|---|
| Why is the stack like this? | `adr/0001-boring-markdown-stack.md` |
| How does the perspective switcher work? | `adr/0002-perspective-toggle-data-mode.md` |
| Why no third-party Markdown library? | `adr/0003-vanilla-markdown-parser.md` |
| Why was the tunnel chosen first, then dropped? | `adr/0004-…` (superseded) and `adr/0005-…` |
| How is the site deployed today? | [`DEPLOYMENT.md`](./DEPLOYMENT.md) |
| Where is the routing table? | `assets/app.js`, `SLUG_TO_PATH` |
| Where does the Brutalist style live? | `assets/styles.css` |
| Where is the IPO grid? | `index.html`, `<section class="ipo">` |
| The raw narrative archive? | `docs/journal.md` |

---

## 5. The Spirit Of This Repo

Boring is not a constraint. Boring is the moat.

If you're tempted to add a build step, a framework runtime, or a
client-side router library — **read the ADRs first.** The friction
you're feeling is the *intended* friction. The site is sized to
survive a two-year context-switch, and every dependency you add
shortens that lifetime.

— *Built with the BMAD-METHOD (Boring Markdown). Engineered for Logic, not Layouts.*
