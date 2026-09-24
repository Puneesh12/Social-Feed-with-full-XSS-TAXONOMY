// Auth routes: register, login, logout, me.
import { Router } from 'express';
import { query } from '../db.js';
import { hashPassword, verifyPassword, currentUser } from '../auth.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { username, password, displayName } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const hash = await hashPassword(password);
    const { rows } = await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, hash]
    );
    const userId = rows[0].id;
    await query(
      'INSERT INTO profiles (user_id, display_name) VALUES ($1, $2)',
      [userId, displayName || username]
    );
    req.session.userId = userId;
    res.status(201).json({ id: userId, username });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'username taken' });
    console.error('register error', err.code);
    res.status(500).json({ error: 'registration failed' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const { rows } = await query('SELECT id, password_hash FROM users WHERE username = $1', [username]);
  const user = rows[0];
  // Constant-ish response regardless of whether the user exists.
  const ok = user ? await verifyPassword(user.password_hash, password) : false;
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  req.session.userId = user.id;
  res.json({ id: user.id, username });
});

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

authRouter.get('/me', async (req, res) => {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ error: 'not authenticated' });
  res.json(user);
});
