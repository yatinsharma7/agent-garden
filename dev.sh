#!/bin/bash

# Load env vars
export $(grep -v '^#' .env | xargs)

# Start backend
echo "Starting backend..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Agent Garden running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Stop both on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
