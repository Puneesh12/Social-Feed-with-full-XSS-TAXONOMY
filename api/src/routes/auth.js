// Auth routes: register, login, logout, me.
import { Router } from 'express';
import { createUser, findUserByUsername, upsertProfile } from '../db.js';
import { hashPassword, verifyPassword, currentUser } from '../auth.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { username, password, displayName } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const hash = await hashPassword(password);
    const userId = await createUser({ username, password_hash: hash });
    await upsertProfile(userId, { display_name: displayName || username, bio: '', website: '', avatar_url: '' });
    req.session.userId = userId;
    res.status(201).json({ id: userId, username });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'username taken' });
    console.error('register error', err.code);
    res.status(500).json({ error: 'registration failed' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = await findUserByUsername(username, { _id: 1, password_hash: 1 });
  // Constant-ish response regardless of whether the user exists.
  const ok = user ? await verifyPassword(user.password_hash, password) : false;
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  req.session.userId = user._id.toString();
  res.json({ id: user._id.toString(), username });
});

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

authRouter.get('/me', async (req, res) => {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ error: 'not authenticated' });
  res.json(user);
});
