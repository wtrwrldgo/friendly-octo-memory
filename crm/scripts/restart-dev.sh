#!/bin/bash

# Clean Restart Script for Next.js Dev Server
# Usage: ./scripts/restart-dev.sh

echo "🛑 Stopping all Node.js processes..."
pkill -9 -f "node" 2>/dev/null
sleep 2

echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🔓 Clearing ports 3000-3010..."
for port in {3000..3010}; do
  lsof -ti:$port | xargs kill -9 2>/dev/null
done

echo ""
echo "✨ Clean slate ready!"
echo ""
echo "📋 Next steps:"
echo "  1. Start your dev server manually"
echo "  2. Visit http://localhost:3000"
echo ""
echo "💡 Tip: Only run ONE dev server at a time!"
echo ""
