# JOURNEY.md — How To Run This Portfolio In Two Minutes

> A how-to guide for *this specific portfolio*. If you can read a
> shell prompt and you have Python 3 installed, you can have this site
> live behind your own Cloudflare Tunnel in under two minutes.

---

## TL;DR

```bash
git clone <this-repo>
cd portfolio
./serve.sh
# open http://localhost:4173
```

For public access via Cloudflare Tunnel, see [§4](#4-cloudflare-tunnel).

---

## 1. The Stack (what you're looking at)

This is a **zero-build, zero-framework** static site:

```
portfolio/
├── index.html              # the entire UI shell
├── assets/
│   ├── styles.css          # brutalist dark mode
│   └── app.js              # router + markdown parser + perspective machine
├── docs/                   # the content. plain markdown.
│   ├── identity.md
│   ├── manifesto.md
│   ├── journey.md
│   ├── blueprints.md
│   ├── perspectives.md
│   ├── journal.md
│   └── case-studies/
│       ├── christmas-sql.md
│       └── 175-lead-bug.md
├── adr/                    # architecture decision records
├── serve.sh                # python3 -m http.server 4173
├── JOURNEY.md              # this file
└── (legacy *.md at root)   # original context files; safe to delete
```

There is **no `package.json`**, **no `node_modules`**, **no build
output directory**. What you see is what you ship.

The full reasoning is in the ADRs:

- [ADR-0001 — The Boring Markdown Stack](./adr/0001-boring-markdown-stack.md)
- [ADR-0002 — The Perspective Toggle](./adr/0002-perspective-toggle-data-mode.md)
- [ADR-0003 — The Hand-Rolled Markdown Parser](./adr/0003-vanilla-markdown-parser.md)
- [ADR-0004 — Static Serve + Cloudflare Tunnel](./adr/0004-static-serve-cloudflare-tunnel.md)

---

## 2. Local Development

### Prerequisites

- **Python 3.** Pre-installed on macOS and most Linux distros.
  Verify with `python3 --version`.

### Run

```bash
./serve.sh
```

This binds `127.0.0.1:4173` (or whatever you set in `PORT=…`) and
serves the repo as static files.

### Edit & reload

There is no hot-reload daemon. Edit a file, save, refresh the browser.
That is the workflow. If you want auto-reload, drop a tab on
[livereload-vscode] or run a lightweight watcher — but it isn't part
of the contract.

[livereload-vscode]: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer

### Adding a new article

1. Create `docs/<slug>.md`.
2. Add `'<slug>': 'docs/<slug>.md'` to the `SLUG_TO_PATH` table at the
   top of `assets/app.js`.
3. Add an `<a href="#<slug>">` somewhere in `index.html`'s home view.

That is the entire authoring loop. There is no manifest file, no SSG,
no front-matter contract.

### Tagging perspectives

Wrap the paragraph that should respond to the perspective switcher
with a `<p data-mode="…">` (Markdown allows raw HTML). Modes are
space-separated: `data-mode="founder engineer"` opts the paragraph
into both the Founder lens *and* the Engineer lens.

```markdown
This paragraph is always visible.

<p data-mode="founder">This paragraph highlights for the Founder lens
and dims for the Engineer / Human lenses.</p>

<p data-mode="engineer human">This one shows up for both Engineer and
Human, dims for Founder.</p>
```

A paragraph with **no** `data-mode` is universally visible (good for
universally-relevant content — résumés, intros, footers).

---

## 3. The Public URL: Cloudflare Tunnel

The intended public URL is `v1.deepesh-engg.in`, served from your
workstation via [Cloudflare Tunnel][cf-tunnel]. The site itself is
hosting-agnostic — it is just static files — so feel free to publish
elsewhere if you prefer.

[cf-tunnel]: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/

### One-time setup

1. **Install `cloudflared`.**

   ```bash
   brew install cloudflared        # macOS
   # or download from https://github.com/cloudflare/cloudflared/releases
   ```

2. **Authenticate against your Cloudflare account.**

   ```bash
   cloudflared tunnel login
   ```

   A browser opens; pick the zone (`deepesh-engg.in`).

3. **Create a tunnel.**

   ```bash
   cloudflared tunnel create v1-portfolio
   ```

   This prints a tunnel ID. Note it.

4. **Configure routing.** Create `~/.cloudflared/config.yml`:

   ```yaml
   tunnel: v1-portfolio
   credentials-file: /Users/<you>/.cloudflared/<tunnel-id>.json

   ingress:
     - hostname: v1.deepesh-engg.in
       service: http://localhost:4173
     - service: http_status:404
   ```

5. **Bind the DNS record.**

   ```bash
   cloudflared tunnel route dns v1-portfolio v1.deepesh-engg.in
   ```

   Cloudflare will create the CNAME automatically.

### Day-to-day

Two terminals:

```bash
# Terminal 1 — local server
./serve.sh

# Terminal 2 — tunnel
cloudflared tunnel run v1-portfolio
```

Hit `https://v1.deepesh-engg.in`. TLS terminates at the Cloudflare edge.

### Production hardening (optional)

- **Run as a service.** `sudo cloudflared service install` registers
  the tunnel as a launchd / systemd service so it survives reboots.
- **Run the local server under tmux** (`tmux new -s portfolio
  './serve.sh'`) so closing your laptop lid doesn't take down the site.
- **Cache aggressively at the edge.** Static markdown content is
  highly cacheable; Cloudflare's "Cache Everything" rule on
  `v1.deepesh-engg.in/*` is fine.

---

## 4. Where Things Live (cheat sheet)

| Question                                         | File                                 |
|--------------------------------------------------|--------------------------------------|
| Why is the stack like this?                      | `adr/0001-boring-markdown-stack.md`  |
| How does the perspective switcher actually work? | `adr/0002-perspective-toggle-data-mode.md` |
| Why no third-party Markdown library?             | `adr/0003-vanilla-markdown-parser.md`|
| How is the site served / tunnelled?              | `adr/0004-static-serve-cloudflare-tunnel.md` |
| Where is the routing table?                      | `assets/app.js`, `SLUG_TO_PATH`      |
| Where does the Brutalist style live?             | `assets/styles.css`                  |
| Where is the IPO grid?                           | `index.html`, `<section class="ipo">`|
| The raw narrative archive?                       | `docs/journal.md`                    |

---

## 5. Common Tasks

**Change the port.** Edit `serve.sh` (default 4173) or run
`PORT=8080 ./serve.sh`. Update the `cloudflared` config to match.

**Move the site to GitHub Pages.** Push the repo. Enable Pages on the
default branch. Done. No build command needed.

**Add a new perspective** (e.g. "Recruiter"). Add a button to the
`.modebar` in `index.html` (`data-mode="recruiter"`), add a colour rule
to `styles.css` (mirror the existing accent rules), add `'recruiter'`
to the `MODES` array in `app.js`. Tag paragraphs with
`data-mode="recruiter"`.

**Disable JavaScript and verify graceful degradation.** Every paragraph
should render at full strength (equivalent to "All" mode). The
perspective bar will be visible but inert. Code-block "COPY" buttons
will be absent. The site is still readable.

---

## 6. The Spirit Of This Repo

Boring is not a constraint. Boring is the moat.

If you're tempted to add a build step, a framework runtime, or a
client-side router library — read the ADRs first. The friction you're
feeling is the *intended* friction. The site is sized to survive a
two-year context-switch.

— *Built with the BMAD-METHOD (Boring Markdown). Engineered for Logic, not Layouts.*
