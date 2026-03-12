# SpaceNexus — Commercial Space Booking Platform

## Quick Start (Windows)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Setup Database
```
# In pgAdmin or psql, create database:
CREATE DATABASE spacenexus;
```

### 2. Configure Backend
```
cd backend
copy .env.example .env
# Edit .env — set DB_PASSWORD to your PostgreSQL password
```

### 3. Run Migrations & Seed
```
cd backend
npm install
npm run migrate
npm run seed
```

### 4. Start Backend (Terminal 1)
```
cd backend
npm run dev
```

### 5. Start Frontend (Terminal 2)
```
cd frontend
npm install
npm start
```

### 6. Open Browser
http://localhost:3000

## Demo Credentials (password: `password`)
| Role | Email |
|------|-------|
| 👑 Super Owner | owner@spacenexus.com |
| 🏢 Admin | admin@spacenexus.com |
| 🔑 Tenant | tenant@spacenexus.com |
| 🔑 Tenant 2 | tenant2@spacenexus.com |

## Blueprint / Floor Map
1. Login as Admin
2. Go to Spaces → click any space → Blueprint tab
3. Click "Upload Floor Plan" → upload mall_floor_plan.png
4. Click "+ Add Unit" → drag on map to draw unit boxes
5. Fill in unit details → Save Unit

## PayU Test Payments
- Card: `5123456789012346`
- Expiry: any future date
- CVV: `123`
