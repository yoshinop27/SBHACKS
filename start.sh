#!/bin/bash

# Script to start both frontend and backend servers
# Run with: ./start.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting SBHACKS servers...${NC}\n"

# Check if backend dependencies are installed
if ! python3 -c "import fastapi, uvicorn" 2>/dev/null; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend
    pip install -r requirements.txt
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${BLUE}Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Start backend server
echo -e "${GREEN}Starting backend server on http://127.0.0.1:8000${NC}"
cd backend
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to initialize
sleep 2

# Start frontend server
echo -e "${GREEN}Starting frontend server...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "\n${GREEN}✓ Both servers are running!${NC}"
echo -e "${BLUE}Backend:  http://127.0.0.1:8000${NC}"
echo -e "${BLUE}Frontend: http://localhost:5173 (or check terminal output)${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}\n"
echo -e "${BLUE}View logs:${NC}"
echo -e "  Backend:  tail -f backend.log"
echo -e "  Frontend: tail -f frontend.log\n"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
