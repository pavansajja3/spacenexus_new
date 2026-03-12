#!/bin/bash
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║         SpaceNexus — Starting up             ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check postgres
if ! pg_isready -q 2>/dev/null; then
  echo "⚠️  PostgreSQL doesn't seem to be running."
  echo "   Ubuntu:  sudo systemctl start postgresql"
  echo "   macOS:   brew services start postgresql@14"
  echo ""
fi

# Backend in background
echo "🔧  Starting backend on port 5000..."
cd backend && npm run dev &
BACKEND_PID=$!

sleep 2

# Frontend
echo "🎨  Starting frontend on port 3000..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo ""
echo "✅  Both servers starting!"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "   Press Ctrl+C to stop both."
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT INT TERM
wait
