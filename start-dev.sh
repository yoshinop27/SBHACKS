#!/bin/bash

# Alternative script that runs both servers in separate terminal windows (macOS)
# This version opens each server in a new terminal tab/window

# Start backend in new terminal window
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/backend && python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"'

# Wait a moment
sleep 1

# Start frontend in new terminal window
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)' && npm run dev"'

echo "Started backend and frontend in separate terminal windows!"

