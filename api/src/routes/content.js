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
import { createComment, createPost, deletePost, findPost, findProfile, follow,
  listFeed, updateProfile, addAudit } from '../db.js';
import { requireAuth } from '../auth.js';
import { safeUrl } from '../security.js';

export const contentRouter = Router();

// --- Feed -------------------------------------------------------------------
contentRouter.get('/feed', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 100);
  res.json({ posts: await listFeed(limit) });
});

// --- Create a post ----------------------------------------------------------
contentRouter.post('/posts', requireAuth, async (req, res) => {
  const { body, linkUrl, visibility } = req.body || {};
  if (!body || !String(body).trim()) return res.status(400).json({ error: 'body required' });
  // Store the raw link but normalise its scheme in the defended build so a
  // javascript: URL never reaches the client href (XSS-P-01).
  const storedLink = safeUrl(linkUrl || '');
  const id = await createPost({ author_id: req.session.userId, body, link_url: storedLink, visibility: visibility || 'public' });
  res.status(201).json({ id });
});

contentRouter.get('/posts/:id', async (req, res) => {
  const post = await findPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'not found' });
  res.json(post);
});

contentRouter.delete('/posts/:id', requireAuth, async (req, res) => {
  const result = await deletePost(req.params.id, req.session.userId);
  if (!result.deletedCount) return res.status(404).json({ error: 'not found or not yours' });
  res.json({ ok: true });
});

contentRouter.post('/posts/:id/comments', requireAuth, async (req, res) => {
  const { body } = req.body || {};
  if (!body || !String(body).trim()) return res.status(400).json({ error: 'body required' });
  await createComment({ post_id: req.params.id, author_id: req.session.userId, body });
  res.status(201).json({ ok: true });
});

// --- Profile ----------------------------------------------------------------
contentRouter.get('/profile/:username', async (req, res) => {
  const profile = await findProfile(req.params.username);
  if (!profile) return res.status(404).json({ error: 'not found' });
  res.json(profile);
});

contentRouter.put('/profile', requireAuth, async (req, res) => {
  const { displayName, bio, website, avatarUrl } = req.body || {};
  // website + avatarUrl pass through the scheme allow-list in defended mode.
  await updateProfile(req.session.userId, {
    display_name: displayName || '', bio: bio || '',
    website: safeUrl(website || ''), avatar_url: safeUrl(avatarUrl || ''),
  });
  res.json({ ok: true });
});

// --- Follow -----------------------------------------------------------------
contentRouter.post('/follow/:username', requireAuth, async (req, res) => {
  const user = await follow(req.session.userId, req.params.username);
  if (!user) return res.status(404).json({ error: 'no such user' });
  await addAudit(req.session.userId, 'follow', req.params.username);
  res.json({ ok: true });
});
