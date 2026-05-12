/* =========================================================================
 * app.js — The vanilla-JS engine for the BMAD (Boring Markdown) portfolio.
 *
 * No frameworks. No bundler. No transpilation. No npm. The entire runtime
 * for this site is one stylesheet + this file. That is the contract.
 *
 * The Logic-First view of this file (IPO):
 *
 *   INPUT          a Markdown file (fetched over HTTP) + a perspective mode
 *                  (founder | engineer | human | all) selected by the user.
 *
 *   PROCESS        parse the Markdown into HTML, splice it into a single
 *                  <article> element, then enhance any code blocks and apply
 *                  the active perspective's data-mode dimming via CSS.
 *
 *   DATA CONTEXT   perspective state lives in two places: a body-level
 *                  data-attribute (read by CSS) and localStorage (read on
 *                  next page load). Hash routing lives in window.location
 *                  so it survives bookmarks and Cloudflare caching.
 *
 *   OUTPUT         a fully-rendered article view OR the home view, with
 *                  the correct perspective active and code blocks decorated
 *                  with a "SYSTEM ARCHITECTURE" label and "COPY" button.
 *
 * Sections in this file (in order):
 *   §1  Constants      —  the routing table (slug → markdown path).
 *   §2  Markdown       —  a tiny parser that handles only what we ship.
 *   §3  Enhancers      —  code-block decoration + intra-doc anchor rewrite.
 *   §4  Router         —  hash → view transition (home vs article).
 *   §5  Perspective    —  founder / engineer / human / all state machine.
 *   §6  Boot           —  one DOMContentLoaded handler. No frameworks.
 *
 * Every public function is documented in IPO terms. If you only have time
 * to read the comments, you can still operate this site.
 * ========================================================================= */


/* ───── §1. Constants ─────────────────────────────────────────────────── */

/**
 * SLUG_TO_PATH — the entire routing table for the site.
 *
 * Each entry maps a URL hash slug (#identity, #journal, etc.) to the
 * Markdown file that backs it. New article? Add one row here. There is no
 * generator, no manifest, no build step that scans docs/ — and that is
 * deliberate. The list IS the source of truth.
 */
const SLUG_TO_PATH = Object.freeze({
  'identity':           'docs/identity.md',
  'manifesto':          'docs/manifesto.md',
  'journey':            'docs/journey.md',
  'blueprints':         'docs/blueprints.md',
  'product-growth':     'docs/product-growth.md',
  'perspectives':       'docs/perspectives.md',
  'journal':            'docs/journal.md',
  'christmas-sql':      'docs/case-studies/christmas-sql.md',
  '175-lead-bug':       'docs/case-studies/175-lead-bug.md',
  'ghost-sprint':       'docs/case-studies/ghost-sprint.md',
  'media-migration':    'docs/case-studies/media-migration.md',
  'flask-to-node':      'docs/case-studies/flask-to-node.md',
  'sql-optimization':   'docs/case-studies/sql-optimization.md',
  'zoca-unified-migration': 'docs/case-studies/zoca-unified-migration.md',
  'lambda-swarm':       'docs/case-studies/lambda-swarm.md',
  'psql-audit-function': 'docs/case-studies/psql-audit-function.md',
  'master-worker':      'docs/case-studies/master-worker.md',
  'win-agent-testing':  'docs/case-studies/win-agent-testing.md',
  'infra-flip-rca':     'docs/case-studies/infra-flip-rca.md',
  'scheduling-payments-v2': 'docs/case-studies/scheduling-payments-v2.md',

  // ADRs — keyed by full filename basename so rewriteInternalLinks() picks
  // them up transparently. Cloudflare Pages serves raw .md as text/markdown,
  // which the browser dumps with zero styling; routing every .md click
  // through the in-page parser is the only way to keep ADR navigation styled.
  '0001-boring-markdown-stack':              'adr/0001-boring-markdown-stack.md',
  '0002-perspective-toggle-data-mode':       'adr/0002-perspective-toggle-data-mode.md',
  '0003-vanilla-markdown-parser':            'adr/0003-vanilla-markdown-parser.md',
  '0004-static-serve-cloudflare-tunnel':     'adr/0004-static-serve-cloudflare-tunnel.md',
  '0005-tunnel-to-pages-migration':          'adr/0005-tunnel-to-pages-migration.md',
  '0006-sql-defined-business-triggers':      'adr/0006-sql-defined-business-triggers.md',
  '0007-fallback-migration-pattern':         'adr/0007-fallback-migration-pattern.md',
  '0008-sql-defined-logic-pattern':          'adr/0008-sql-defined-logic-pattern.md',
  '0009-lambda-swarm-step-functions':        'adr/0009-lambda-swarm-step-functions.md',
  '0010-cynical-architect-recovery-first':   'adr/0010-cynical-architect-recovery-first.md',
  '0011-psql-audit-by-snapshot':             'adr/0011-psql-audit-by-snapshot.md',
  '0012-master-worker-redis-pattern':        'adr/0012-master-worker-redis-pattern.md',
  '0013-llm-guardrails-ai-safety-layer':     'adr/0013-llm-guardrails-ai-safety-layer.md',
  '0014-drizzle-orm-iac-compliance':         'adr/0014-drizzle-orm-iac-compliance.md',
  '0015-deterministic-llm-testing':          'adr/0015-deterministic-llm-testing.md',
  '0016-system-wisdom-vs-framework-knowledge': 'adr/0016-system-wisdom-vs-framework-knowledge.md',
  '0017-ai-as-force-multiplier-vs-liability': 'adr/0017-ai-as-force-multiplier-vs-liability.md',
  '0018-persona-gated-hybrid-dashboard':     'adr/0018-persona-gated-hybrid-dashboard.md',
});

/** Modes the perspective switcher can be in. Order matters for the UI. */
const MODES = Object.freeze(['all', 'founder', 'engineer', 'human']);

/** localStorage key for the user's last-selected perspective. */
const MODE_STORAGE_KEY = 'bmad.mode';

/** Article view modes (tile grid vs continuous scroll). Order matters for UI. */
const VIEW_MODES = Object.freeze(['tiles', 'long']);

/** localStorage key for the user's last-selected article view mode. */
const VIEW_STORAGE_KEY = 'bmad.view';


/* ───── §2. Markdown parser ───────────────────────────────────────────── */

/**
 * escapeHtml — Defensive escape for content that will land inside a
 * <code> block. We never trust file contents to be HTML-safe, even if we
 * authored them ourselves. Boring beats clever.
 *
 * INPUT   raw string from a Markdown file.
 * OUTPUT  string with &, <, >, ", ' replaced by their entities.
 */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * mdInline — apply inline Markdown rules to a single line/run of text.
 *
 * Order matters here. Code spans first so we don't accidentally bold the
 * contents of a `**`-using code span. Then bold, italic, then links.
 *
 * Note: code spans are escaped here. Bold/italic/link substitutions assume
 * their captured text is already safe — which it is, because by the time
 * we run them, any HTML in the captured groups was already user-authored
 * (the source markdown), and our markdown sources are trusted.
 */
function mdInline(s) {
  return s
    .replace(/`([^`]+)`/g, (_, code) => '<code>' + escapeHtml(code) + '</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

/**
 * mdToHtml — convert a Markdown document to an HTML string.
 *
 * This parser is intentionally small. It supports only the constructs we
 * actually use in docs/. If we add a new construct, it gets added here —
 * not via a dependency. This keeps the parser and the content honest.
 *
 * Supported:
 *   - ATX headings (# .. ######)
 *   - Fenced code blocks (```lang … ```)
 *   - Bullet lists (- or *), one level (nested bullets are flattened)
 *   - Blockquotes (>)
 *   - Paragraphs separated by blank lines
 *   - Inline: code, **bold**, *italic*, [text](href)
 *   - Raw block HTML (lines starting with <)
 *
 * Unsupported on purpose: tables, footnotes, autolinks, HTML inside
 * inline runs (we authored the source — we don't need it).
 *
 * INPUT   string of Markdown text.
 * OUTPUT  string of HTML, ready to assign to innerHTML of a trusted host.
 */
function mdToHtml(src) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  let html = '';
  let inCode = false;
  let codeBuf = [];
  let codeLang = '';
  let inList = false;
  let inQuote = false;
  let para = [];

  // Flush any buffered paragraph lines as a <p>.
  const flushPara = () => {
    if (!para.length) return;
    html += '<p>' + mdInline(para.join(' ')) + '</p>\n';
    para = [];
  };
  const flushList = () => {
    if (inList) { html += '</ul>\n'; inList = false; }
  };
  const flushQuote = () => {
    if (inQuote) { html += '</blockquote>\n'; inQuote = false; }
  };
  const flushAll = () => { flushPara(); flushList(); flushQuote(); };

  for (const raw of lines) {
    const line = raw;

    // --- Fenced code block boundary --------------------------------------
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      if (inCode) {
        html += '<pre><code data-lang="' + escapeHtml(codeLang) + '">'
              + escapeHtml(codeBuf.join('\n'))
              + '</code></pre>\n';
        codeBuf = []; codeLang = ''; inCode = false;
      } else {
        flushAll();
        inCode = true; codeLang = fence[1] || '';
      }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }

    // --- Raw block-level HTML (e.g. <p data-mode="...">…) -----------------
    // Markdown allows raw HTML; we lean on it for perspective annotations.
    if (/^\s*<[a-zA-Z][^>]*>/.test(line)) {
      flushAll();
      html += line + '\n';
      continue;
    }

    // --- ATX heading ------------------------------------------------------
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      html += `<h${level}>${mdInline(heading[2])}</h${level}>\n`;
      continue;
    }

    // --- Bullet list item -------------------------------------------------
    // We accept arbitrary indentation (2, 4, …) and flatten to one level.
    // Nesting visual hierarchy is handled by typography, not by <ul><ul>.
    const li = line.match(/^\s*[-*]\s+(.+)$/);
    if (li) {
      flushPara(); flushQuote();
      if (!inList) { html += '<ul>\n'; inList = true; }
      html += '<li>' + mdInline(li[1]) + '</li>\n';
      continue;
    }

    // --- Blockquote -------------------------------------------------------
    const bq = line.match(/^>\s?(.*)$/);
    if (bq) {
      flushPara(); flushList();
      if (!inQuote) { html += '<blockquote>\n'; inQuote = true; }
      // Each blockquote line becomes a <p> inside the quote.
      const inner = bq[1].trim();
      if (inner) html += '<p>' + mdInline(inner) + '</p>\n';
      continue;
    }

    // --- Blank line: terminator for paragraph / list / quote --------------
    if (line.trim() === '') { flushAll(); continue; }

    // --- Default: append to current paragraph buffer ----------------------
    para.push(line.trim());
  }

  flushAll();
  // Tolerate an unclosed code fence so we never silently swallow content.
  if (inCode) {
    html += '<pre><code data-lang="' + escapeHtml(codeLang) + '">'
          + escapeHtml(codeBuf.join('\n')) + '</code></pre>\n';
  }
  return html;
}


/* ───── §3. Enhancers ─────────────────────────────────────────────────── */

/**
 * enhanceCodeBlocks — decorate every <pre><code> in `scope` with a
 * "SYSTEM ARCHITECTURE" header bar and a "COPY" button.
 *
 * INPUT   a DOM element to scan.
 * PROCESS for each unwrapped <pre>, build a .codeblock wrapper containing
 *         a header (label + copy button) and the original <pre>.
 * OUTPUT  the same DOM tree, with each <pre> now wrapped exactly once.
 *
 * Idempotency: we mark wrapped pres with data-enhanced="1" so re-running
 * this on the same DOM is a no-op. This matters because the router can
 * re-render the same article without a full page reload.
 */
function enhanceCodeBlocks(scope) {
  const pres = scope.querySelectorAll('pre > code');
  pres.forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (pre.dataset.enhanced === '1') return;
    pre.dataset.enhanced = '1';

    // Build the header (label + copy button) above the existing <pre>.
    const wrap = document.createElement('div');
    wrap.className = 'codeblock';

    const header = document.createElement('div');
    header.className = 'codeblock-header';

    const label = document.createElement('span');
    label.className = 'codeblock-label';
    // The label is fixed copy. If we ever want per-block labels (e.g.
    // "SQL TRIGGER" vs "SLOT ALGORITHM"), they'd come from the code's
    // data-lang attribute. Keeping it static for now — boring wins.
    label.textContent = 'SYSTEM ARCHITECTURE';

    const copy = document.createElement('button');
    copy.className = 'codeblock-copy';
    copy.type = 'button';
    copy.textContent = 'COPY';
    copy.addEventListener('click', () => {
      // navigator.clipboard requires a secure context (https or localhost).
      // We fall back to a no-op flash if it's missing — the user can still
      // select and copy by hand, so we don't want to throw in their face.
      const text = codeEl.textContent || '';
      const flash = (msg) => {
        copy.textContent = msg;
        copy.classList.add('is-copied');
        setTimeout(() => {
          copy.textContent = 'COPY';
          copy.classList.remove('is-copied');
        }, 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          () => flash('COPIED'),
          () => flash('ERR'),
        );
      } else {
        flash('—');
      }
    });

    header.appendChild(label);
    header.appendChild(copy);

    // Splice the wrapper into the document in place of <pre>.
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(header);
    wrap.appendChild(pre);
  });
}

/**
 * chapterize — group every H2 + the content that follows it (until the next
 * H2) into a <details class="chapter"> block. Each chapter becomes a clickable
 * card in tile view (the default) or a section header in long-form view; the
 * mode toggle lives in setView(). Pure DOM rearrangement; the CSS drives the
 * visual mode via body[data-view-mode].
 *
 * Idempotent: marks the scope with data-chapterized so re-renders no-op.
 *
 * INPUT   a DOM scope (typically the rendered <article>).
 * OUTPUT  same scope with H2 boundaries wrapped in <details class="chapter">.
 *         Content above the first H2 (if any) is left in place as a preamble.
 */
function chapterize(scope) {
  if (scope.dataset.chapterized === '1') return;
  scope.dataset.chapterized = '1';

  const h2s = Array.from(scope.querySelectorAll(':scope > h2'));
  if (h2s.length === 0) return;

  for (const h2 of h2s) {
    const details = document.createElement('details');
    details.className = 'chapter';

    const summary = document.createElement('summary');
    summary.className = 'chapter-head';
    summary.textContent = h2.textContent;
    details.appendChild(summary);

    // Move every sibling after this h2, up to (but not including) the next h2,
    // into the details block.
    let curr = h2.nextSibling;
    while (curr && !(curr.nodeType === 1 && curr.tagName === 'H2')) {
      const next = curr.nextSibling;
      details.appendChild(curr);
      curr = next;
    }

    // Replace the original h2 with the details block.
    h2.parentNode.replaceChild(details, h2);
  }
}

/**
 * rewriteInternalLinks — turn cross-doc links like <a href="#blueprints">
 * into proper SPA hash links. Already-hash links are passed through; the
 * function exists mostly so a future markdown author can write absolute
 * doc/blueprints.md links and have them still work.
 *
 * INPUT   a DOM scope.
 * OUTPUT  same scope, with anchors normalised.
 */
function rewriteInternalLinks(scope) {
  scope.querySelectorAll('a[href$=".md"]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const m = href.match(/(?:^|\/)([^\/]+)\.md$/);
    if (m && SLUG_TO_PATH[m[1]]) {
      a.setAttribute('href', '#' + m[1]);
    }
  });
}


/* ───── §4. Router ────────────────────────────────────────────────────── */

/**
 * loadArticle — fetch a Markdown file by slug, render it, and put it on
 * the page. Failure modes are explicit: bad slug, network error.
 *
 * INPUT   a slug (key of SLUG_TO_PATH).
 * PROCESS fetch → mdToHtml → enhance → mount.
 * OUTPUT  the #view element now contains the article. Window scrolls top.
 */
async function loadArticle(slug) {
  const path = SLUG_TO_PATH[slug];
  const view = document.getElementById('view');
  const home = document.getElementById('home');

  if (!path) {
    // Unknown slug → degrade to home rather than show a 404 dead-end.
    view.classList.add('hide');
    home.classList.remove('hide');
    document.body.classList.add('on-home');
    return;
  }

  // Show the article container, hide the home. The on-home class drives the
  // perspective-switcher visibility (hidden on home, visible on article views).
  home.classList.add('hide');
  view.classList.remove('hide');
  document.body.classList.remove('on-home');
  view.innerHTML = '<p class="loading">LOADING…</p>';

  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const md = await res.text();

    const article = document.createElement('article');
    article.className = 'article';
    article.innerHTML = mdToHtml(md);

    // Order matters: rewrite links BEFORE we hand the DOM to the user, so
    // they never see a flash of "/docs/foo.md" hover-targets.
    rewriteInternalLinks(article);
    enhanceCodeBlocks(article);
    chapterize(article);

    // The article body no longer carries its own BACK element — BACK lives
    // in the nav (#navBack) and is shown / hidden by setNavBackVisible() on
    // every route change. See §6 boot for the click handler.
    view.innerHTML = '';
    view.appendChild(article);

    // Re-apply the current view mode now that fresh .chapter elements exist
    // (setView force-opens or closes every chapter to match the mode).
    setView(document.body.getAttribute('data-view-mode') || 'tiles');
  } catch (err) {
    view.innerHTML =
      '<p>Could not load <code>' + escapeHtml(path) + '</code>: '
      + escapeHtml(err.message) + '</p>'
      + '<p><a class="back" href="#">← BACK</a></p>';
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
}

/**
 * setNavBackVisible — toggle the BACK button that lives inside the nav.
 *
 * INPUT   boolean: true on article views, false on the home view.
 * OUTPUT  the #navBack element gains or loses the .hide class.
 *
 * Putting BACK inside the nav (rather than as a separate sticky bar above
 * the article) is the simplest way to guarantee zero visible gap between
 * BACK and the nav's bottom border — they share the same row.
 */
function setNavBackVisible(visible) {
  const el = document.getElementById('navBack');
  if (!el) return;
  el.classList.toggle('hide', !visible);
}

/**
 * showHome — hide the article view, show the landing layout, hide BACK.
 * This is the "empty hash" state of the router.
 */
function showHome() {
  document.getElementById('view').classList.add('hide');
  document.getElementById('home').classList.remove('hide');
  setNavBackVisible(false);
  // The home view owns audience-routing via the lens-picker, so the
  // perspective switcher (.modebar) is hidden here via body.on-home (CSS).
  // Article views remove this class and the switcher reappears.
  document.body.classList.add('on-home');
}

/**
 * route — read window.location.hash and decide what to render.
 *
 * The rule: empty hash → home. Any non-empty hash → treat as a slug.
 * If the slug is unknown, loadArticle() falls back to home.
 *
 * BACK visibility is set here so it always reflects the current view
 * regardless of how the route changed (anchor click, browser back/forward,
 * direct URL edit).
 */
function route() {
  const slug = (location.hash || '').replace(/^#\/?/, '');
  if (!slug) { showHome(); return; }
  setNavBackVisible(true);
  loadArticle(slug);
}


/* ───── §5. Perspective state machine ─────────────────────────────────── */

/**
 * setMode — switch the global perspective.
 *
 * INPUT   one of MODES ('all' | 'founder' | 'engineer' | 'human').
 * PROCESS write the body's data-active-mode attribute (CSS reads this) and
 *         persist to localStorage. Update the visual state of the pill row.
 * OUTPUT  every paragraph with a data-mode attribute on the page is now
 *         dimmed or highlighted according to CSS rules.
 *
 * Invariant: this is the only function that writes data-active-mode. If you
 * are tempted to write that attribute from elsewhere, write it here instead.
 */
function setMode(mode) {
  const safe = MODES.includes(mode) ? mode : 'all';
  document.body.setAttribute('data-active-mode', safe);

  document.querySelectorAll('.mode-pill').forEach((pill) => {
    pill.classList.toggle('is-active', pill.dataset.mode === safe);
    pill.setAttribute('aria-pressed', String(pill.dataset.mode === safe));
  });

  try { localStorage.setItem(MODE_STORAGE_KEY, safe); } catch (_) { /* private mode */ }
}

/** wireModeBar — install one click handler per pill. Idempotent. */
function wireModeBar() {
  document.querySelectorAll('.mode-pill').forEach((pill) => {
    pill.addEventListener('click', () => setMode(pill.dataset.mode));
  });
}


/* ───── §5b. View-mode state machine ─────────────────────────────────── */

/**
 * setView — switch the article view between tile grid and continuous scroll.
 *
 * INPUT   one of VIEW_MODES ('tiles' | 'long').
 * PROCESS write body's data-view-mode attribute (CSS reads this), force-open
 *         every .chapter in long mode (and close every one in tile mode), and
 *         persist the choice to localStorage.
 * OUTPUT  the article renders as a grid of chapter CTAs (tiles) or as a
 *         continuous long-form scroll with every section visible (long).
 *
 * Invariant: this is the only function that writes data-view-mode. If you are
 * tempted to write that attribute from elsewhere, write it here instead.
 */
function setView(mode) {
  const safe = VIEW_MODES.includes(mode) ? mode : 'tiles';
  document.body.setAttribute('data-view-mode', safe);

  document.querySelectorAll('.chapter').forEach((d) => {
    if (safe === 'long') d.setAttribute('open', '');
    else d.removeAttribute('open');
  });

  document.querySelectorAll('.view-toggle').forEach((btn) => {
    const active = btn.dataset.view === safe;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  try { localStorage.setItem(VIEW_STORAGE_KEY, safe); } catch (_) { /* private mode */ }
}

/** wireViewBar — install one click handler per view-toggle. Idempotent. */
function wireViewBar() {
  document.querySelectorAll('.view-toggle').forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });
}


/* ───── §6. Boot ──────────────────────────────────────────────────────── */

/**
 * wireNavBack — install the click handler on the nav-resident BACK link.
 *
 * Behaviour, picked at click time:
 *   - If the user has navigated within this tab (window.history.length > 1),
 *     fire history.back() — the browser's hash history naturally records
 *     every #slug change made by an internal anchor click, so going back
 *     lands the user on whichever doc they came from (not always home).
 *   - If they arrived via a deep link in a fresh tab (history.length === 1),
 *     history.back() would do nothing — fall through to href="#" and route
 *     them to home so the BACK button is never a dead end.
 */
function wireNavBack() {
  const el = document.getElementById('navBack');
  if (!el) return;
  el.addEventListener('click', (event) => {
    if (window.history.length > 1) {
      event.preventDefault();
      history.back();
    }
  });
}

/**
 * boot — the one-and-only DOMContentLoaded handler.
 *
 * Steps, in order:
 *   1. Wire the perspective pills.
 *   2. Wire the nav BACK link.
 *   3. Apply the persisted perspective (or 'all' if none stored).
 *   4. Decorate any code blocks already in the static landing HTML.
 *   5. Run the router for whatever hash we landed on.
 *   6. Listen for hash changes for in-page navigation thereafter.
 */
function boot() {
  wireModeBar();
  wireViewBar();
  wireNavBack();

  let stored = 'all';
  try { stored = localStorage.getItem(MODE_STORAGE_KEY) || 'all'; } catch (_) {}
  setMode(stored);

  let storedView = 'tiles';
  try { storedView = localStorage.getItem(VIEW_STORAGE_KEY) || 'tiles'; } catch (_) {}
  setView(storedView);

  enhanceCodeBlocks(document);

  // Rewrite any static .md anchors on the landing page (Bento refs, Capstone
  // footnotes, etc.) so they hash-route through the parser instead of dumping
  // the user into a raw text/markdown response from Cloudflare Pages.
  rewriteInternalLinks(document);

  // Delegated click safety net — if a .md link slipped through (added by a
  // future author, or living in an embedded fragment), intercept the click,
  // rewrite to hash, and let route() handle it. Anything outside SLUG_TO_PATH
  // is left alone so the raw-file URL still works as a last-resort fallback.
  document.addEventListener('click', (event) => {
    const a = event.target.closest && event.target.closest('a[href$=".md"]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const m = href.match(/(?:^|\/)([^\/]+)\.md$/);
    if (m && SLUG_TO_PATH[m[1]]) {
      event.preventDefault();
      location.hash = '#' + m[1];
    }
  });

  route();
  window.addEventListener('hashchange', route);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
