const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const pool     = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const sign = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const { rows } = await pool.query(
      `SELECT id,name,email,password_hash,role,phone,avatar,status,
              business,business_type,gst,location
       FROM users WHERE email = $1`, [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });
    if (user.status !== 'active')
      return res.status(403).json({ error: 'Account is inactive. Contact support.' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ error: 'Invalid email or password' });

    delete user.password_hash;
    res.json({ token: sign(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, business, businessType, gst, location, website } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'name, email, password and role are required' });
  if (!['super_owner','admin','tenant'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });
  if (role === 'tenant' && (!business || !gst))
    return res.status(400).json({ error: 'Business name and GST are required for tenants' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (exists.rows.length)
      return res.status(409).json({ error: 'Email already registered' });

    const hash   = await bcrypt.hash(password, 10);
    const avatar = role === 'super_owner' ? '👑' : role === 'admin' ? '🏢' : '🔑';
    const { rows } = await pool.query(
      `INSERT INTO users (name,email,password_hash,role,phone,avatar,status,business,business_type,gst,location,website)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9,$10,$11)
       RETURNING id,name,email,role,phone,avatar,status,business,business_type,gst,location`,
      [name, email.toLowerCase(), hash, role, phone||null, avatar,
       business||null, businessType||null, gst||null, location||null, website||null]
    );
    const user = rows[0];
    res.status(201).json({ token: sign(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id,name,email,role,phone,avatar,status,business,business_type,gst,location
       FROM users WHERE id=$1`, [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/auth/me ─────────────────────────────────────────────────────
router.patch('/me', authenticate, async (req, res) => {
  const { name, phone, location, business, businessType, gst, website } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users SET name=$1,phone=$2,location=$3,business=$4,
        business_type=$5,gst=$6,website=$7
       WHERE id=$8
       RETURNING id,name,email,role,phone,avatar,status,business,business_type,gst,location`,
      [name, phone||null, location||null, business||null,
       businessType||null, gst||null, website||null, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/auth/password ───────────────────────────────────────────────
router.patch('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Both current and new password required' });
  if (newPassword.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
