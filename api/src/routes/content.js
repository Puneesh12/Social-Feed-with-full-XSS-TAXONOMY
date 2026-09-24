// -----------------------------------------------------------------------------
// Feed, posts, comments, profile, follow — the JSON API.
//
// The API returns RAW stored content as JSON in both builds. That is correct:
// JSON is data, not markup. The stored-XSS vulnerability lives in HOW the
// FRONTEND renders it (innerHTML vs textContent), which is toggled in the web
// app. This mirrors the report: the sink is the render boundary (§8.4).
//
// The javascript:-URL defence (XSS-P-01) is applied server-side here for the
// profile website field, because a scheme allow-list is a server concern.
// -----------------------------------------------------------------------------
import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';
import { safeUrl } from '../security.js';

export const contentRouter = Router();

// --- Feed -------------------------------------------------------------------
contentRouter.get('/feed', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 100);
  const { rows } = await query(
    `SELECT p.id, p.body, p.link_url, p.created_at,
            u.username, pr.display_name, pr.avatar_url
     FROM posts p
     JOIN users u ON u.id = p.author_id
     LEFT JOIN profiles pr ON pr.user_id = u.id
     ORDER BY p.created_at DESC
     LIMIT $1`,
    [limit]
  );
  res.json({ posts: rows });
});

// --- Create a post ----------------------------------------------------------
contentRouter.post('/posts', requireAuth, async (req, res) => {
  const { body, linkUrl, visibility } = req.body || {};
  if (!body || !String(body).trim()) return res.status(400).json({ error: 'body required' });
  // Store the raw link but normalise its scheme in the defended build so a
  // javascript: URL never reaches the client href (XSS-P-01).
  const storedLink = safeUrl(linkUrl || '');
  const { rows } = await query(
    'INSERT INTO posts (author_id, body, link_url, visibility) VALUES ($1,$2,$3,$4) RETURNING id',
    [req.session.userId, body, storedLink, visibility || 'public']
  );
  res.status(201).json({ id: rows[0].id });
});

contentRouter.get('/posts/:id', async (req, res) => {
  const { rows } = await query(
    `SELECT p.id, p.body, p.link_url, p.created_at, u.username, pr.display_name
     FROM posts p JOIN users u ON u.id = p.author_id
     LEFT JOIN profiles pr ON pr.user_id = u.id
     WHERE p.id = $1`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

contentRouter.delete('/posts/:id', requireAuth, async (req, res) => {
  const { rowCount } = await query(
    'DELETE FROM posts WHERE id = $1 AND author_id = $2',
    [req.params.id, req.session.userId]
  );
  if (!rowCount) return res.status(404).json({ error: 'not found or not yours' });
  res.json({ ok: true });
});

contentRouter.post('/posts/:id/comments', requireAuth, async (req, res) => {
  const { body } = req.body || {};
  if (!body || !String(body).trim()) return res.status(400).json({ error: 'body required' });
  await query(
    'INSERT INTO comments (post_id, author_id, body) VALUES ($1,$2,$3)',
    [req.params.id, req.session.userId, body]
  );
  res.status(201).json({ ok: true });
});

// --- Profile ----------------------------------------------------------------
contentRouter.get('/profile/:username', async (req, res) => {
  const { rows } = await query(
    `SELECT u.username, u.role, pr.display_name, pr.bio, pr.website, pr.avatar_url
     FROM users u LEFT JOIN profiles pr ON pr.user_id = u.id
     WHERE u.username = $1`,
    [req.params.username]
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

contentRouter.put('/profile', requireAuth, async (req, res) => {
  const { displayName, bio, website, avatarUrl } = req.body || {};
  // website + avatarUrl pass through the scheme allow-list in defended mode.
  await query(
    `UPDATE profiles
     SET display_name = $1, bio = $2, website = $3, avatar_url = $4
     WHERE user_id = $5`,
    [displayName || '', bio || '', safeUrl(website || ''), safeUrl(avatarUrl || ''), req.session.userId]
  );
  res.json({ ok: true });
});

// --- Follow -----------------------------------------------------------------
contentRouter.post('/follow/:username', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT id FROM users WHERE username = $1', [req.params.username]);
  if (!rows[0]) return res.status(404).json({ error: 'no such user' });
  await query(
    `INSERT INTO follows (follower_id, followee_id) VALUES ($1,$2)
     ON CONFLICT DO NOTHING`,
    [req.session.userId, rows[0].id]
  );
  await query('INSERT INTO audit_log (actor_id, action, detail) VALUES ($1,$2,$3)',
    [req.session.userId, 'follow', req.params.username]);
  res.json({ ok: true });
});
