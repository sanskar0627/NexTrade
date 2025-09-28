#!/bin/bash
# NexTrade Production Deployment Script

set -e  # Exit on any error

echo "🚀 NexTrade Production Deployment"
echo "=================================="

# Check required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERROR: JWT_SECRET environment variable is required"  
    exit 1
fi

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
cd api && npm ci --only=production
cd ../frontend && npm ci --only=production
cd ../db && npm ci --only=production
cd ..

echo "✅ Dependencies installed"

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Frontend built successfully"

# Setup database
echo "🗄️ Setting up database..."
cd db
npx prisma generate
npx prisma db push
npm run db:seed
cd ..

echo "✅ Database setup complete"

# Copy database schema to API
echo "📋 Configuring API database..."
cp db/prisma/schema.prisma api/prisma/schema.prisma
cd api
npx prisma generate
cd ..

echo "✅ API database configured"

echo ""
echo "🎉 Production deployment complete!"
echo ""
echo "To start the servers:"
echo "1. API: cd api && npm start"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "Or use PM2 for production:"
echo "pm2 start ecosystem.config.js"