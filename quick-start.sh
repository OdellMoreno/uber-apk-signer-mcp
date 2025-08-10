#!/bin/bash

echo "🚀 Uber APK Signer MCP Server - Quick Start"
echo "============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Build the project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"

# Check if UBER_APK_SIGNER_PATH is set
if [ -z "$UBER_APK_SIGNER_PATH" ]; then
    echo ""
    echo "⚠️  UBER_APK_SIGNER_PATH environment variable is not set"
    echo "   Please set it to the path of your Uber APK Signer tool:"
    echo "   export UBER_APK_SIGNER_PATH=\"/path/to/uber-apk-signer\""
    echo ""
    echo "   Or add it to your shell profile (.bashrc, .zshrc, etc.)"
    echo ""
else
    echo "✅ UBER_APK_SIGNER_PATH is set to: $UBER_APK_SIGNER_PATH"
fi

echo ""
echo "🎉 Setup complete! You can now:"
echo ""
echo "1. Start the server:"
echo "   npm start"
echo ""
echo "2. Or start in development mode:"
echo "   npm run dev"
echo ""
echo "3. Configure your MCP client (e.g., Claude Desktop) to use this server"
echo ""
echo "📖 For detailed usage instructions, see README.md"
echo "📖 For examples, see examples/example-usage.md" 