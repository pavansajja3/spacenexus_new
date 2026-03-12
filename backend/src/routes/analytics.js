const router = require('express').Router();
const pool   = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('super_owner','admin'));

// ── GET /api/analytics/dashboard ──────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const [revenue, spaces, units, bookings, monthly, spaceTypes, topSpaces] =
      await Promise.all([
        pool.query(`SELECT COALESCE(SUM(total),0) AS total_revenue FROM bookings WHERE status='approved'`),
        pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM spaces`),
        pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='available') AS available FROM units`),
        pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='pending') AS pending FROM bookings`),
        pool.query(`
          SELECT TO_CHAR(DATE_TRUNC('month',from_date),'Mon YYYY') AS month,
                 COALESCE(SUM(total),0) AS revenue
          FROM bookings WHERE status='approved'
          GROUP BY DATE_TRUNC('month',from_date)
          ORDER BY DATE_TRUNC('month',from_date) DESC LIMIT 12`),
        pool.query(`SELECT type, COUNT(*) AS count FROM spaces GROUP BY type`),
        pool.query(`
          SELECT s.name, COALESCE(SUM(b.total),0) AS revenue, COUNT(b.id) AS bookings
          FROM spaces s LEFT JOIN bookings b ON b.space_id=s.id AND b.status='approved'
          GROUP BY s.id, s.name ORDER BY revenue DESC LIMIT 5`),
      ]);

    const unitTotal = parseInt(units.rows[0].total) || 1;
    const unitAvail = parseInt(units.rows[0].available) || 0;

    res.json({
      totalRevenue   : parseInt(revenue.rows[0].total_revenue),
      totalSpaces    : parseInt(spaces.rows[0].total),
      activeSpaces   : parseInt(spaces.rows[0].active),
      totalUnits     : unitTotal,
      availableUnits : unitAvail,
      occupancyRate  : Math.round(((unitTotal - unitAvail) / unitTotal) * 100),
      totalBookings  : parseInt(bookings.rows[0].total),
      pendingBookings: parseInt(bookings.rows[0].pending),
      monthlyRevenue : monthly.rows,
      spaceTypes     : spaceTypes.rows,
      topSpaces      : topSpaces.rows,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
