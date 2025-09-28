# NexTrade - Professional Demo Trading Platform

A **production-ready demo trading platform** for cryptocurrency and stock trading built with Next.js 14, featuring real-time market data, professional trading interface, and complete portfolio management.

## 🚀 Live Demo Features

✅ **Complete Authentication System** - Sign up/sign in with automatic $5,000 demo balance  
✅ **Real-time Market Data** - Live crypto prices via Binance WebSocket + stock data via Finnhub API  
✅ **Professional Trading Interface** - Order book, price charts, market/limit orders  
✅ **Portfolio Management** - Real-time P&L tracking, position management, complete order history  
✅ **Server-authoritative Trading Engine** - All trades processed via secure database transactions  
✅ **Complete Audit Trail** - Immutable ledger of all balance changes and trades  
✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile  

## 🎯 One-Command Setup

```bash
# Development
make dev

# Production Deploy  
make deploy-prod

# Database Setup
make db-setup
```

## 🏗️ Modern Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (Edge + Node.js runtimes) + Prisma ORM  
- **Database**: PostgreSQL (Neon) with PgBouncer connection pooling
- **Authentication**: NextAuth.js with secure bcrypt password hashing
- **Real-time Data**: Native WebSocket connections for live market feeds
- **Validation**: End-to-end Zod schemas for type safety

### Security & Performance
- Server-authoritative balance/position management with row-level locking
- SQL injection protection via Prisma ORM
- Serializable transaction isolation for concurrent trading
- Connection pooling optimized for serverless environments
- Input validation and sanitization at every layer

## 📊 Trading Features

### Supported Markets
**Cryptocurrency (10 pairs)**: BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT, XRPUSDT, ADAUSDT, DOGEUSDT, MATICUSDT, LTCUSDT, DOTUSDT  
**US Stocks (10 symbols)**: AAPL, MSFT, AMZN, GOOGL, TSLA, NVDA, META, NFLX, AMD, JPM

### Advanced Order Types
- **Market Orders**: Instant execution at current market price
- **Limit Orders**: Execute when price reaches specified limit
- **Comprehensive Validation**: Balance checks, minimum notional requirements, tick size validation
- **Slippage Protection**: Configurable slippage limits for market orders

### Professional Portfolio Features
- Real-time position tracking with unrealized P&L calculation
- Complete order history with detailed fill information
- Daily balance snapshots for performance tracking
- Comprehensive ledger entries for regulatory compliance
- Position-level and portfolio-level performance metrics

## 🔧 Environment Setup

### Required Environment Variables

Create `.env.local`:

```env
# Database - Neon PostgreSQL with pooling
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/db?sslmode=require&pgbouncer=true&connect_timeout=30&connection_limit=1"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secure-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Market Data Providers
FINNHUB_API_KEY="your-finnhub-api-key-for-stock-data"

# Optional: Redis for caching
REDIS_URL="redis://localhost:6379"
```

### Database Setup & Migration

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Apply database schema
npm run db:migrate

# Seed with market data
npm run db:seed

# Start development
npm run dev
```

## 🏛️ Database Architecture

### Core Schema Design
```sql
Users (auth + profile)
├── Accounts (USD balances with locking)
├── Positions (asset holdings + avg prices)  
├── Orders (trading requests + status)
│   └── Fills (executed trades + fees)
├── Ledger (immutable audit trail)
└── BalanceSnapshots (daily performance)
```

### Key Tables & Relations
- **Users**: Authentication, profile data, created timestamps
- **Accounts**: Per-user USD balances with row-level locking for concurrency
- **Assets**: Tradeable instruments with tick sizes, minimum notional values
- **Orders**: Trade requests with comprehensive status tracking  
- **Fills**: Executed portions of orders with price, quantity, and fees
- **Positions**: Current holdings with weighted average cost basis
- **Ledger**: Immutable record of every balance change with full audit trail

## 🔄 Trading Engine Architecture

### Order Processing Pipeline
1. **Input Validation**: Zod schema validation + business rule checks
2. **Account Locking**: SELECT...FOR UPDATE on user balances
3. **Market Data**: Real-time price fetching for market orders  
4. **Risk Checks**: Balance sufficiency, position limits, market hours
5. **Order Execution**: Atomic database transaction processing
6. **Settlement**: Balance updates, position adjustments, audit logging
7. **Response**: Detailed execution report with fill information

### Transaction Safety Guarantees
- **ACID Compliance**: Full database transaction atomicity
- **Serializable Isolation**: Prevention of race conditions in concurrent trades
- **Row-Level Locking**: Account balance protection during simultaneous orders
- **Rollback Protection**: Automatic transaction reversal on any validation failure
- **Audit Trail**: Complete immutable record of all state changes

## 📈 Real-time Market Data Integration

### Cryptocurrency Data (Binance WebSocket)
```typescript
// Real-time price updates
binanceWS.subscribeTicker('BTCUSDT', (ticker) => {
  updatePrice(ticker.symbol, ticker.price);
});

// Live order book depth
binanceWS.subscribeDepth('BTCUSDT', (depth) => {
  updateOrderBook(depth.bids, depth.asks);
});

// Trade stream
binanceWS.subscribeTrades('BTCUSDT', (trade) => {
  updateLastTrade(trade.price, trade.quantity, trade.side);
});
```

### Stock Market Data (Finnhub WebSocket)
```typescript
// Stock price updates
finnhubWS.subscribeStock('AAPL', (trade) => {
  updateStockPrice('AAPL', trade.price);
});

// Market hours awareness
const isMarketOpen = checkMarketHours('US'); // NYSE/NASDAQ hours
```

## 🚀 Performance & Scalability

### Database Optimizations
- **Connection Pooling**: PgBouncer with optimized pool settings
- **Query Optimization**: Indexed queries for all trading operations
- **Efficient Relations**: Optimized joins for portfolio queries
- **Prepared Statements**: Protection against SQL injection + performance

### Frontend Performance  
- **Server Components**: Reduced client-side JavaScript bundle
- **Selective Hydration**: Client components only where needed
- **Optimistic Updates**: Immediate UI feedback with rollback capability
- **WebSocket Management**: Efficient connection pooling and cleanup

### Caching Strategy
- **Market Data Caching**: In-memory LRU cache with TTL
- **Price Feed Deduplication**: Efficient real-time update batching
- **Static Asset CDN**: Optimized asset delivery
- **API Response Caching**: Strategic endpoint caching

## 📱 REST API Reference

### Authentication Endpoints
```http
POST /api/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "securePassword",
  "displayName": "John Doe"
}

POST /api/auth/[...nextauth] # NextAuth login endpoint
```

### Trading Endpoints
```http
# Place Order
POST /api/orders
Authorization: Required
{
  "assetId": "BTCUSDT", 
  "side": "buy|sell",
  "type": "market|limit",
  "qty": 0.1,
  "limitPrice": 43500.00
}

# Get Order History
GET /api/orders?status=filled&limit=50
Authorization: Required

# Get Portfolio  
GET /api/portfolio
Authorization: Required
```

### Market Data Endpoints
```http
# All Markets
GET /api/market

# Specific Symbol
GET /api/market?symbol=BTCUSDT

# Market Type Filter
GET /api/market?type=crypto
GET /api/market?type=stock
```

## 🧪 Testing & Quality Assurance

### Test Coverage
```bash
# Unit tests for trading engine
npm test src/lib/trading-engine.test.ts

# Integration tests for API routes  
npm test src/app/api/**/*.test.ts

# End-to-end trading flow tests
npm run test:e2e

# Type checking
npm run type-check

# Code linting
npm run lint
```

### Testing Strategy
- **Unit Tests**: Core trading logic validation
- **Integration Tests**: API endpoint testing with test database
- **E2E Tests**: Complete user journey testing
- **Load Testing**: Concurrent order processing validation
- **Security Testing**: SQL injection, XSS, CSRF protection

## 📦 Production Deployment

### Vercel Deployment (Recommended)
```bash
# 1. Connect repository to Vercel
# 2. Configure environment variables in dashboard
# 3. Deploy automatically on push to main branch

# Environment variables to set:
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.vercel.app  
FINNHUB_API_KEY=...
```

### Docker Deployment
```dockerfile
# Build optimized production image
docker build -t nextrade:latest .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  nextrade:latest
```

### Database Migration in Production
```bash
# Non-interactive migration deployment
npx prisma migrate deploy

# Validate schema after deployment
npx prisma validate
```

## 🔐 Security Implementation

### Authentication Security
- ✅ bcrypt password hashing (12 rounds)
- ✅ Secure JWT session management via NextAuth
- ✅ CSRF protection with secure cookies
- ✅ Session timeout and refresh handling
- ✅ Input sanitization on all endpoints

### Trading Security
- ✅ Server-side validation of all trade parameters
- ✅ Balance verification before order execution
- ✅ Double-entry accounting for audit compliance
- ✅ Rate limiting on trading endpoints  
- ✅ Market hours validation for stock trades

### Data Protection
- ✅ SQL injection prevention via Prisma ORM
- ✅ XSS protection with input sanitization
- ✅ Secure environment variable management
- ✅ No sensitive data in client-side code
- ✅ Database connection encryption (TLS)

## 🎓 Educational Value

This platform serves as an excellent learning resource for:

### Frontend Development
- Next.js 14 App Router patterns
- Server/Client component architecture
- Real-time WebSocket integration
- Professional trading UI/UX design
- Responsive design implementation

### Backend Development  
- RESTful API design principles
- Database schema design for financial applications
- Transaction processing and ACID compliance
- Real-time data streaming architecture
- Authentication and authorization patterns

### Financial Technology
- Order matching engine concepts
- Portfolio management algorithms
- Risk management implementation
- Audit trail and compliance requirements
- Market data integration patterns

## 📝 License & Usage

**MIT License** - Free for educational, personal, and commercial use.

This codebase provides a solid foundation for:
- Learning modern web development patterns
- Understanding financial application architecture  
- Building production trading applications
- Educational trading simulations
- Financial technology prototyping

---

## 🎉 Ready to Start Trading!

This is a **complete, professional-grade demo trading platform** featuring:

✨ **Real-time market data integration**  
🏛️ **Enterprise-grade database architecture**  
🔒 **Production-ready security implementation**  
⚡ **High-performance trading engine**  
📱 **Beautiful, responsive user interface**  
🔍 **Complete audit trail and compliance**  

**Perfect for learning, prototyping, or as a foundation for real trading applications!**

### Demo Access
1. Run `make dev` to start the application
2. Visit `http://localhost:3000` 
3. Sign up for an account
4. Receive automatic $5,000 demo balance
5. Start trading immediately!

**Built with ❤️ using modern web technologies and financial industry best practices.**