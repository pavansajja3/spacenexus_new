const router = require('express').Router();
const pool   = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('super_owner','admin'));

// GET /api/users — list all users
router.get('/', async (req, res) => {
  try {
    const { role, status } = req.query;
    let q = `SELECT id,name,email,role,phone,avatar,status,business,business_type,gst,location,created_at FROM users WHERE 1=1`;
    const p = [];
    if (role)   { p.push(role);   q += ` AND role=$${p.length}`;   }
    if (status) { p.push(status); q += ` AND status=$${p.length}`; }
    q += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(q, p);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/users/:id/status — activate / deactivate
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['active','inactive','pending'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    const { rows } = await pool.query(
      `UPDATE users SET status=$1 WHERE id=$2 RETURNING id,name,email,role,status`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
