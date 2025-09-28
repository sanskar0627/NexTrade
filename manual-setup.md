# Manual Setup Guide (No Docker Required)

## 🔧 Prerequisites Setup

### 1. Install PostgreSQL
- Download from: https://www.postgresql.org/download/
- Create database: `nextrade_db`
- Note your credentials (username/password)

### 2. Install Redis (Optional)
- Download from: https://redis.io/download
- Or skip Redis - the app works without it

## 🚀 Step-by-Step Setup

### Step 1: Environment Configuration
```bash
# Copy and edit environment file
cd api
copy .env.example .env

# Edit .env with your database credentials:
DATABASE_URL="postgresql://username:password@localhost:5432/nextrade_db"
JWT_SECRET="your-secret-key-here"
REDIS_URL="redis://localhost:6379"  # Optional
```

### Step 2: Install Dependencies
```bash
# Install API dependencies
cd api
npm install

# Install Database utilities
cd ../db
npm install

# Install Frontend dependencies  
cd ../frontend
npm install
```

### Step 3: Database Setup
```bash
# Generate Prisma client and setup database
cd db
npx prisma generate
npx prisma db push
npm run seed  # Seeds demo data
```

### Step 4: Start Services
```bash
# Terminal 1 - API Server
cd api
npm run dev
# API runs on: http://localhost:3001

# Terminal 2 - Frontend  
cd frontend
npm run dev
# Frontend runs on: http://localhost:3000
```

### Step 5: Access Platform
- **Trading Interface**: http://localhost:3000
- **Demo Login**: email: `demo@nextrade.com`, password: `demo123`
- **Starting Balance**: $5000 USDC automatically allocated

## 🎮 What You'll See
- Real-time market data updates every 2-5 seconds
- Live order book with bid/ask spreads
- Working trade placement and order history
- Automated demo trades generating market activity
- Professional trading interface with portfolio tracking