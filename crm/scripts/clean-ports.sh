#!/bin/bash

# Clean Ports Script
# Usage: ./scripts/clean-ports.sh

echo "🔍 Checking for processes on ports 3000-3010..."
echo ""

# Show what's running
for port in {3000..3010}; do
  if lsof -ti:$port > /dev/null 2>&1; then
    echo "  ⚠️  Port $port is in use"
  fi
done

echo ""
echo "🧹 Killing all processes on ports 3001-3010 (keeping 3000 safe)..."
echo ""

# Kill ports 3001-3010
for port in {3001..3010}; do
  if lsof -ti:$port > /dev/null 2>&1; then
    lsof -ti:$port | xargs kill -9 2>/dev/null
    echo "  ✅ Killed port $port"
  fi
done

echo ""
echo "✨ Done! Port 3000 is safe."
echo ""

# Show final status
echo "📊 Final status:"
for port in {3000..3010}; do
  if lsof -ti:$port > /dev/null 2>&1; then
    echo "  🟢 Port $port: ACTIVE"
  fi
done
