# Architecture Decision Records

> Every structural decision in this repo is captured here in the
> standard ADR format: **Context · Decision · Consequences**.
> If you want to know *why* the site is shaped the way it is, this
> directory is the source of truth.

## Index

| #     | Title                                          | Status   |
|-------|------------------------------------------------|----------|
| 0001  | [The "Boring Markdown" Stack](./0001-boring-markdown-stack.md)            | Accepted |
| 0002  | [The Perspective Toggle (`data-mode`)](./0002-perspective-toggle-data-mode.md) | Accepted |
| 0003  | [The Hand-Rolled Markdown Parser](./0003-vanilla-markdown-parser.md)      | Accepted |
| 0004  | [Static Serve + Cloudflare Tunnel](./0004-static-serve-cloudflare-tunnel.md)  | Accepted |

## Format

Each ADR follows the standard:

```
# ADR-NNNN — Title

- Status: (Proposed | Accepted | Deprecated | Superseded)
- Date:   YYYY-MM-DD
- Deciders, Supersedes, Superseded by

## Context
What forces are at play. What we know. What we don't.

## Decision
The decision in one paragraph. Imperative voice.

## Consequences
Positive, negative, and what becomes easier or harder.
```

## How to add a new ADR

1. Pick the next sequential number.
2. Copy any existing ADR as the template.
3. Update the index above. Keep the table sorted ascending.
4. Commit the ADR in the same change as the code that implements it,
   so the *why* lands in git history with the *what*.
