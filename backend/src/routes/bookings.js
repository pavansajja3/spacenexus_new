const router = require('express').Router();
const pool   = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// ── GET /api/bookings ──────────────────────────────────────────────────────
// super_owner/admin → all bookings; tenant → own bookings only
router.get('/', async (req, res) => {
  const { status, space_id } = req.query;
  try {
    let q = `
      SELECT b.*,
        u.name  AS tenant_name, u.email AS tenant_email, u.business AS tenant_business,
        un.number AS unit_number, un.type AS unit_type,
        s.name  AS space_name
      FROM bookings b
      JOIN users  u  ON u.id  = b.tenant_id
      JOIN units  un ON un.id = b.unit_id
      JOIN spaces s  ON s.id  = b.space_id
      WHERE 1=1
    `;
    const p = [];

    // Role-based filter: tenants only see their own
    if (req.user.role === 'tenant') {
      p.push(req.user.id);
      q += ` AND b.tenant_id=$${p.length}`;
    }
    if (status)   { p.push(status);   q += ` AND b.status=$${p.length}`;   }
    if (space_id) { p.push(space_id); q += ` AND b.space_id=$${p.length}`; }

    q += ' ORDER BY b.created_at DESC';
    const { rows } = await pool.query(q, p);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/bookings/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*,
         u.name AS tenant_name, un.number AS unit_number,
         s.name AS space_name
       FROM bookings b
       JOIN users u  ON u.id  = b.tenant_id
       JOIN units un ON un.id = b.unit_id
       JOIN spaces s ON s.id  = b.space_id
       WHERE b.id=$1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Booking not found' });
    // Tenants can only see their own
    if (req.user.role === 'tenant' && rows[0].tenant_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/bookings ─────────────────────────────────────────────────────
router.post('/', authorize('tenant'), async (req, res) => {
  const { unit_id, space_id, from_date, to_date, total, days, notes } = req.body;
  if (!unit_id || !space_id || !from_date || !to_date || !total)
    return res.status(400).json({ error: 'unit_id, space_id, from_date, to_date and total are required' });

  try {
    // Check unit is available
    const unitRes = await pool.query(
      `SELECT u.status, s.owner_approved, s.status AS space_status
       FROM units u JOIN spaces s ON s.id=u.space_id WHERE u.id=$1`, [unit_id]
    );
    const unit = unitRes.rows[0];
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    if (unit.status !== 'available')
      return res.status(409).json({ error: 'Unit is not available for booking' });
    if (!unit.owner_approved || unit.space_status !== 'active')
      return res.status(409).json({ error: 'Space is not yet approved for bookings' });

    // Check no overlapping approved booking
    const overlap = await pool.query(
      `SELECT id FROM bookings
       WHERE unit_id=$1 AND status IN ('pending','approved')
         AND NOT (to_date < $2 OR from_date > $3)`,
      [unit_id, from_date, to_date]
    );
    if (overlap.rows.length)
      return res.status(409).json({ error: 'Unit already has a booking overlapping these dates' });

    const { rows } = await pool.query(
      `INSERT INTO bookings (unit_id,space_id,tenant_id,from_date,to_date,days,total,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [unit_id, space_id, req.user.id, from_date, to_date, days||1, total, notes||null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/bookings/:id/approve ───────────────────────────────────────
router.patch('/:id/approve', authorize('super_owner','admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE bookings SET status='approved', payment_status='unpaid',
         approved_by=$1, approved_at=NOW()
       WHERE id=$2 AND status='pending' RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found or already processed' });
    }
    // Mark unit as booked
    await client.query(
      `UPDATE units SET status='booked' WHERE id=$1`, [rows[0].unit_id]
    );
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// ── PATCH /api/bookings/:id/reject ────────────────────────────────────────
router.patch('/:id/reject', authorize('super_owner','admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE bookings SET status='rejected', approved_by=$1, approved_at=NOW()
       WHERE id=$2 AND status='pending' RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Booking not found or already processed' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/bookings/:id/cancel ────────────────────────────────────────
router.patch('/:id/cancel', async (req, res) => {
  try {
    const booking = await pool.query('SELECT * FROM bookings WHERE id=$1', [req.params.id]);
    if (!booking.rows[0]) return res.status(404).json({ error: 'Booking not found' });
    const b = booking.rows[0];

    // Tenants can only cancel their own
    if (req.user.role === 'tenant' && b.tenant_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `UPDATE bookings SET status='cancelled'
         WHERE id=$1 RETURNING *`, [req.params.id]
      );
      // Free the unit back to available
      await client.query(
        `UPDATE units SET status='available' WHERE id=$1`, [b.unit_id]
      );
      await client.query('COMMIT');
      res.json(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally { client.release(); }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/bookings/:id/pay ───────────────────────────────────────────
router.patch('/:id/pay', authorize('tenant'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE bookings SET payment_status='paid'
       WHERE id=$1 AND tenant_id=$2 AND status='approved' AND payment_status='unpaid'
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Booking not eligible for payment' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
