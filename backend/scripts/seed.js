/**
 * seed.js — populates the DB with the same mock data from data.js
 * Run after migrate: node scripts/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/db/pool');

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱  Seeding users…');
    const hash = await bcrypt.hash('password', 10);

    await client.query(
      `
      INSERT INTO users (
        id, name, email, password_hash, role, phone, avatar, status,
        business, business_type, gst, location
      ) VALUES
        (1,'Pawan Kumar', 'owner@spacenexus.com',  $1,'super_owner','9876543210','👑','active',NULL,NULL,NULL,NULL),
        (2,'Rahul Sharma','admin@spacenexus.com',  $1,'admin',      '9123456780','🏢','active',NULL,NULL,NULL,NULL),
        (3,'Priya Singh', 'tenant@spacenexus.com', $1,'tenant',     '9988776655','🔑','active','FreshMart Ltd','Retail','27AAPFU0939F1ZV','Mumbai'),
        (4,'Arjun Mehta', 'tenant2@spacenexus.com',$1,'tenant',     '9222333444','🔑','active','AdVision Corp','Advertising','29AAGCA8719B1Z8','Bangalore')
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        phone = EXCLUDED.phone,
        avatar = EXCLUDED.avatar,
        status = EXCLUDED.status,
        business = EXCLUDED.business,
        business_type = EXCLUDED.business_type,
        gst = EXCLUDED.gst,
        location = EXCLUDED.location
      `,
      [hash]
    );

    await client.query(`
      SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1))
    `);

    console.log('🌱  Seeding spaces…');
    await client.query(`
      INSERT INTO spaces (
        id, name, type, location, floors, area, status,
        owner_approved, admin_id, created_at
      ) VALUES
        (1,'Grand Central Mall',  'Mall',              'Mumbai, MH',    3,12000,'active', true, 2,'2025-01-10'),
        (2,'Cineplex Hyderabad',  'Theatre',           'Hyderabad, TS', 2,5000, 'active', true, 2,'2025-01-18'),
        (3,'Metro Hub Delhi',     'Transit Hub',       'Delhi, DL',     1,3000, 'pending',false,2,'2025-02-05'),
        (4,'Nexus Exhibition Ctr','Exhibition Center', 'Chennai, TN',   2,8000, 'active', true, 2,'2025-02-14')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        location = EXCLUDED.location,
        floors = EXCLUDED.floors,
        area = EXCLUDED.area,
        status = EXCLUDED.status,
        owner_approved = EXCLUDED.owner_approved,
        admin_id = EXCLUDED.admin_id,
        created_at = EXCLUDED.created_at
    `);

    await client.query(`
      SELECT setval('spaces_id_seq', COALESCE((SELECT MAX(id) FROM spaces), 1))
    `);

    console.log('🌱  Seeding units…');
    await client.query(`
      INSERT INTO units (
        id, space_id, floor, number, type, width, height,
        price_daily, price_weekly, price_monthly, status,
        pos_x, pos_y, w, h
      ) VALUES
        -- Grand Central Mall Floor 1
        ('U1',  1,1,'A1','Advertisement Screen',4,3,1500, 9000, 32000, 'available',   7,10,13,12),
        ('U2',  1,1,'A2','Banner Slot',         3,2, 800, 5000, 18000, 'booked',     23,10,11,12),
        ('U3',  1,1,'A3','Booth',               5,4,2000,12000, 42000, 'available',   37,10,13,12),
        ('U4',  1,1,'A4','Shop',                6,5,3500,20000, 70000, 'available',   53,10,15,12),
        ('U5',  1,1,'A5','Digital Billboard',   8,6,5000,30000,100000, 'available',   71,10,14,12),
        ('U6',  1,1,'B1','Digital Billboard',   8,6,5500,33000,110000, 'maintenance',  7,27,18,13),
        ('U7',  1,1,'B2','Banner Slot',         3,2, 700, 4500, 16000, 'available',   29,27,11,13),
        ('U8',  1,1,'B3','Advertisement Screen',4,3,1800,10800, 38000, 'booked',      44,27,13,13),
        ('U9',  1,1,'B4','Booth',               4,4,2200,13200, 46000, 'available',   61,27,13,13),
        ('U10', 1,1,'B5','Shop',                5,4,3000,18000, 60000, 'available',   78,27,13,13),

        -- Grand Central Mall Floor 2
        ('U11', 1,2,'C1','Shop',                7,5,4000,24000, 84000, 'available',    7,10,17,13),
        ('U12', 1,2,'C2','Digital Billboard',  10,8,6000,36000,120000, 'available',   27,10,21,13),
        ('U13', 1,2,'C3','Banner Slot',         3,2, 900, 5400, 19500, 'maintenance', 52,10,11,13),
        ('U14', 1,2,'C4','Booth',               5,4,2500,15000, 52000, 'available',   67,10,13,13),
        ('U15', 1,2,'C5','Advertisement Screen',4,3,1600, 9600, 34000, 'available',   84,10,11,13),

        -- Grand Central Mall Floor 3
        ('U16', 1,3,'D1','Shop',               10,8,6000,36000,130000, 'available',    7,10,22,15),
        ('U17', 1,3,'D2','Digital Billboard',  12,9,8000,48000,160000, 'booked',      33,10,24,15),
        ('U18', 1,3,'D3','Booth',               5,4,2800,16800, 58000, 'available',   61,10,14,15),
        ('U19', 1,3,'D4','Advertisement Screen',4,3,2000,12000, 42000, 'available',   79,10,14,15),

        -- Cineplex
        ('U20', 2,1,'T1','Advertisement Screen',6,4,2500,15000, 55000, 'available',    7,10,15,14),
        ('U21', 2,1,'T2','Digital Billboard',  10,8,7000,42000,140000, 'booked',      26,10,22,14),
        ('U22', 2,1,'T3','Banner Slot',         3,2,1000, 6000, 22000, 'available',   52,10,12,14),
        ('U23', 2,1,'T4','Booth',               5,5,3000,18000, 65000, 'available',   68,10,14,14),

        -- Nexus Exhibition
        ('U24', 4,1,'E1','Booth',               6,6,3200,19000, 68000, 'available',    7,10,16,14),
        ('U25', 4,1,'E2','Advertisement Screen',5,4,2200,13000, 46000, 'available',   27,10,14,14),
        ('U26', 4,1,'E3','Digital Billboard',   8,7,5500,33000,110000, 'maintenance', 45,10,18,14)
      ON CONFLICT (id) DO UPDATE SET
        space_id = EXCLUDED.space_id,
        floor = EXCLUDED.floor,
        number = EXCLUDED.number,
        type = EXCLUDED.type,
        width = EXCLUDED.width,
        height = EXCLUDED.height,
        price_daily = EXCLUDED.price_daily,
        price_weekly = EXCLUDED.price_weekly,
        price_monthly = EXCLUDED.price_monthly,
        status = EXCLUDED.status,
        pos_x = EXCLUDED.pos_x,
        pos_y = EXCLUDED.pos_y,
        w = EXCLUDED.w,
        h = EXCLUDED.h
    `);

    console.log('🌱  Seeding bookings…');
    await client.query(`
      INSERT INTO bookings (
        id, unit_id, space_id, tenant_id, from_date, to_date,
        days, total, status, payment_status
      ) VALUES
        (1,'U2',  1,3,'2025-03-10','2025-03-20',10, 15000,  'approved','paid'),
        (2,'U8',  1,4,'2025-03-05','2025-03-15',10, 19800,  'pending', 'unpaid'),
        (3,'U17', 1,3,'2025-04-01','2025-04-30',29,160000,  'approved','paid'),
        (4,'U21', 2,4,'2025-03-15','2025-04-14',30,140000,  'approved','paid'),
        (5,'U3',  1,3,'2025-05-01','2025-05-31',30, 42000,  'pending', 'unpaid')
      ON CONFLICT (id) DO UPDATE SET
        unit_id = EXCLUDED.unit_id,
        space_id = EXCLUDED.space_id,
        tenant_id = EXCLUDED.tenant_id,
        from_date = EXCLUDED.from_date,
        to_date = EXCLUDED.to_date,
        days = EXCLUDED.days,
        total = EXCLUDED.total,
        status = EXCLUDED.status,
        payment_status = EXCLUDED.payment_status
    `);

    await client.query(`
      SELECT setval('bookings_id_seq', COALESCE((SELECT MAX(id) FROM bookings), 1))
    `);

    await client.query('COMMIT');

    console.log('✅  Seed complete!');
    console.log('\n   Demo login credentials (all use password: "password")');
    console.log('   👑  owner@spacenexus.com    — Super Owner');
    console.log('   🏢  admin@spacenexus.com    — Admin');
    console.log('   🔑  tenant@spacenexus.com   — Tenant (Priya Singh)');
    console.log('   🔑  tenant2@spacenexus.com  — Tenant (Arjun Mehta)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();