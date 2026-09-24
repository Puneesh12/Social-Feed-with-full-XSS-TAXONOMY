// -----------------------------------------------------------------------------
// Authentication helpers: Argon2id password hashing + session helpers.
// Passwords are hashed with Argon2id and never logged (report §4.5).
// -----------------------------------------------------------------------------
import argon2 from 'argon2';
import { query } from './db.js';

export function hashPassword(plain) {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export function verifyPassword(hash, plain) {
  return argon2.verify(hash, plain).catch(() => false);
}

// Require a logged-in user.
export function requireAuth(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'authentication required' });
  next();
}

// Require an administrator (server-side authorisation on every admin route,
// report §5.4).
export async function requireAdmin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'authentication required' });
  const { rows } = await query('SELECT role FROM users WHERE id = $1', [req.session.userId]);
  if (rows[0]?.role !== 'admin') return res.status(403).json({ error: 'admin only' });
  next();
}

export async function currentUser(req) {
  if (!req.session?.userId) return null;
  const { rows } = await query(
    `SELECT u.id, u.username, u.role,
            p.display_name, p.bio, p.website, p.avatar_url
     FROM users u LEFT JOIN profiles p ON p.user_id = u.id
     WHERE u.id = $1`,
    [req.session.userId]
  );
  return rows[0] || null;
}
