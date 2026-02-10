# Crypto Trading Simulation API Documentation

## Overview
Complete backend API for crypto trading simulation with admin-controlled profit/loss logic, automated trade scheduling, and comprehensive analytics.

## Core Features

### User Trading
- Schedule buy/sell trades for future execution
- Real crypto price integration (CoinGecko)
- Automatic trade execution based on scheduled time
- Portfolio and wallet management
- Trade history and statistics

### Admin Controls
- Configure win/loss percentages (0-100%)
- Toggle random outcome logic on/off
- Adjust any user's balance
- Force execute trades with specific outcomes
- Reset user passwords
- View platform and user statistics
- Audit logging of all admin actions

### Automated Execution
- Scheduled trade execution via node-cron
- Real-time crypto price updates (every 5 minutes)
- Trade outcome determination based on admin settings
- Automatic balance updates and wallet management

---

## User Trading Endpoints

### Schedule a Trade
```bash
POST /api/trades/schedule
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "type": "BUY",                          // "BUY" or "SELL"
  "cryptoSymbol": "BTC",                  // BTC, ETH, ADA, SOL, etc
  "amountUSD": 1000,                      // USD amount to trade
  "scheduledTime": "2024-01-20T14:30:00Z" // ISO 8601 format
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trade scheduled successfully",
  "data": {
    "id": "trade-id-123",
    "userId": "user-id",
    "type": "BUY",
    "cryptoSymbol": "BTC",
    "amountUSD": 1000,
    "quantity": 0.0245,
    "entryPrice": 40816.33,
    "status": "SCHEDULED",
    "scheduledTime": "2024-01-20T14:30:00Z",
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

### Get Trade History
```bash
GET /api/trades/history?limit=50&offset=0
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Trade history retrieved",
  "data": [
    {
      "id": "trade-id-123",
      "type": "BUY",
      "cryptoSymbol": "BTC",
      "amountUSD": 1000,
      "quantity": 0.0245,
      "status": "EXECUTED",
      "outcome": "WIN",
      "profitLoss": 245.50,
      "profitLossPercent": 2.45,
      "entryPrice": 40816.33,
      "exitPrice": 41817.99,
      "executedAt": "2024-01-20T14:30:00Z",
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### Get Trade Statistics
```bash
GET /api/trades/stats
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Trade stats retrieved",
  "data": {
    "totalTrades": 42,
    "winTrades": 25,
    "lossTrades": 12,
    "neutralTrades": 5,
    "winRate": 59.52,
    "totalProfit": 5240.75,
    "averageProfit": 124.78
  }
}
```

### Get User Wallets
```bash
GET /api/trades/wallets
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "User wallets retrieved",
  "data": [
    {
      "id": "wallet-id",
      "cryptoSymbol": "BTC",
      "quantity": 0.0245,
      "averageBuyPrice": 40816.33,
      "totalInvested": 1000
    }
  ]
}
```

---

## Admin Trading Endpoints

### Adjust User Balance
```bash
POST /api/admin/trades/balance
Authorization: Bearer {ADMIN_JWT_TOKEN}
Content-Type: application/json

{
  "userId": "user-id",
  "amount": 1000,                // Positive or negative amount
  "reason": "Bonus credit"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User balance adjusted",
  "data": {
    "userId": "user-id",
    "previousBalance": 5000,
    "newBalance": 6000,
    "adjustment": 1000,
    "reason": "Bonus credit"
  }
}
```

### Reset User Password
```bash
POST /api/admin/trades/password-reset
Authorization: Bearer {ADMIN_JWT_TOKEN}
Content-Type: application/json

{
  "userId": "user-id",
  "newPassword": "NewSecurePass123!"
}
```

### Get/Update Trading Settings
```bash
GET /api/admin/trades/settings
Authorization: Bearer {ADMIN_JWT_TOKEN}

PUT /api/admin/trades/settings
Authorization: Bearer {ADMIN_JWT_TOKEN}
Content-Type: application/json

{
  "winPercentage": 65,           // Win percentage (0-100)
  "lossPercentage": 25,          // Loss percentage
  "neutralPercentage": 10,       // Neutral percentage (must total 100)
  "useRandomOutcome": true,      // Enable/disable random outcomes
  "priceVariation": 2.5,         // +/- price variation %
  "tradingEnabled": true,        // Enable/disable trading
  "minTradeAmount": 10,          // Minimum trade amount USD
  "maxTradeAmount": 100000,      // Maximum trade amount USD
  "adminOverride": false         // Allow admin to override outcomes
}
```

**Settings Response:**
```json
{
  "success": true,
  "message": "Trading settings retrieved/updated",
  "data": {
    "id": "settings-id",
    "winPercentage": 65,
    "lossPercentage": 25,
    "neutralPercentage": 10,
    "useRandomOutcome": true,
    "priceVariation": 2.5,
    "tradingEnabled": true,
    "minTradeAmount": 10,
    "maxTradeAmount": 100000,
    "adminOverride": false,
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
}
```

### Force Execute Trade
```bash
POST /api/admin/trades/force-execute
Authorization: Bearer {ADMIN_JWT_TOKEN}
Content-Type: application/json

{
  "tradeId": "trade-id",
  "outcome": "WIN"              // "WIN", "LOSS", or "NEUTRAL"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trade executed forcefully",
  "data": {
    "tradeId": "trade-id",
    "status": "EXECUTED",
    "outcome": "WIN",
    "profitLoss": 245.50,
    "profitLossPercent": 2.45,
    "entryPrice": 40816.33,
    "exitPrice": 41817.99,
    "quantity": 0.0245
  }
}
```

### Cancel Trade
```bash
POST /api/admin/trades/cancel
Authorization: Bearer {ADMIN_JWT_TOKEN}
Content-Type: application/json

{
  "tradeId": "trade-id",
  "reason": "Price volatility too high"
}
```

### Get Platform Statistics
```bash
GET /api/admin/trades/stats/platform
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Platform stats retrieved",
  "data": {
    "totalUsers": 150,
    "totalTrades": 3245,
    "totalExecutedTrades": 2980,
    "totalProfit": 125430.75,
    "averageTradeProfit": 42.05
  }
}
```

### Get User Statistics
```bash
GET /api/admin/trades/stats/user/{userId}
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "User stats retrieved",
  "data": {
    "userId": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "balance": 15250.75,
    "totalInvested": 10000,
    "totalEarnings": 5250.75,
    "wallets": [
      {
        "cryptoSymbol": "BTC",
        "quantity": 0.0245,
        "averageBuyPrice": 40816.33,
        "totalInvested": 1000
      }
    ],
    "tradeStats": {
      "totalTrades": 42,
      "winTrades": 25,
      "lossTrades": 12,
      "neutralTrades": 5,
      "winRate": 59.52,
      "totalProfit": 5250.75,
      "averageProfit": 124.78
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get All Users
```bash
GET /api/admin/trades/users?limit=50&offset=0
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "All users retrieved",
  "data": {
    "users": [
      {
        "id": "user-id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "balance": 15250.75,
        "totalEarnings": 5250.75,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

### Get All Trades
```bash
GET /api/admin/trades/all?limit=50&offset=0
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

### Get Audit Logs
```bash
GET /api/admin/trades/audit-logs?adminId={optional}&limit=100&offset=0
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Audit logs retrieved",
  "data": [
    {
      "id": "log-id",
      "adminId": "admin-id",
      "action": "BALANCE_ADJUSTED",
      "targetUserId": "user-id",
      "entityType": "User",
      "entityId": "user-id",
      "changes": {
        "before": 5000,
        "after": 6000,
        "amount": 1000
      },
      "reason": "Bonus credit",
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

## Trade Logic & Outcomes

### Outcome Determination
Admin can control trade outcomes through settings:
- **winPercentage**: Chance trade results in profit (default: 60%)
- **lossPercentage**: Chance trade results in loss (default: 30%)
- **neutralPercentage**: Chance trade breaks even (default: 10%)

### Profit/Loss Calculation
```
WIN:     Price increases by 1-3%
LOSS:    Price decreases by 1-3%
NEUTRAL: No price change (0%)
```

Profit/Loss = (USD Amount × Price Change %) / 100

### Forced Outcomes
When admin uses "force execute", they directly specify the outcome:
- WIN: Randomly 1-3% profit
- LOSS: Randomly 1-3% loss
- NEUTRAL: 0% change

---

## Scheduled Trade Execution

### Automatic Execution
- Scheduler checks pending trades every minute
- Executes trades at their scheduled time
- Fetches current crypto prices from CoinGecko
- Calculates outcome based on admin settings
- Updates user balance and wallet

### Crypto Price Updates
- Prices refreshed every 5 minutes
- Cached to prevent API rate limiting
- Falls back to database if API fails

### Execution Timeline
1. User schedules trade with future time
2. Scheduler picks up trade at scheduled time
3. Current crypto price fetched
4. Outcome determined (random or forced)
5. Profit/loss calculated
6. User balance updated
7. Trade marked as EXECUTED
8. Execution logged

---

## Error Handling

### Common Errors
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE"
}
```

| Status | Error Code | Description |
|--------|-----------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 400 | TRADE_AMOUNT_ERROR | Amount outside min/max range |
| 401 | UNAUTHORIZED | Missing/invalid JWT token |
| 403 | FORBIDDEN | Admin access required |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 500 | SERVER_ERROR | Internal server error |

---

## Setup & Configuration

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@localhost:5432/trading_db
JWT_SECRET=your_secret_key
COINGECKO_API_URL=https://api.coingecko.com/api/v3
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Installation
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### Initial Admin Setup
```bash
# Default admin credentials (change in production)
ADMIN_EMAIL=admin@crypto.local
ADMIN_PASSWORD=admin123456!
```

---

## Database Schema

### Key Tables
- **User**: User accounts and balances
- **Trade**: Trade records with scheduling
- **UserWallet**: Crypto holdings
- **TradingSettings**: Admin configuration
- **AuditLog**: Admin action logs
- **CryptoPrice**: Cached crypto prices
- **TradeExecution**: Trade execution logs

See `schema.prisma` for complete schema.

---

## Performance Notes

- Trade scheduling runs every minute
- Price updates cached for 5 minutes
- Supports 10,000+ concurrent users
- Database indexes on frequently queried fields
- Audit logging for compliance

This API provides a complete trading simulation backend with professional-grade admin controls and scheduling capabilities.
