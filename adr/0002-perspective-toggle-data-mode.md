# ADR-0002 — The Perspective Toggle (`data-mode` Attributes)

- **Status:** Accepted
- **Date:** 2026-05-08
- **Deciders:** Deepesh Rathod
- **Related:** ADR-0001 (Boring Markdown Stack)

## Context

The portfolio's headline interaction is a **perspective switcher**:
"Founder", "Engineer", "Human", and "All". Switching modes must change
the *emphasis* of paragraphs across the site without re-fetching content
or re-rendering the page.

Constraints (from ADR-0001):

- No client-side framework.
- No build-time content transformation.
- Parsing logic must remain trivial.
- The same Markdown source must drive all four perspectives.

Three implementation candidates were considered:

1. **Per-perspective files.** Maintain three or four parallel docs.
   Rejected: triples the authoring surface and guarantees drift.
2. **Custom Markdown syntax** (`:::founder … :::`). Rejected: requires
   parser extensions, blocks copy-paste of files into other Markdown
   tools, and a syntax error in one file silently degrades the page.
3. **Inline HTML annotations** (`<p data-mode="founder engineer">…</p>`).
   Markdown natively passes raw HTML through. This was the choice.

## Decision

A paragraph (or list, or any block element) opts into the perspective
system by carrying a `data-mode` attribute whose value is a
space-separated list of perspectives the paragraph belongs to.

```html
<p data-mode="founder">…business framing…</p>
<p data-mode="engineer human">…technical framing with personal context…</p>
```

A single body-level attribute, `data-active-mode`, encodes the
currently-selected perspective. CSS does the heavy lifting:

```css
body[data-active-mode="founder"] [data-mode]:not([data-mode~="founder"]) {
  opacity: 0.22;
}
body[data-active-mode="founder"] [data-mode~="founder"] {
  border-left-color: var(--accent);
}
```

JavaScript's only job is to:

1. Read the user's last selection from `localStorage` on boot.
2. Update `body[data-active-mode]` when a pill is clicked.
3. Toggle the `.is-active` class on the right pill for the visual cue.

Mode `all` is a sentinel that matches every CSS rule's negative case
trivially — it leaves all `[data-mode]` paragraphs at full opacity.

## Consequences

**Positive**

- **Single source of truth.** Every doc renders for every audience.
  No file drift, no cross-perspective copy-paste.
- **CSS-driven.** The state machine has exactly one writer (the
  `setMode` function in `app.js`) and any number of readers (every CSS
  rule that scopes on `body[data-active-mode]`).
- **Persistent.** `localStorage` survives page reloads and direct-link
  navigation, so the "I'm a recruiter, show me the founder lens"
  intent survives bookmarks.
- **Graceful degradation.** With JS disabled, every paragraph renders
  at full strength — equivalent to "All" mode by accident, which is
  exactly what we want.

**Negative**

- **Authoring discipline.** Perspective tagging is a manual act on a
  per-paragraph basis. We mitigate this by tagging only *non-default*
  paragraphs — paragraphs that are universally relevant carry no
  `data-mode` and are visible in every perspective.
- **Three-axis tagging is not modelled.** A paragraph can be in {founder
  ∪ engineer ∪ human}, but not, e.g., "founder *only when* the user is
  also senior". The system is intentionally one-dimensional.
- **No animation between modes** beyond a 120ms opacity transition.
  This is by design (brutalist contract) but means there is no
  scroll-into-view-as-you-switch behaviour.

## Open Questions

- Should we expose deep-link URLs that pin a perspective
  (`#blueprints?mode=engineer`)? Out of scope for v1; revisit if the
  site is shared with hiring panels who want to land in a specific lens.
- Should a perspective auto-scroll to its first matching paragraph on
  switch? Probably yes for long docs. Tracked, not built.
