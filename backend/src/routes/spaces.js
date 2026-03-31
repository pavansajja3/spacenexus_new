const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET all spaces
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT
        s.*,
        u.name AS admin_name,
        u.email AS admin_email,
        COUNT(un.id) AS unit_count,
        COUNT(un.id) FILTER (WHERE un.status = 'available') AS available_count
      FROM spaces s
      LEFT JOIN users u ON u.id = s.admin_id
      LEFT JOIN units un ON un.space_id = s.id
    `;

    const params = [];

    if (req.user.role === 'tenant') {
      query += ` WHERE s.status = 'active' AND s.owner_approved = true`;
    } else if (req.user.role === 'admin') {
      params.push(req.user.id);
      query += ` WHERE s.admin_id = $${params.length}`;
    }

    query += ` GROUP BY s.id, u.name, u.email ORDER BY s.created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/spaces error:', err);
    res.status(500).json({ error: 'Failed to fetch spaces' });
  }
});

// GET single space
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT s.*, u.name AS admin_name, u.email AS admin_email
      FROM spaces s
      LEFT JOIN users u ON u.id = s.admin_id
      WHERE s.id = $1
      `,
      [req.params.id]
    );

    const space = rows[0];
    if (!space) return res.status(404).json({ error: 'Space not found' });

    if (req.user.role === 'super_owner') {
      return res.json(space);
    }

    if (req.user.role === 'admin') {
      if (space.admin_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      return res.json(space);
    }

    if (req.user.role === 'tenant') {
      if (space.status !== 'active' || space.owner_approved !== true) {
        return res.status(403).json({ error: 'Access denied' });
      }
      return res.json(space);
    }

    return res.status(403).json({ error: 'Access denied' });
  } catch (err) {
    console.error('GET /api/spaces/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch space' });
  }
});

// GET floor images
router.get('/:id/floors', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT id, admin_id, status, owner_approved, floor_images
      FROM spaces
      WHERE id = $1
      `,
      [req.params.id]
    );

    const space = rows[0];
    if (!space) return res.status(404).json({ error: 'Space not found' });

    if (req.user.role === 'admin' && space.admin_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (
      req.user.role === 'tenant' &&
      (space.status !== 'active' || space.owner_approved !== true)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ floor_images: space.floor_images || {} });
  } catch (err) {
    console.error('GET /api/spaces/:id/floors error:', err);
    res.status(500).json({ error: 'Failed to fetch floor images' });
  }
});

// PATCH floor image
router.patch('/:id/floor-image', authorize('super_owner', 'admin'), async (req, res) => {
  const { floor, image } = req.body;

  if (!floor || !image) {
    return res.status(400).json({ error: 'floor and image are required' });
  }

  try {
    const existing = await pool.query(
      `
      SELECT id, admin_id, floor_images
      FROM spaces
      WHERE id = $1
      `,
      [req.params.id]
    );

    const space = existing.rows[0];
    if (!space) return res.status(404).json({ error: 'Space not found' });

    if (req.user.role === 'admin' && space.admin_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const current = space.floor_images || {};
    const updated = { ...current, [String(floor)]: image };

    const { rows } = await pool.query(
      `
      UPDATE spaces
      SET floor_images = $1
      WHERE id = $2
      RETURNING id, floor_images
      `,
      [JSON.stringify(updated), req.params.id]
    );

    res.json({ floor_images: rows[0].floor_images });
  } catch (err) {
    console.error('PATCH /api/spaces/:id/floor-image error:', err);
    res.status(500).json({ error: 'Failed to save floor image' });
  }
});

// CREATE space
router.post('/', authorize('super_owner', 'admin'), async (req, res) => {
  const { name, type, location, floors, area, blueprint_url } = req.body;

  if (!name || !type || !location) {
    return res.status(400).json({ error: 'name, type and location are required' });
  }

  try {
    const isSuperOwner = req.user.role === 'super_owner';
    const status = isSuperOwner ? 'active' : 'pending';
    const ownerApproved = isSuperOwner ? true : false;

    const { rows } = await pool.query(
      `
      INSERT INTO spaces
      (name, type, location, floors, area, status, owner_approved, admin_id, blueprint_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        name,
        type,
        location,
        floors || 1,
        area || null,
        status,
        ownerApproved,
        req.user.id,
        blueprint_url || null,
      ]
    );

    res.status(201).json({
      message: isSuperOwner
        ? 'Space created and published successfully'
        : 'Space created successfully and sent for super owner approval',
      space: rows[0],
    });
  } catch (err) {
    console.error('POST /api/spaces error:', err);
    res.status(500).json({ error: 'Failed to create space', details: err.message });
  }
});

// UPDATE space
router.patch('/:id', authorize('super_owner', 'admin'), async (req, res) => {
  const { name, type, location, floors, area, status, blueprint_url } = req.body;

  try {
    const existing = await pool.query(
      `SELECT * FROM spaces WHERE id = $1`,
      [req.params.id]
    );

    const space = existing.rows[0];
    if (!space) return res.status(404).json({ error: 'Space not found' });

    if (req.user.role === 'admin' && space.admin_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows } = await pool.query(
      `
      UPDATE spaces
      SET
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        location = COALESCE($3, location),
        floors = COALESCE($4, floors),
        area = COALESCE($5, area),
        status = COALESCE($6, status),
        blueprint_url = COALESCE($7, blueprint_url)
      WHERE id = $8
      RETURNING *
      `,
      [name, type, location, floors, area, status, blueprint_url, req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/spaces/:id error:', err);
    res.status(500).json({ error: 'Failed to update space' });
  }
});

// APPROVE space
router.patch('/:id/approve', authorize('super_owner'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      UPDATE spaces
      SET owner_approved = true,
          status = 'active'
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Space not found' });

    res.json({
      message: 'Space approved and now live for tenants',
      space: rows[0],
    });
  } catch (err) {
    console.error('PATCH /api/spaces/:id/approve error:', err);
    res.status(500).json({ error: 'Failed to approve space' });
  }
});

// REJECT space
router.patch('/:id/reject', authorize('super_owner'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      UPDATE spaces
      SET owner_approved = false,
          status = 'inactive'
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Space not found' });

    res.json({
      message: 'Space rejected successfully',
      space: rows[0],
    });
  } catch (err) {
    console.error('PATCH /api/spaces/:id/reject error:', err);
    res.status(500).json({ error: 'Failed to reject space' });
  }
});

// DELETE space
router.delete('/:id', authorize('super_owner'), async (req, res) => {
  try {
    const existing = await pool.query(
      `SELECT id FROM spaces WHERE id = $1`,
      [req.params.id]
    );

    if (!existing.rows[0]) {
      return res.status(404).json({ error: 'Space not found' });
    }

    await pool.query(`DELETE FROM spaces WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Space deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/spaces/:id error:', err);
    res.status(500).json({ error: 'Failed to delete space' });
  }
});

module.exports = router;