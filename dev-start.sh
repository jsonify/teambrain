#!/bin/bash

# TeamBrain Development Quick Start
# This script pulls latest changes and compiles the extension

echo "🚀 TeamBrain Development Setup"
echo ""

echo "📥 Pulling latest changes..."
git pull

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🔨 Compiling TypeScript..."
pnpm run compile

echo ""
echo "✅ Ready to develop!"
echo ""
echo "Next steps:"
echo "  1. Open this folder in VS Code"
echo "  2. Press F5 to launch Extension Development Host"
echo "  OR"
echo "  3. Run 'pnpm run package' to create VSIX"
