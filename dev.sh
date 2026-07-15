#!/bin/bash

# Load env vars
export $(grep -v '^#' .env | xargs)

# Start backend
echo "Starting backend..."
cp .env backend/.env
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ..

# Start Supabase MCP server
echo "Starting Supabase MCP server..."
cd mcp/supabase
source venv/bin/activate
python3 server.py &
SUPABASE_MCP_PID=$!
cd ../..

echo ""
echo "Agent Garden running:"
echo "  Frontend:         http://localhost:5173"
echo "  Backend:          http://localhost:8000"
echo "  API Docs:         http://localhost:8000/docs"
echo "  Supabase MCP:     running (stdio)"
echo ""
echo "Press Ctrl+C to stop all servers"

# Stop all on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID $SUPABASE_MCP_PID" EXIT
wait
