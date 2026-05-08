# ADR-0003 — The Hand-Rolled Markdown Parser

- **Status:** Accepted
- **Date:** 2026-05-08
- **Deciders:** Deepesh Rathod
- **Related:** ADR-0001 (Boring Markdown Stack), ADR-0002 (Perspective Toggle)

## Context

ADR-0001 commits us to a no-build, no-dependency stack. The portfolio
is authored in Markdown (`docs/*.md`). The browser does not natively
render Markdown, so something has to convert it to HTML at runtime.

Three options:

1. **Bundle a library** (e.g. `marked`, `markdown-it`, `micromark`).
   Smallest is ~30 KB minified. Rejected: defeats the dependency-free
   contract, and we use only ~6 Markdown features.
2. **Server-side render to HTML at deploy time** with a small Node
   script. Rejected: introduces a build step we declared dead.
3. **Hand-roll a tiny parser** that handles only the subset of
   Markdown the site uses. Chosen.

The Markdown subset we actually use across `docs/*.md`:

- ATX headings (`#` … `######`)
- Fenced code blocks (`` ```lang `` to `` ``` ``)
- Bullet lists (`-` or `*`), single visual level
- Blockquotes (`>` lines)
- Paragraphs separated by blank lines
- Inline: backticked code, `**bold**`, `*italic*`, `[text](href)`
- Raw block-level HTML (specifically: `<p data-mode="…">`, see ADR-0002)

## Decision

Implement a ~120-line parser inline in `assets/app.js` that handles
exactly the above. The parser is a single-pass line scanner with three
state flags (`inCode`, `inList`, `inQuote`) and one buffer (`para`).

Public surface:

```js
function mdToHtml(src: string): string;
```

The parser is intentionally **not** a generalised Markdown engine. If
content authors want a feature it doesn't support (tables, footnotes,
task lists), the path forward is one of:

1. Add the feature to `mdToHtml` deliberately, or
2. Use raw HTML in the source file (Markdown allows this).

## Consequences

**Positive**

- **Zero dependency surface.** No CDNs, no `node_modules`, no SRI
  hashes to maintain.
- **The parser fits on one screen.** We can read it, audit it, and fix
  it without going to a third-party issue tracker.
- **Tight coupling to authoring conventions.** When a doc breaks the
  parser, we know — because we wrote both. The error mode is
  visible-and-fixable, not silent-and-mysterious.

**Negative**

- **No syntax highlighting in code blocks.** The parser preserves
  `data-lang` for future use but does not pull in Prism / Shiki / etc.
  Brutalist visual contract makes this acceptable for v1.
- **No tables.** If a future doc needs one, we'll add it (or write the
  HTML inline).
- **Limited error messaging.** A malformed code fence is recovered
  silently (the closing-fence guard at end of file), rather than
  thrown. Acceptable for v1 since we author the input.
- **Inline HTML inside paragraph runs is not parsed.** A `<span>` mid-
  sentence works (raw HTML survives), but `**` bolding inside that
  `<span>` will still be applied — which is what we want anyway.

## Test Strategy

Manual. Every `docs/*.md` file is rendered through the parser when the
site is served locally; we eyeball the output. If the site grows, this
ADR should be revisited and a small unit-test harness added.

## Reversibility

This decision is highly reversible. If the parser becomes a liability,
we can drop in a third-party renderer with a one-line change inside
`loadArticle` — replacing `mdToHtml(md)` with `marked.parse(md)` or
similar. The rest of the site (router, perspective logic, code-block
enhancer) is parser-agnostic.
