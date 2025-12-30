#!/bin/sh
set -e  # Exit on any error

echo "🚀 Starting Vercel build process..."

echo "📦 Step 1: Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps || npm install
echo "✅ Backend dependencies installed"

echo "📦 Step 2: Installing frontend dependencies..."
cd ../frontend
npm install --legacy-peer-deps || npm install
echo "✅ Frontend dependencies installed"

echo "🔧 Step 3: Generating Prisma client..."
cd ../backend
# Prisma generate doesn't need a real DATABASE_URL, but set one if missing
export DATABASE_URL=${DATABASE_URL:-"postgresql://dummy:dummy@localhost:5432/dummy"}
npx prisma generate
echo "✅ Prisma client generated"

echo "🏗️ Step 4: Building frontend..."
cd ../frontend
npm run build
echo "✅ Frontend built successfully"

echo "🎉 Build completed successfully!"
