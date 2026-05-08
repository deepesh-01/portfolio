# ADR-0004 — Static Serving via `python3 -m http.server` + Cloudflare Tunnel

- **Status:** Superseded by [ADR-0005](./0005-tunnel-to-pages-migration.md)
- **Date:** 2026-05-08
- **Superseded:** 2026-05-08 (same day — the tunnel approach worked but coupled the site to the laptop; see ADR-0005 for the migration to Cloudflare Pages)
- **Deciders:** Deepesh Rathod
- **Related:** ADR-0001 (Boring Markdown Stack), ADR-0005 (Pages migration)

## Context

The site is intended to live at `v1.deepesh-engg.in`. The author runs
the site from a workstation behind a Cloudflare Tunnel rather than from
a hosted edge platform (Vercel / Netlify / GitHub Pages).

Reasons for the tunnel route:

- The site is statically renderable from any directory, so any static
  HTTP server suffices.
- The author wants to keep the publishing surface entirely on
  hardware they control.
- Cloudflare Tunnel removes the need for inbound firewall holes, dynDNS,
  or a paid VPS.

Candidate local servers:

1. **`python3 -m http.server <port>`.** Ships with Python 3 on macOS
   and most Linux distros. No install. No config. Chosen.
2. **`npx serve`.** Requires Node + npm + a transient package fetch.
   Adds an SSDLC dependency for a one-line problem.
3. **`caddy file-server`.** Excellent, but introduces a binary the
   author doesn't otherwise need.

## Decision

Ship a `serve.sh` at the repo root that runs:

```bash
python3 -m http.server 4173
```

The Cloudflare Tunnel is configured (in the user's `cloudflared` config
or via the Zero Trust dashboard) to route `v1.deepesh-engg.in` to
`http://localhost:4173`.

All asset paths in `index.html` and `app.js` are **relative** (e.g.
`./assets/styles.css`, `docs/identity.md`) so the entire site is
location-independent and can be moved to any directory or any future
host without edits.

## Consequences

**Positive**

- **Zero-install local serve.** Any machine with Python 3 can serve.
- **No coupling to a hosting vendor.** If Cloudflare goes away tomorrow,
  the same files serve from any static host.
- **Hot reload not required** because there is no build step. Save the
  file, reload the tab.

**Negative**

- **`python3 -m http.server` is single-threaded.** Fine for a
  portfolio. Not fine if traffic suddenly arrives. Mitigation: put a
  real server (caddy / nginx) in front, *or* let the Cloudflare Tunnel
  cache aggressively (it can; the content rarely changes).
- **No HTTPS locally.** The Cloudflare Tunnel terminates TLS at the
  edge, so this is fine in production. For local development, the
  developer-tools warning is the cost.
- **No process supervisor.** If the local Python process dies, the
  tunnel returns 502. Mitigation: run `serve.sh` under `tmux`, `screen`,
  or a launchd / systemd service. Out of scope for v1.

## Operational Runbook

See `JOURNEY.md` at the repo root for the two-minute deploy guide,
including the `cloudflared` config snippet and the DNS record needed
in Cloudflare DNS.

## Reversibility

Trivially reversible. Drop the repo into Cloudflare Pages, Netlify, or
GitHub Pages by pointing it at the root and letting it serve static
files. No environment, no build command, no output directory needs to
change.
