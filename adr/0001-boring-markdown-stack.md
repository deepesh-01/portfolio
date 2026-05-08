# ADR-0001 — The "Boring Markdown" Stack

- **Status:** Accepted
- **Date:** 2026-05-08
- **Deciders:** Deepesh Rathod
- **Supersedes:** —
- **Superseded by:** —

## Context

This portfolio needs to ship the high-density narrative from the seven
context files (identity, journey, journal, blueprints, perspectives,
case studies, manifesto) without:

- A JS framework runtime (React / Vue / Svelte).
- A build step (Vite / Webpack / Next).
- A CSS preprocessor (Sass / PostCSS pipeline).
- A static-site generator (Astro / Eleventy / Hugo / Jekyll).

The site will be served behind a Cloudflare Tunnel pointed at a local
HTTP server. The author also wants it to remain easy to pick up and
deploy in two minutes, two years from now.

The candidate stacks were:

1. **Astro / Eleventy.** Familiar, fast, but introduces a build step and
   a dependency surface that decays.
2. **MDX + React Server Components.** Maximal flexibility, maximum
   maintenance overhead. Rejected immediately.
3. **Plain HTML + plain CSS + plain JS + plain Markdown** ("Boring
   Markdown"). Zero dependencies. One round-trip. One paint.

## Decision

Adopt the third option: a single `index.html`, a single `styles.css`,
a single `app.js`, and a folder of `.md` files in `docs/`.

The author calls this "BMAD" — Boring Markdown — and the entire site's
contract is that you can read every line of code and know what it does
in a single sitting.

A small markdown parser lives in `app.js` (see ADR-0003) so that the
content authoring experience stays in plain `.md` while the runtime
stays dependency-free.

## Consequences

**Positive**

- **Cold-cache page weight is trivial.** One HTML, one CSS, one JS, one
  markdown file per article.
- **No supply-chain risk.** No `node_modules`. No transitive CVEs. No
  Dependabot churn.
- **Two-minute deploy.** Static files behind any HTTP server. Cloudflare
  Tunnel points at a port; that's the deploy.
- **Two-year resumability.** Any engineer who can read HTML can pick
  this up without onboarding.

**Negative**

- **No framework conveniences.** No JSX, no component reuse, no client
  router library. We hand-roll a hash router and a parser (small, so
  this is acceptable).
- **Hand-written perspective markup.** Paragraphs that should be tagged
  with a perspective need a `<p data-mode="…">` wrapper inside the
  markdown source. We considered a custom syntax (e.g. `:::founder`)
  but the inline-HTML approach requires zero additions to the parser.
- **No code-fence syntax highlighting.** We render plain monospace
  inside `<pre><code>`. The brutalist visual contract wants this; if it
  changes, ADR-0003 needs an amendment.

## Alternatives Considered (and rejected)

- **Eleventy:** chosen against because the build step is a maintenance
  liability the project does not need.
- **MDX:** rejected; the React runtime is a runtime tax we cannot pay
  on a static portfolio.
- **Notion / Substack:** rejected; the site needs to live behind our
  own domain via a Cloudflare Tunnel and remain version-controllable.

## Notes

This ADR records the *meta* decision: that we're using the boring stack
at all. The specific implementations of perspectives, parsing, and
deploy are recorded in ADR-0002, ADR-0003, and ADR-0004 respectively.
