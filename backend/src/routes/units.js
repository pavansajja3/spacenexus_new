const router = require('express').Router();
const pool   = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// ── GET /api/units?space_id=1&floor=2 ─────────────────────────────────────
router.get('/', async (req, res) => {
  const { space_id, floor, status } = req.query;
  try {
    let q = `SELECT u.*, s.name AS space_name, s.owner_approved
             FROM units u JOIN spaces s ON s.id=u.space_id WHERE 1=1`;
    const p = [];
    if (space_id) { p.push(space_id);  q += ` AND u.space_id=$${p.length}`; }
    if (floor)    { p.push(floor);     q += ` AND u.floor=$${p.length}`;    }
    if (status)   { p.push(status);    q += ` AND u.status=$${p.length}`;   }
    q += ' ORDER BY u.floor, u.number';
    const { rows } = await pool.query(q, p);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/units/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.*, s.name AS space_name FROM units u
       JOIN spaces s ON s.id=u.space_id WHERE u.id=$1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Unit not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/units ────────────────────────────────────────────────────────
router.post('/', authorize('super_owner','admin'), async (req, res) => {
  const { id, space_id, number, floor, type, width, height,
          price_daily, price_weekly, price_monthly, pos_x, pos_y, w, h } = req.body;
  if (!id || !space_id || !number)
    return res.status(400).json({ error: 'id, space_id and number are required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO units (id,space_id,number,floor,type,width,height,
         price_daily,price_weekly,price_monthly,pos_x,pos_y,w,h)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [id, space_id, number, floor||1, type||'Other',
       width||1, height||1, price_daily||0, price_weekly||0, price_monthly||0,
       pos_x||10, pos_y||10, w||13, h||12]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Unit ID or number already exists in this space' });
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/units/:id ───────────────────────────────────────────────────
router.patch('/:id', authorize('super_owner','admin'), async (req, res) => {
  const f = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE units SET
        number=COALESCE($1,number), floor=COALESCE($2,floor),
        type=COALESCE($3,type), width=COALESCE($4,width), height=COALESCE($5,height),
        price_daily=COALESCE($6,price_daily), price_weekly=COALESCE($7,price_weekly),
        price_monthly=COALESCE($8,price_monthly), status=COALESCE($9,status),
        pos_x=COALESCE($10,pos_x), pos_y=COALESCE($11,pos_y),
        w=COALESCE($12,w), h=COALESCE($13,h)
       WHERE id=$14 RETURNING *`,
      [f.number, f.floor, f.type, f.width, f.height,
       f.price_daily, f.price_weekly, f.price_monthly, f.status,
       f.pos_x, f.pos_y, f.w, f.h, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Unit not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/units/:id ─────────────────────────────────────────────────
router.delete('/:id', authorize('super_owner','admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM units WHERE id=$1', [req.params.id]);
    res.json({ message: 'Unit deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
