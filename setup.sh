#!/bin/bash

echo "🚀 Setting up Vue Microfrontend Project..."

# Create directories
mkdir -p shell/src/{components,views,router,decorators,services}
mkdir -p product-module/src/{components,decorators}
mkdir -p user-module/src/{components,decorators}

# Install dependencies
echo "📦 Installing Shell dependencies..."
cd shell && npm install

echo "📦 Installing Product Module dependencies..."
cd ../product-module && npm install

echo "📦 Installing User Module dependencies..."
cd ../user-module && npm install

echo "✅ Setup complete!"
echo ""
echo "To run the project:"
echo "1. Terminal 1: cd product-module && npm run build && npm run preview"
echo "2. Terminal 2: cd user-module && npm run build && npm run preview"
echo "3. Terminal 3: cd shell && npm run dev"
echo "4. Open http://localhost:5000"