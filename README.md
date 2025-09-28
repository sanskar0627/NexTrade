# NexTrade - Demo Trading Exchange Platform

A fully functional demo cryptocurrency trading exchange built with Next.js, Express, PostgreSQL, and Redis.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script (Windows)
setup.bat
```

### Option 2: Manual Setup
```bash
# 1. Start database services
cd docker
docker-compose up -d

# 2. Install dependencies
cd ../api && npm install
cd ../db && npm install  
cd ../frontend && npm install

# 3. Setup database
cd ../db
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Start API server (keep terminal open)
cd ../api
npm run dev

# 5. Start frontend (in new terminal)
cd ../frontend  
npm run dev
```

## 🎯 Demo Features

### ✅ **Working Features**
- **User Authentication**: Register/Login with JWT
- **$5000 Demo Balance**: Automatic USDC allocation on registration
- **Live Trading**: Place real buy/sell orders
- **Order Management**: View order history and cancel orders
- **Live Trades**: Auto-generated demo trades every 2-5 seconds
- **Real-time Balance Updates**: See balance changes after trades
- **Market Data**: SOL/USDC and BTC/USDC trading pairs
- **Responsive UI**: Clean, modern trading interface

### 🔗 **API Endpoints**
- `POST /api/v1/auth/register` - Create account with $5000 demo
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/user/balance` - Get user balances
- `POST /api/v1/order/create` - Place trading order
- `GET /api/v1/user/orders` - Get order history
- `GET /api/v1/tickers` - Get market data
- `GET /api/v1/trades` - Get recent trades

## 🎮 **How to Use**

### 1. **Access the Platform**
- Open: http://localhost:3000
- Register new account or use demo: `demo@nextrade.com` / `demo123`

### 2. **Start Trading**
- Navigate to Trade → SOL_USDC
- See your $5000 USDC balance in top bar
- Place buy/sell orders using the right panel
- Watch live trades appear in the trades section
- Monitor your balance changes in real-time

### 3. **Features to Try**
- **Market Orders**: Instant execution at current price
- **Limit Orders**: Set your preferred price
- **Percentage Buttons**: Use 25%, 50%, 75%, Max buttons
- **Order History**: View all your past orders
- **Live Data**: Watch demo trades updating every few seconds

## 📊 **Demo Data**

### **Markets Available**
- **SOL/USDC**: $95-$105 price range
- **BTC/USDC**: $44,000-$46,000 price range

### **Auto-Generated Trades**
- 10 live trades generated every 2-5 seconds
- Realistic price movements (±2% variation)
- Random buy/sell orders
- Volume between 0.1-10 tokens

### **Demo User**
- **Email**: demo@nextrade.com
- **Password**: demo123
- **Starting Balance**: $5000 USDC

## 🏗️ **Architecture**

### **Simplified Stack**
```
Frontend (Next.js) → API (Express) → Database (PostgreSQL)
                           ↓
                     Redis (Real-time)
```

### **Key Components**
- **Frontend**: Next.js with TailwindCSS
- **API**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Pub-Sub**: Redis for real-time updates
- **Auth**: JWT tokens
- **Demo Data**: Automated trade generation

## 🗂️ **Project Structure**

```
NexTrade/
├── api/           # Express API server
├── db/            # Database config & migrations
├── docker/        # PostgreSQL & Redis services
├── frontend/      # Next.js UI
├── engine/        # Trading engine (simplified for demo)
├── ws/            # WebSocket server (optional)
├── setup.bat      # Automated setup script
├── start-api.bat  # Start API server
└── start-frontend.bat # Start frontend
```

## ⚠️ **Files Removed (Not Needed for Demo)**

The following complexity was removed to keep the demo simple:
- `mm/` - Market maker service
- `order_Book/` - Separate orderbook service  
- TimescaleDB setup - Using simple PostgreSQL
- Complex WebSocket - Using HTTP polling for demo

## 🛠️ **Development**

### **Environment Variables**
```bash
# api/.env
DATABASE_URL="postgresql://nextrade:password123@localhost:5432/nextrade"
JWT_SECRET="sanskaristhecoder6t37898746dkgfbkjsk@$#%"
REDIS_URL="redis://localhost:6379"

# db/.env  
DATABASE_URL="postgresql://nextrade:password123@localhost:5432/nextrade"
```

### **Database Schema**
- **Users**: Authentication & profile
- **Balances**: Asset holdings per user
- **Markets**: Trading pairs (SOL_USDC, BTC_USDC)
- **Orders**: Buy/sell orders with status
- **Trades**: Executed trade records

### **Key Features Implementation**
1. **Auto Demo Balance**: User gets $5000 USDC on registration
2. **Live Trades**: Background service generates realistic trades
3. **Order Execution**: Basic matching for limit/market orders
4. **Balance Updates**: Real-time balance changes after trades
5. **UI Polish**: Clean interface with loading states & error handling

## 🎯 **Next Steps for Production**

To make this production-ready, you would need:
1. **Real Trading Engine**: Implement proper order matching
2. **WebSocket Integration**: Real-time price feeds
3. **Security Hardening**: Rate limiting, input validation
4. **Real Market Data**: Connect to actual crypto APIs
5. **Advanced Features**: Stop-loss, margin trading, etc.

## 🐛 **Troubleshooting**

### **Common Issues**
- **Port conflicts**: Ensure ports 3000, 3001, 5432, 6379 are available
- **Database connection**: Make sure Docker PostgreSQL is running
- **Missing dependencies**: Run `npm install` in each directory
- **Auth errors**: Check JWT_SECRET is set in API .env file

### **Reset Demo**
```bash
# Reset database and restart demo trades
cd db
npx prisma db push --force-reset
npm run db:seed
```

---

**Demo Credentials**: `demo@nextrade.com` / `demo123`  
**Frontend**: http://localhost:3000  
**API**: http://localhost:3001  

Enjoy trading with your $5000 demo balance! 🚀