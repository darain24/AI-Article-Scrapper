#!/bin/bash
set -e  # Exit on error

echo "🚀 Starting Vercel build process..."

echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

echo "🔧 Generating Prisma client..."
cd ../backend
# Prisma generate doesn't need DATABASE_URL, but set a dummy one if missing
export DATABASE_URL=${DATABASE_URL:-"postgresql://dummy:dummy@localhost:5432/dummy"}
npx prisma generate
echo "✅ Prisma client generated"

echo "🏗️ Building frontend..."
cd ../frontend
npm run build
echo "✅ Frontend built successfully"

echo "🎉 Build completed successfully!"

