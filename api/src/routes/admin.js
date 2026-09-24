// Admin routes — server-side authorisation enforced on every one (report §5.4).
import { Router } from 'express';
import { addAudit, listReports, listUsers, updateUserRole } from '../db.js';
import { requireAdmin } from '../auth.js';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/users', async (req, res) => {
  res.json({ users: await listUsers(req.query.q || '') });
});

adminRouter.post('/users/:id/role', async (req, res) => {
  const { role } = req.body || {};
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'bad role' });
  await updateUserRole(req.params.id, role);
  await addAudit(req.session.userId, 'set_role', `${req.params.id}->${role}`);
  res.json({ ok: true });
});

adminRouter.get('/reports', async (req, res) => {
  const status = req.query.status || 'open';
  res.json({ reports: await listReports(status) });
});
