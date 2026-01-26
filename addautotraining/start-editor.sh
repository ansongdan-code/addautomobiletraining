#!/bin/bash
# Quick Start Script for Visual App Editor

echo "🎨 Visual App Editor - Quick Start"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Change to project directory
echo "📂 Entering project directory..."
cd "$(dirname "$0")" || exit

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Starting development server..."
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "⏳ This may take a minute..."
echo ""

# Start backend
echo "📌 Starting backend..."
node server.js &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 3

# Start frontend
echo "📌 Starting frontend..."
export PORT=3000
npx react-scripts start &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo ""
echo "🌐 Open browser to: http://localhost:3000"
echo ""
echo "📝 To access the Visual App Editor:"
echo "   1. Login with admin credentials"
echo "   2. Go to Admin Dashboard (/admin)"
echo "   3. Click 'Theme & UI' tab"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
