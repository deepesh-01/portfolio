# ADR-0005 — Migrate hosting from Cloudflare Tunnel to Cloudflare Pages

- **Status:** Accepted
- **Date:** 2026-05-08
- **Deciders:** Deepesh Rathod
- **Supersedes:** [ADR-0004 — Static Serve via `python3 -m http.server` + Cloudflare Tunnel](./0004-static-serve-cloudflare-tunnel.md)

## Context

ADR-0004 set up the portfolio behind a **Cloudflare Tunnel** that routed
`v1.deepesh-engg.in` to a local `python3 -m http.server` running on the
author's MacBook. The site was live but coupled to the laptop:

- If the laptop went to sleep, lost network, or was closed for travel, the
  site went down.
- If the laptop's `cloudflared` process crashed, the site went down.
- The "deploy" model was implicit — whatever was on the laptop's filesystem
  was what the world saw.

The author was about to start travelling and wanted laptop-independent
hosting. The site is purely static (one HTML, one CSS, one JS, plain
Markdown), so any static-asset CDN is a candidate.

### The cross-account complication

While planning the migration, we discovered the author has **two
Cloudflare accounts**:

| | Account ID | Email | What it owns |
|---|---|---|---|
| **Account A (work)** | `65fea1...c5d86a6` | `Deepesh@zoca.ai` | The active zone for `deepesh-engg.in`, all running tunnels (`welog`, `martechroadmap`, the v1-portfolio tunnel from ADR-0004) |
| **Account B (personal)** | `180fda6...4448b` | `deepeshd03938@gmail.com` | An empty re-add of `deepesh-engg.in` (in pending state — the public NS still pointed at Account A), where Cloudflare Pages was newly available |

Public DNS resolution for `deepesh-engg.in` was — and remains —
authoritative on Account A's nameservers (`holly` + `rene`). The Pages
project naturally landed in Account B because that was the active
dashboard at the time.

This created a fork in the road:

1. **Migrate the zone fully to Account B** by changing nameservers at the
   registrar (GoDaddy), so Pages and DNS share an account. Costs:
   24 — 48h DNS propagation worst case; risk of breaking the other
   tunnels (`welog`, etc.) whose DNS records would need to be recreated
   in Account B; Google Workspace login on `Deepesh@zoca.ai` was not
   easily accessible at the time.
2. **Move the Pages project to Account A**. Costs: re-creating the
   project; needing to log into Account A's dashboard.
3. **Cross-account setup** — keep the zone in Account A and Pages in
   Account B, with a CNAME in Account A's DNS pointing at the Pages
   project's `*.pages.dev` URL. Pages validates the custom domain by
   resolving the CNAME, regardless of which CF account the DNS lives in.

Option 1 was rejected because of the disruption blast radius (other
tunnels). Option 2 was rejected because Account A's dashboard login was
a blocker at decision time. Option 3 was chosen: it required no
nameserver change, no disruption to other apps, and could be executed
in minutes.

## Decision

Adopt **Cloudflare Pages with cross-account DNS** as the hosting model:

- Hosting: **Cloudflare Pages free tier**, project `portfolio` in
  Account B, connected to GitHub repo `deepesh-01/portfolio` for
  auto-deploy on `git push`.
- DNS: the existing `v1.deepesh-engg.in` CNAME record in **Account A**
  was modified (proxied, target → `portfolio-cqf.pages.dev`). The
  record was created originally by `cloudflared tunnel route dns` in
  ADR-0004 — the migration just edited the target.
- Verification: in Account B's Pages project, `v1.deepesh-engg.in` was
  added as a custom domain via the **"My DNS provider → Begin CNAME
  setup"** path. Pages validated the CNAME existed and matched the
  expected target, then marked the domain Active.

### How the DNS edit happened (the cert.pem trick)

Account A's dashboard was inaccessible during the migration window. We
edited the `v1` CNAME by extracting the API token from
`~/.cloudflared/cert.pem` (the credential file `cloudflared tunnel login`
created when the tunnel was first set up) and calling Cloudflare's REST
API directly:

```
PATCH /client/v4/zones/{zone_id}/dns_records/{record_id}
{ "type": "CNAME", "name": "v1", "content": "portfolio-cqf.pages.dev",
  "proxied": true, "ttl": 1 }
```

The cert.pem contained `accountID`, `zoneID`, and a scoped `apiToken`
with permissions to manage DNS records on that one zone. This is
standard for cloudflared — the token's scope is intentionally narrow.

## Consequences

### Positive

- **Laptop-independent.** Site stays up regardless of where the laptop
  is, whether it's online, or whether `cloudflared` is running.
- **Global CDN.** Requests are served from the CF edge nearest the
  visitor (typically a sub-50ms first-byte time anywhere in the world).
- **Free tier covers everything.** Unlimited sites, unlimited bandwidth,
  unlimited requests, 500 builds/month — well above what this portfolio
  needs.
- **Auto-deploy is `git push`.** Pages watches the GitHub repo's `main`
  branch; pushing triggers a deploy in ~30 seconds.
- **No disruption to other tunnels.** `welog`, `martechroadmap`,
  `takejob`, and the apex `deepesh-engg.in` continue to route through
  their respective tunnels in Account A.

### Negative

- **Cross-account topology is non-obvious.** A future engineer (including
  future-Deepesh) will see DNS in Account A, Pages in Account B, and
  wonder why. This ADR exists primarily to answer that.
- **The cert.pem-based DNS edit is a power tool.** It worked because
  `cloudflared tunnel login` had already established the auth. If the
  cert is rotated or revoked, that path stops working — future DNS
  edits will require either dashboard access to Account A or a
  separately-issued API token. **Recommended:** rotate the cert
  periodically (`cloudflared tunnel login` overwrites it).
- **No HTTP/3 advantage over the old tunnel** — both are CF anycast IPs
  on the public side. The performance gain is from removing the laptop
  hop, not from changing protocols.
- **First-deploy ergonomics on Cloudflare's UI are noisy.** The
  "Workers & Pages" unified UI has a habit of landing users in the
  Workers flow (which wants `wrangler deploy`), in the "Add a Site"
  flow (which wants nameserver changes at the registrar), or in
  "Begin DNS transfer" (which prompts for nameservers as well). The
  correct path on this account topology is **Pages → Custom domains →
  My DNS provider → Begin CNAME setup**, and that is the single source
  of truth for future re-attaches.

### Reversibility

Highly reversible. If Cloudflare Pages becomes a problem:

- **Back to the tunnel:** restart `cloudflared tunnel run v1-portfolio`
  on the laptop, then PATCH the same CNAME back to the tunnel target
  (`98c34433-...cfargotunnel.com`). Site is back on the tunnel in under
  a minute.
- **Different host (Vercel / Netlify / GitHub Pages):** drop the repo
  in, change the CNAME target to whatever the new host gives you. No
  code changes needed since the site is purely static.
- **Self-hosted edge:** any HTTPS-terminating origin works. Update the
  CNAME accordingly.

The portfolio's "boring" architecture (zero build, zero dependencies,
plain Markdown — see [ADR-0001](./0001-boring-markdown-stack.md))
specifically guarantees this hosting-agnosticism.

## Operational Runbook

The detailed day-to-day runbook (deploy, cache-bust, rollback, verify)
lives in [`DEPLOYMENT.md`](../DEPLOYMENT.md) at the repo root. This
ADR records *why* the hosting works the way it does; `DEPLOYMENT.md`
records *how* to operate it.
