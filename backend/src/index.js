const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const spacesRoutes = require('./routes/spaces');
const unitsRoutes = require('./routes/units');
const bookingsRoutes = require('./routes/bookings');
const analyticsRoutes = require('./routes/analytics');
const paymentsRoutes = require('./routes/payments');
const usersRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/spaces', spacesRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => {
  res.send('SpaceNexus API running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});