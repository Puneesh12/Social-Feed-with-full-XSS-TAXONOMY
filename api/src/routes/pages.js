// -----------------------------------------------------------------------------
// Server-rendered pages carrying two of the sinks (report §4.4):
//   GET /search        -> reflected XSS  (XSS-R-01)
//   GET /render/preview -> mutation XSS  (XSS-M-01)
//
// Both build an HTML document. In the vulnerable build user input is
// interpolated raw; in the defended build it is encoded / sanitised, and the
// page carries a nonce-based CSP (set by applySecurityHeaders on the response).
// -----------------------------------------------------------------------------
import { Router } from 'express';
import { searchPosts } from '../db.js';
import { requireAuth } from '../auth.js';
import { config } from '../config.js';
import { outHtml, sanitizeRichHtml } from '../security.js';

export const pagesRouter = Router();

function layout(res, title, inner) {
  const nonce = res.locals.cspNonce;
  // In defended mode any inline script would need the nonce; we keep these
  // pages script-light so the CSP can stay strict.
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${outHtml(title)} — Chirp</title>
  <link rel="stylesheet" href="/assets/pages.css">
</head>
<body>
  <header class="topbar"><a href="/">← Chirp</a> <span class="mode ${config.mode}">${config.mode} build</span></header>
  <main class="page">${inner}</main>
</body>
</html>`;
}

// --- Reflected: /search?q= --------------------------------------------------
pagesRouter.get('/search', async (req, res) => {
  const q = req.query.q ?? '';
  let results = [];
  if (String(q).trim()) {
    results = await searchPosts(q);
  }

  // (!) THE REFLECTED SINK: the query is echoed back into the page.
  //     Vulnerable: raw interpolation. Defended: HTML-encoded via outHtml().
  const echoed = outHtml(q);

  const list = results
    .map((r) => `<li><strong>@${outHtml(r.username)}</strong> ${outHtml(r.body)}</li>`)
    .join('');

  const inner = `
    <h1>Search Chirp</h1>
    <form class="searchbar" method="get" action="/search">
      <input name="q" value="${outHtml(q)}" placeholder="Search the feed…" autofocus>
      <button type="submit">Search</button>
    </form>
    ${String(q).trim() ? `<p class="echo">Results for: <b>${echoed}</b></p>` : ''}
    <ul class="results">${list || `<li class="muted">${String(q).trim() ? 'No posts matched your search.' : 'Type something to search.'}</li>`}</ul>
    <p class="hint">This is the server-rendered search page (the reflected-XSS demo). The in-app search is at <a href="/#/search?q=${encodeURIComponent(q)}">/#/search</a>.</p>`;

  res.type('html').send(layout(res, `Search: ${q}`, inner));
});

// --- Mutation: /render/preview?url=&html= -----------------------------------
// Renders a link-preview card from caller-supplied markup. The vulnerable build
// runs a naive <script> strip and then assigns the result as innerHTML on the
// client — the re-parse is what enables mutation XSS. The defended build uses
// DOMPurify (parser-based) and never re-parses (report §7.1, §8.4).
pagesRouter.get('/render/preview', requireAuth, async (req, res) => {
  const url = req.query.url ?? '';
  const rawHtml = req.query.html ?? '';
  const cleaned = sanitizeRichHtml(rawHtml);

  const inner = `
    <h1>Link preview</h1>
    <p class="muted">Source: ${outHtml(url)}</p>
    <div class="card">
      <div class="preview-card" id="preview">${cleaned}</div>
    </div>
    <p class="hint">This is the server-rendered preview page (the mutation-XSS demo).</p>`;

  res.type('html').send(layout(res, 'Link preview', inner));
});
