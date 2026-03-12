/**
 * migrate.js — creates all tables in the correct order
 * Run once:  node scripts/migrate.js
 */
require('dotenv').config();
const pool = require('../src/db/pool');

const SQL = `
-- ── EXTENSIONS ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── TYPES / ENUMS ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role        AS ENUM ('super_owner','admin','tenant');
  CREATE TYPE user_status      AS ENUM ('active','inactive','pending');
  CREATE TYPE space_status     AS ENUM ('active','pending','inactive');
  CREATE TYPE unit_type        AS ENUM (
    'Advertisement Screen','Banner Slot','Booth',
    'Shop','Digital Billboard','Kiosk','Other'
  );
  CREATE TYPE unit_status      AS ENUM ('available','booked','maintenance');
  CREATE TYPE booking_status   AS ENUM ('pending','approved','rejected','cancelled');
  CREATE TYPE payment_status   AS ENUM ('unpaid','paid','refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── USERS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role    NOT NULL DEFAULT 'tenant',
  phone         VARCHAR(20),
  avatar        VARCHAR(10)  DEFAULT '👤',
  status        user_status  NOT NULL DEFAULT 'active',
  -- Tenant-specific fields
  business      VARCHAR(120),
  business_type VARCHAR(80),
  gst           VARCHAR(20),
  location      VARCHAR(120),
  website       VARCHAR(255),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── SPACES ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spaces (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  type           VARCHAR(80)  NOT NULL,
  location       VARCHAR(120) NOT NULL,
  floors         SMALLINT     NOT NULL DEFAULT 1,
  area           INTEGER,                          -- sq metres
  status         space_status NOT NULL DEFAULT 'pending',
  owner_approved BOOLEAN      NOT NULL DEFAULT false,
  admin_id       INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  blueprint_url  TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── UNITS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS units (
  id            VARCHAR(20)  PRIMARY KEY,          -- e.g. 'U1', 'U23'
  space_id      INTEGER      NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  number        VARCHAR(20)  NOT NULL,
  floor         SMALLINT     NOT NULL DEFAULT 1,
  type          unit_type    NOT NULL DEFAULT 'Other',
  width         NUMERIC(6,2) NOT NULL DEFAULT 1,
  height        NUMERIC(6,2) NOT NULL DEFAULT 1,
  price_daily   INTEGER      NOT NULL DEFAULT 0,
  price_weekly  INTEGER      NOT NULL DEFAULT 0,
  price_monthly INTEGER      NOT NULL DEFAULT 0,
  status        unit_status  NOT NULL DEFAULT 'available',
  -- Blueprint canvas position (percentages)
  pos_x         NUMERIC(5,2) DEFAULT 10,
  pos_y         NUMERIC(5,2) DEFAULT 10,
  w             NUMERIC(5,2) DEFAULT 13,
  h             NUMERIC(5,2) DEFAULT 12,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(space_id, number)
);

-- ── BOOKINGS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id             SERIAL PRIMARY KEY,
  unit_id        VARCHAR(20)    NOT NULL REFERENCES units(id),
  space_id       INTEGER        NOT NULL REFERENCES spaces(id),
  tenant_id      INTEGER        NOT NULL REFERENCES users(id),
  from_date      DATE           NOT NULL,
  to_date        DATE           NOT NULL,
  days           INTEGER        NOT NULL DEFAULT 1,
  total          INTEGER        NOT NULL DEFAULT 0,  -- in INR paise equivalent (stored as ₹)
  status         booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  notes          TEXT,
  approved_by    INTEGER        REFERENCES users(id) ON DELETE SET NULL,
  approved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CHECK (to_date > from_date)
);

-- ── ANALYTICS SNAPSHOT (optional, for dashboard) ─────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id            SERIAL PRIMARY KEY,
  snapshot_date DATE         NOT NULL DEFAULT CURRENT_DATE,
  revenue       INTEGER      NOT NULL DEFAULT 0,
  bookings_count INTEGER     NOT NULL DEFAULT 0,
  occupancy_pct NUMERIC(5,2) DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── UPDATED_AT TRIGGERS ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN FOR t IN VALUES ('users'),('spaces'),('units'),('bookings') LOOP
  EXECUTE format('
    DROP TRIGGER IF EXISTS trg_%s_updated ON %s;
    CREATE TRIGGER trg_%s_updated
      BEFORE UPDATE ON %s
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
    t, t, t, t);
END LOOP; END $$;

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_units_space     ON units(space_id);
CREATE INDEX IF NOT EXISTS idx_units_status    ON units(status);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_unit   ON bookings(unit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_spaces_status   ON spaces(status);
`;

(async () => {
  console.log('🔄  Running migrations…');
  try {
    await pool.query(SQL);
    console.log('✅  All tables created successfully');
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
