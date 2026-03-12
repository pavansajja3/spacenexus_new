require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const app = express();

// Fix: trust proxy for rate limiter (needed on localhost too)
app.set('trust proxy', 1);

// ── MIDDLEWARE ─────────────────────────────────────────────────────────────
app.use(cors({
  origin     : process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate limiter — 100 requests per 15 min per IP
app.use('/api/', rateLimit({
  windowMs            : 15 * 60 * 1000,
  max                 : 100,
  message             : { error: 'Too many requests, please try again later.' },
  validate            : { xForwardedForHeader: false },
}));

// ── ROUTES ─────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/spaces',    require('./routes/spaces'));
app.use('/api/units',     require('./routes/units'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/payments',  require('./routes/payments'));

// ── HEALTH CHECK ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  status : 'ok',
  service: 'SpaceNexus API',
  time   : new Date().toISOString(),
}));

// ── 404 HANDLER ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── ERROR HANDLER ──────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── START ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  SpaceNexus API running on http://localhost:${PORT}`);
  console.log(`📋  Health check: http://localhost:${PORT}/health\n`);
});
