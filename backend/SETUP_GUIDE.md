# Crypto Trading Simulation Backend - Setup Guide

## Project Overview

Complete production-ready backend for a crypto trading simulation platform with:
- Admin-controlled profit/loss outcomes
- Automated trade scheduling and execution
- Real crypto price integration (CoinGecko)
- Comprehensive admin dashboard
- Audit logging and compliance tracking
- Support for 10,000+ concurrent users

---

## Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn
- Git

---

## Installation Steps

### 1. Clone and Setup Backend

```bash
cd backend
npm install
```

### 2. Database Setup

Create a PostgreSQL database:
```bash
createdb crypto_trading_db
```

### 3. Environment Configuration

Create `.env` file in backend directory:

```env
# Server
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crypto_trading_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long_change_in_production
JWT_EXPIRATION=7d

# CoinGecko API
COINGECKO_API_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY= # Optional for higher rate limits

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin Credentials (change after first login)
ADMIN_EMAIL=admin@crypto.local
ADMIN_PASSWORD=admin123456!
```

### 4. Run Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

This creates all necessary tables from the schema.

### 5. Seed Initial Data

```bash
npm run prisma:seed
```

This creates:
- Admin user
- Default trading settings
- Sample crypto price data

### 6. Start Backend Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 7. Setup Frontend Environment

Create `.env.local` in frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 8. Start Frontend

```bash
npm run dev
```

Frontend will start on `http://localhost:3000`

---

## Database Schema Overview

### Core Tables

**User**
- Authentication and balance tracking
- Role-based access (USER/ADMIN)
- Trading statistics

**Trade**
- Scheduled and executed trades
- Trade outcomes and profit/loss
- Admin override capabilities
- Trading history

**UserWallet**
- Crypto holdings per user
- Average buy price tracking
- Total invested calculation

**TradingSettings**
- Win/loss percentages (configurable)
- Random outcome toggle
- Trading hours and limits
- Admin override control

**AuditLog**
- All admin actions tracked
- User balance adjustments
- Settings changes
- Trade modifications

**CryptoPrice**
- Cached crypto prices
- Market data and 24h changes
- Auto-update timestamp

**TradeExecution**
- Execution log for debugging
- Success/failure tracking
- Price at execution time

---

## API Endpoints Summary

### User Trading (`/api/trades`)
- `POST /schedule` - Schedule a new trade
- `GET /history` - Get trade history
- `GET /stats` - Get trade statistics
- `GET /wallets` - Get crypto wallets

### Admin Trading (`/api/admin/trades`)
- `POST /balance` - Adjust user balance
- `POST /password-reset` - Reset user password
- `GET /settings` - Get trading settings
- `PUT /settings` - Update trading settings
- `POST /force-execute` - Force execute trade
- `POST /cancel` - Cancel trade
- `GET /stats/platform` - Platform statistics
- `GET /stats/user/:userId` - User statistics
- `GET /users` - List all users
- `GET /all` - List all trades
- `GET /audit-logs` - Audit logs

---

## Trade Execution Flow

### 1. User Schedules Trade
```
User → /api/trades/schedule → Trade stored as SCHEDULED
```

### 2. Automatic Execution (Every Minute)
```
Cron Job → Check pending trades → Get current price → Determine outcome → Execute
```

### 3. Outcome Determination
Based on admin settings:
- **WIN**: 1-3% price increase (default 60%)
- **LOSS**: 1-3% price decrease (default 30%)
- **NEUTRAL**: 0% change (default 10%)

### 4. Balance Update
```
Profit/Loss = (USD Amount × Price Change %) / 100
New Balance = Current Balance + Profit/Loss
```

### 5. Admin Override
Admin can force execute any trade with specific outcome:
```
Admin → /api/admin/trades/force-execute → Outcome: WIN/LOSS/NEUTRAL
```

---

## Admin Dashboard Usage

### Access Admin Panel
1. Login as admin user
2. Navigate to `/admin`
3. View platform statistics

### Manage Settings
**Settings Tab:**
- Win Percentage: Default 60%
- Loss Percentage: Default 30%
- Neutral Percentage: Default 10%
- Toggle random outcomes on/off
- Set trading enabled/disabled
- Configure min/max trade amounts

### Manage Users
**Users Tab:**
- View all registered users
- Click user to adjust balance
- Reset user passwords
- View user trading statistics

### Manage Trades
**Trades Tab:**
- View all trades on platform
- Cancel pending trades
- Force execute trades with specific outcomes
- View trade execution logs

### View Audit Logs
**Audit Tab:**
- Track all admin actions
- View balance adjustments
- Monitor settings changes
- Compliance tracking

---

## Scheduled Jobs

### Trade Execution Job
**Frequency:** Every minute (*/1 * * * *)
- Fetches pending trades
- Checks scheduled time
- Executes trades automatically
- Updates user balances
- Logs execution

### Price Refresh Job
**Frequency:** Every 5 minutes (*/5 * * * *)
- Refreshes crypto prices from CoinGecko
- Updates database cache
- Supports 10+ cryptocurrencies
- Falls back to database if API fails

---

## Crypto Symbols Supported

| Symbol | Name | Min Trade | Max Trade |
|--------|------|-----------|-----------|
| BTC | Bitcoin | $10 | $100,000 |
| ETH | Ethereum | $10 | $100,000 |
| ADA | Cardano | $10 | $100,000 |
| SOL | Solana | $10 | $100,000 |
| DOT | Polkadot | $10 | $100,000 |
| DOGE | Dogecoin | $10 | $100,000 |
| XRP | Ripple | $10 | $100,000 |
| USDT | Tether | $10 | $100,000 |
| USDC | USD Coin | $10 | $100,000 |
| BNB | Binance Coin | $10 | $100,000 |

---

## Security Considerations

### Authentication
- JWT tokens (7 days expiration)
- Bcrypt password hashing (10 salt rounds)
- Admin role verification on protected routes
- Token refresh mechanism

### Database
- Parameterized queries (Prisma prevents SQL injection)
- Row-level indexes for performance
- Audit logging of sensitive operations
- Data backup recommendations

### Admin Controls
- Two-factor authentication (implement in production)
- IP whitelisting for admin endpoints
- Rate limiting on API endpoints
- Encryption of sensitive data in transit

---

## Performance Optimization

### Database Indexes
- User email lookup
- Trade status and scheduling
- Admin actions tracking
- Crypto symbol lookups

### Caching Strategy
- 5-minute crypto price cache
- In-memory store for frequently accessed data
- Database fallback if cache fails

### Scalability
- Stateless API design
- Load balancer compatible
- Horizontal scaling ready
- Database connection pooling

---

## Testing & Verification

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@crypto.local",
    "password": "admin123456!"
  }'
```

### Test Trade Scheduling
```bash
curl -X POST http://localhost:5000/api/trades/schedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "BUY",
    "cryptoSymbol": "BTC",
    "amountUSD": 1000,
    "scheduledTime": "2024-01-25T15:00:00Z"
  }'
```

### Test Admin Settings
```bash
curl -X GET http://localhost:5000/api/admin/trades/settings \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Troubleshooting

### Issue: "Database connection failed"
**Solution:**
```bash
# Verify PostgreSQL is running
psql -l

# Check DATABASE_URL in .env
echo $DATABASE_URL

# Recreate database
dropdb crypto_trading_db
createdb crypto_trading_db
npx prisma migrate dev
```

### Issue: "Price fetch failed"
**Solution:**
- Check internet connection
- Verify CoinGecko API availability
- Check API rate limits
- Prices fall back to database cache

### Issue: "JWT token invalid"
**Solution:**
```bash
# Generate new JWT_SECRET
openssl rand -base64 32

# Update .env and restart server
```

### Issue: "Trades not executing"
**Solution:**
```bash
# Check scheduler status
curl http://localhost:5000/api/admin/trades/scheduler-status

# Verify scheduled time is in past
# Check trade status with GET /api/trades/history
```

---

## Production Deployment

### Environment Setup
1. Use strong JWT_SECRET (minimum 32 characters)
2. Set NODE_ENV=production
3. Use managed PostgreSQL service
4. Enable HTTPS (https://domain.com)
5. Configure proper CORS_ORIGIN

### Database Migration
```bash
# Production migration
NODE_ENV=production npx prisma migrate deploy
npx prisma db seed --prod
```

### Backend Deployment (Vercel/Railway/Fly.io)
```bash
# Build
npm run build

# Start
npm start
```

### Monitoring
- Error logging (Sentry/Datadog)
- Performance monitoring (New Relic)
- Database backups (automated)
- Trade execution logs (audit trail)

---

## Documentation

- **API Documentation:** `TRADING_API.md`
- **Architecture:** `PROJECT_SUMMARY.md`
- **Frontend Integration:** `FRONTEND_INTEGRATION.md`
- **Database Schema:** `schema.prisma`

---

## Support & Maintenance

### Regular Tasks
- Monitor API error rates
- Check database performance
- Review audit logs (weekly)
- Update crypto price integrations
- Security patches (monthly)

### Backup Strategy
- Daily automated backups
- Point-in-time recovery
- Test restore procedures
- Archive old audit logs

This setup provides a production-ready trading simulation platform with comprehensive admin controls and automated execution. For detailed API usage, see `TRADING_API.md`.
