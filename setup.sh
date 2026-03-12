#!/bin/bash
set -e
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║     SpaceNexus — First-time Setup               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Step 1: Backend deps
echo "📦  Installing backend dependencies..."
cd backend && npm install
echo ""

# Step 2: Frontend deps
echo "📦  Installing frontend dependencies..."
cd ../frontend && npm install
echo ""

# Step 3: .env
cd ../backend
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅  Created backend/.env from .env.example"
  echo "⚠️  IMPORTANT: Edit backend/.env and set your DB_PASSWORD and JWT_SECRET"
  echo ""
fi

# Step 4: Migrate
echo "🗄️  Creating database tables..."
npm run migrate
echo ""

# Step 5: Seed
echo "🌱  Seeding demo data..."
npm run seed
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Setup complete! Run:  ./start.sh                           ║"
echo "║                                                              ║"
echo "║  Demo logins (all password: password)                       ║"
echo "║  👑  owner@spacenexus.com   — Super Owner                   ║"
echo "║  🏢  admin@spacenexus.com   — Admin                         ║"
echo "║  🔑  tenant@spacenexus.com  — Tenant (Priya)                ║"
echo "║  🔑  tenant2@spacenexus.com — Tenant (Arjun)                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
