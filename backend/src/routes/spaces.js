const router = require('express').Router();
const pool   = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

// All space routes require a valid JWT
router.use(authenticate);

// ── GET /api/spaces ────────────────────────────────────────────────────────
// Tenants only see active + owner_approved spaces
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT s.*, u.name AS admin_name,
        COUNT(un.id) AS unit_count,
        COUNT(un.id) FILTER (WHERE un.status='available') AS available_count
      FROM spaces s
      LEFT JOIN users  u  ON u.id  = s.admin_id
      LEFT JOIN units  un ON un.space_id = s.id
    `;
    const params = [];
    if (req.user.role === 'tenant') {
      query += ` WHERE s.status='active' AND s.owner_approved=true`;
    }
    query += ` GROUP BY s.id, u.name ORDER BY s.created_at DESC`;
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/spaces/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, u.name AS admin_name
       FROM spaces s LEFT JOIN users u ON u.id=s.admin_id
       WHERE s.id=$1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Space not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/spaces/:id/floors ─────────────────────────────────────────────
// Returns floor plan images for all floors: { "1": "data:image/png;base64,...", "2": "..." }
router.get('/:id/floors', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT floor_images FROM spaces WHERE id=$1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Space not found' });
    // Ensure floor_images is always a plain object (JSONB can sometimes return string)
    let imgs = rows[0].floor_images || {};
    if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs); } catch(e) { imgs = {}; } }
    res.json({ floor_images: imgs });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/spaces/:id/floor-image ─────────────────────────────────────
// Saves a base64 floor plan image for a specific floor
// Body: { floor: 1, image: "data:image/png;base64,..." }
router.patch('/:id/floor-image', authorize('super_owner', 'admin'), async (req, res) => {
  const { floor, image } = req.body;
  if (!floor || !image) return res.status(400).json({ error: 'floor and image are required' });
  try {
    const existing = await pool.query(`SELECT floor_images FROM spaces WHERE id=$1`, [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Space not found' });
    const current = existing.rows[0].floor_images || {};
    const updated = { ...current, [String(floor)]: image };
    const { rows } = await pool.query(
      `UPDATE spaces SET floor_images=$1 WHERE id=$2 RETURNING id, floor_images`,
      [JSON.stringify(updated), req.params.id]
    );
    res.json({ floor_images: rows[0].floor_images });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/spaces ───────────────────────────────────────────────────────
router.post('/', authorize('super_owner','admin'), async (req, res) => {
  const { name, type, location, floors, area } = req.body;
  if (!name || !type || !location)
    return res.status(400).json({ error: 'name, type and location are required' });
  try {
    const ownerApproved = req.user.role === 'super_owner';
    const { rows } = await pool.query(
      `INSERT INTO spaces (name,type,location,floors,area,status,owner_approved,admin_id)
       VALUES ($1,$2,$3,$4,$5,'pending',$6,$7) RETURNING *`,
      [name, type, location, floors||1, area||null, ownerApproved, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/spaces/:id ──────────────────────────────────────────────────
router.patch('/:id', authorize('super_owner','admin'), async (req, res) => {
  const { name, type, location, floors, area, status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE spaces SET name=COALESCE($1,name), type=COALESCE($2,type),
        location=COALESCE($3,location), floors=COALESCE($4,floors),
        area=COALESCE($5,area), status=COALESCE($6,status)
       WHERE id=$7 RETURNING *`,
      [name, type, location, floors, area, status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Space not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/spaces/:id/approve ─────────────────────────────────────────
router.patch('/:id/approve', authorize('super_owner'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE spaces SET owner_approved=true, status='active'
       WHERE id=$1 RETURNING *`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Space not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/spaces/:id/reject ──────────────────────────────────────────
router.patch('/:id/reject', authorize('super_owner'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE spaces SET owner_approved=false, status='inactive'
       WHERE id=$1 RETURNING *`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Space not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/spaces/:id ─────────────────────────────────────────────────
router.delete('/:id', authorize('super_owner'), async (req, res) => {
  try {
    await pool.query('DELETE FROM spaces WHERE id=$1', [req.params.id]);
    res.json({ message: 'Space deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
