# DEPLOYMENT.md — Operating the Portfolio in Production

> The day-to-day runbook for `v1.deepesh-engg.in`. If you want to know
> *why* it's set up this way, read
> [`adr/0005-tunnel-to-pages-migration.md`](./adr/0005-tunnel-to-pages-migration.md).
> This file tells you *how* to operate it.

---

## TL;DR

```bash
# Make a change → push → site updates in ~30 seconds
git add -p
git commit -m "what you changed"
git push
```

That's it. Cloudflare Pages picks up the push, deploys, and serves
globally. No build step. No server to restart. No tunnel to babysit.

---

## 1. Architecture (one paragraph + one diagram)

The portfolio is a static site (one `index.html`, one CSS, one JS,
plain Markdown content) hosted on **Cloudflare Pages free tier**. DNS
is split across two Cloudflare accounts for historical reasons; this
is intentional and stable.

```
visitor's browser
        │
        ▼
v1.deepesh-engg.in
        │  resolved by Cloudflare nameservers (holly + rene)
        │  authoritative for `deepesh-engg.in` zone
        ▼
Account A — Deepesh@zoca.ai's Account
   DNS record:  v1.deepesh-engg.in  CNAME → portfolio-cqf.pages.dev (proxied)
        │
        ▼  Cloudflare edge sees Pages target, routes the request to:
        │
Account B — deepeshd03938@gmail.com's Account
   Pages project: portfolio
        │  pulls latest commit from main branch of:
        ▼
github.com/deepesh-01/portfolio
   (every push triggers a new Pages deploy)
```

Other apps on the same domain (`welog.deepesh-engg.in`,
`martechroadmap.deepesh-engg.in`, etc.) continue to route through
their respective Cloudflare Tunnels in Account A — they are
unaffected by the portfolio's setup.

---

## 2. Deploying a change

### The normal case (95% of the time)

```bash
git add -p              # stage the change
git commit -m "..."     # write a meaningful message
git push                # triggers Pages auto-deploy
```

You'll see the deploy progress in:
**Cloudflare dashboard (Account B) → Workers & Pages → portfolio → Deployments**

A typical deploy takes 20 — 40 seconds end-to-end:

| Step | Duration |
|---|---|
| Initialising build environment | ~3s |
| Cloning git repository | ~1s |
| Building application (no build step → just file upload) | 5 — 15s |
| Deploying to Cloudflare's global network | 5 — 15s |
| **Total** | **20 — 40s** |

Once green, the change is live globally on `https://v1.deepesh-engg.in/`.

### Cache-bust convention (when you change CSS or JS)

Cloudflare's edge caches `assets/styles.css` and `assets/app.js` with
`max-age: 14400` (4 hours). If you change either file, a returning
visitor will see the **old** asset until the cache expires — even if
they hard-refresh (hard-refresh only busts the browser cache, not
CF's edge).

To force-fresh, **bump the version query string** in `index.html`:

```html
<!-- Before -->
<link rel="stylesheet" href="./assets/styles.css?v=3" />
<script src="./assets/app.js?v=3"></script>

<!-- After (bump the integer) -->
<link rel="stylesheet" href="./assets/styles.css?v=4" />
<script src="./assets/app.js?v=4"></script>
```

`index.html` itself is `cf-cache-status: DYNAMIC` (uncached), so the
new versioned URLs are picked up on the very next request and CF
treats them as different resources from the cached `?v=3` versions.

**Rule of thumb:**

- Changed only `docs/*.md` content? → No bump needed (markdown is fetched fresh).
- Changed `index.html`? → No bump needed (uncached at edge).
- Changed `assets/styles.css` or `assets/app.js`? → **Bump the version**.

### Branch previews

Pages builds **every branch** by default. Push to a feature branch and
you get a preview URL like `https://<branch>.portfolio-cqf.pages.dev/`
within 30 seconds — useful for sharing a draft before merging to
`main`.

---

## 3. Verification

After every non-trivial deploy, confirm the live site is correct.

```bash
# Returns HTTP 200 + the actual portfolio HTML
curl -sSI -H "User-Agent: Mozilla/5.0" https://v1.deepesh-engg.in/ | head -5

# Quick content check — should print BMAD-METHOD / IPO Framework / etc.
curl -s -H "User-Agent: Mozilla/5.0" https://v1.deepesh-engg.in/ \
  | grep -oE "(BMAD-METHOD|IPO Framework|Founding Engineer)" | sort -u

# Versioned assets (bump these in index.html when you change them)
curl -s -o /dev/null -w "css: %{http_code}\n" https://v1.deepesh-engg.in/assets/styles.css?v=3
curl -s -o /dev/null -w "js : %{http_code}\n" https://v1.deepesh-engg.in/assets/app.js?v=3
curl -s -o /dev/null -w "pdf: %{http_code}\n" https://v1.deepesh-engg.in/Deepesh_Rathod_Resume.pdf
```

> **Don't trust** Cloudflare's default Python `User-Agent` block.
> Cloudflare returns 403 to bare `python-urllib` requests as
> anti-scraper hygiene. Always pass a real-browser `User-Agent` when
> testing from a script.

---

## 4. Rollback procedure

Pages keeps every deployment forever (free tier limit is generous).
If a push breaks production:

1. Cloudflare dashboard (Account B) → **Workers & Pages → portfolio → Deployments**.
2. Find the last known-good deployment in the history list.
3. Click the **`⋯` menu → Rollback to this deployment**.

This is instant — within seconds the live URL serves the older
deployment. No DNS change. No git revert needed.

After rolling back, fix the issue locally, push again. The new push
becomes the active deployment automatically.

---

## 5. Local development

You don't need Pages locally. Run a static server:

```bash
./serve.sh                  # binds 127.0.0.1:4173
# → http://localhost:4173/
```

`serve.sh` is just a wrapper around `python3 -m http.server` (no
dependencies). Edit a file, save, refresh the browser. There is no
hot-reload daemon and there isn't one needed — this is the contract.

---

## 6. The cross-account setup (when you'll need to know about it)

Most of the time you won't. The setup is stable. But if you ever need
to:

### Edit DNS for `v1.deepesh-engg.in` or any other subdomain

The zone lives in **Account A (`Deepesh@zoca.ai`)**.

- **If you have dashboard access:** sign in, edit the record under
  `deepesh-engg.in → DNS → Records`.
- **If you don't (e.g., the SSO is acting up):** the `cloudflared`
  tunnel auth on this laptop has DNS-edit permissions for the zone
  via an API token embedded in `~/.cloudflared/cert.pem`. The exact
  recipe is documented in
  [`adr/0005-tunnel-to-pages-migration.md`](./adr/0005-tunnel-to-pages-migration.md#how-the-dns-edit-happened-the-certpem-trick).
  Use sparingly; rotate the cert (`cloudflared tunnel login`) if the
  token has been exposed.

### Move the Pages project to Account A (consolidate)

Optional cleanup. Re-create the project in Account A connected to the
same GitHub repo, transfer the custom domain. Detailed steps are
non-trivial; only do this if cross-account starts causing real
friction. The current setup is **fine** as long as the CNAME in
Account A points at the Pages project in Account B.

### Migrate to a different host entirely

The site is purely static (zero dependencies, zero build), so any
static host works (Netlify, Vercel, GitHub Pages, S3+CloudFront,
self-hosted).

1. Set up the new host with the GitHub repo.
2. Confirm the new host serves the site at its own URL.
3. Edit the `v1.deepesh-engg.in` CNAME in Account A to point at the
   new host's target.
4. CF edge will route the next request to the new host within seconds.

No code changes, no rebuild, no downtime.

---

## 7. Common gotchas

| Gotcha | Fix |
|---|---|
| Cloudflare's "Workers & Pages → Create" lands you on the **Workers** flow asking for `wrangler deploy`. | Back out and select the **Pages** tab explicitly. URL should contain `/pages/new/`. |
| Pages "Custom domain" flow asks you to **update GoDaddy nameservers**. | Wrong path. Click **`Set up a custom domain → My DNS provider → Begin CNAME setup`** instead. The correct path never asks about registrars. |
| You changed CSS but the change isn't visible after a hard-refresh. | CF edge cache. Bump the `?v=N` in `index.html`. |
| `curl https://v1.deepesh-engg.in/` returns 403. | Cloudflare blocks the default Python User-Agent. Add `-H "User-Agent: Mozilla/5.0"`. |
| Site returns 200 but with old content after a `git push`. | Pages deploy probably failed. Check **Deployments** in the dashboard for build-log errors. |
| `cloudflared tunnel route dns` succeeds but the dashboard shows the zone as "Pending Nameserver Update". | The zone is in another CF account on the same machine. See ADR-0005. |

---

## 8. Other things on this domain (don't break these)

`deepesh-engg.in` carries a small fleet of services besides the
portfolio. Their DNS records all live in Account A and route through
Cloudflare Tunnels:

| Subdomain | Tunnel | Purpose |
|---|---|---|
| `welog.deepesh-engg.in` | `welog` (`72cfc4f4-...`) | Real-time journaling app |
| `takejob.deepesh-engg.in` | `welog` (same tunnel, multi-host) | Job-intake app |
| `martechroadmap.deepesh-engg.in` | `martech-roadmap` (`b9e3e610-...`) | MarTech roadmap project |
| `deepesh-engg.in` (apex) | `pr-reviewer` (`41fc2ccf-...`) | (Currently routed but tunnel creds are missing locally — verify before relying.) |
| `v1.deepesh-engg.in` | **Cloudflare Pages** (this site) | Portfolio |

**Do not delete or repoint any of the above when working on the
portfolio.** Treat the portfolio's `v1` CNAME as the only DNS record
in this zone you should ever touch from this repo.

---

*Built with the BMAD-METHOD (Boring Markdown). Engineered for Logic, not Layouts.*
