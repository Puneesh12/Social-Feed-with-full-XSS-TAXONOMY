// Admin routes — server-side authorisation enforced on every one (report §5.4).
import { Router } from 'express';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/users', async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const { rows } = await query(
    'SELECT id, username, role, created_at FROM users WHERE username ILIKE $1 ORDER BY id LIMIT 100',
    [q]
  );
  res.json({ users: rows });
});

adminRouter.post('/users/:id/role', async (req, res) => {
  const { role } = req.body || {};
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'bad role' });
  await query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
  await query('INSERT INTO audit_log (actor_id, action, detail) VALUES ($1,$2,$3)',
    [req.session.userId, 'set_role', `${req.params.id}->${role}`]);
  res.json({ ok: true });
});

adminRouter.get('/reports', async (req, res) => {
  const status = req.query.status || 'open';
  const { rows } = await query(
    `SELECT r.id, r.status, r.created_at, p.id AS post_id, p.body
     FROM reports r JOIN posts p ON p.id = r.post_id
     WHERE r.status = $1 ORDER BY r.created_at DESC`,
    [status]
  );
  res.json({ reports: rows });
});
