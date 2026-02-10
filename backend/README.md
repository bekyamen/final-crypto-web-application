# Crypto Backend API - Production Ready

A fully functional, production-ready REST API for a cryptocurrency portfolio management and trading platform built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Role-Based Access Control**: USER and ADMIN roles with protected routes
- **Portfolio Management**: Create and manage cryptocurrency holdings with real-time P&L tracking
- **Transaction Tracking**: Track all buy/sell transactions with detailed statistics
- **Real-Time Market Data**: Integration with CoinGecko API for live cryptocurrency prices
- **Data Caching**: Intelligent caching to reduce API calls and improve performance
- **Admin Dashboard**: Comprehensive analytics and platform management APIs
- **Error Handling**: Centralized error handling with consistent response format
- **Input Validation**: Zod schema validation for all inputs
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **External API**: CoinGecko (free tier)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── environment.ts       # Environment configuration
│   ├── controllers/
│   │   ├── authController.ts    # Auth business logic
│   │   ├── portfolioController.ts
│   │   ├── transactionController.ts
│   │   ├── adminController.ts
│   │   └── marketController.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── portfolioRoutes.ts
│   │   ├── transactionRoutes.ts
│   │   ├── adminRoutes.ts
│   │   └── marketRoutes.ts
│   ├── services/
│   │   ├── authService.ts       # Business logic & DB
│   │   ├── portfolioService.ts
│   │   ├── transactionService.ts
│   │   ├── cryptoService.ts
│   │   └── adminService.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts    # JWT & role checks
│   │   └── errorMiddleware.ts   # Error handling
│   ├── validations/
│   │   ├── authValidation.ts    # Zod schemas
│   │   └── portfolioValidation.ts
│   ├── utils/
│   │   ├── jwt.ts              # JWT utilities
│   │   └── errors.ts           # Error classes
│   ├── app.ts                   # Express app setup
│   └── server.ts               # Server entry point
├── prisma/
│   └── schema.prisma           # Database schema
├── .env.example                # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js 16+ 
- PostgreSQL 13+
- npm or yarn

### Step 1: Clone and Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/crypto_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=7d
COINGECKO_API_URL=https://api.coingecko.com/api/v3
CORS_ORIGIN=http://localhost:3000
ADMIN_EMAIL=admin@crypto.local
ADMIN_PASSWORD=admin123456
```

### Step 3: Create Database and Run Migrations

```bash
# Create database
createdb crypto_db

# Run Prisma migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

### Step 4: Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## Available Scripts

```bash
# Development with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Prisma commands
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio GUI
npm run prisma:seed       # Seed database with sample data

# Code quality
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)
- `POST /api/auth/change-password` - Change password (requires auth)

### Portfolio
- `GET /api/portfolio` - Get user portfolio (requires auth)
- `GET /api/portfolio/stats` - Get portfolio statistics (requires auth)
- `POST /api/portfolio/assets` - Add asset (requires auth)
- `PUT /api/portfolio/assets/:assetId` - Update asset (requires auth)
- `DELETE /api/portfolio/assets/:assetId` - Remove asset (requires auth)
- `POST /api/portfolio/update-prices` - Update prices (requires auth)

### Transactions
- `POST /api/transactions` - Create transaction (requires auth)
- `GET /api/transactions` - Get all transactions (requires auth)
- `GET /api/transactions/coin/:coinId` - Get coin transactions (requires auth)
- `GET /api/transactions/stats` - Get stats (requires auth)
- `DELETE /api/transactions/:transactionId` - Delete transaction (requires auth)

### Market Data
- `GET /api/market/top-coins` - Get top coins by market cap
- `GET /api/market/coins` - Get specific coins data
- `GET /api/market/coins/:coinId/price` - Get coin price
- `GET /api/market/coins/:coinId` - Get cached coin data

### Admin (requires admin role)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:userId` - User details
- `GET /api/admin/transactions` - All transactions
- `GET /api/admin/portfolios` - All portfolios
- `GET /api/admin/coins/most-traded` - Most traded coins
- `GET /api/admin/portfolios/top` - Top portfolios
- `GET /api/admin/market/metrics` - Market metrics
- `GET /api/admin/audit-logs` - Audit logs

See `API_EXAMPLES.md` for detailed request/response examples.

## Database Schema

### User Model
- id (unique identifier)
- email (unique)
- password (hashed)
- firstName, lastName
- role (USER | ADMIN)
- timestamps

### Portfolio Model
- id
- userId (linked to User)
- totalValue
- totalInvested
- totalPnL
- pnlPercentage
- timestamps

### PortfolioAsset Model
- id
- portfolioId (linked to Portfolio)
- coinId, coinName, coinSymbol
- quantity, averageBuyPrice, currentPrice
- totalBuyValue, totalCurrentValue
- pnl, pnlPercentage
- timestamps

### Transaction Model
- id
- userId (linked to User)
- coinId, coinName, coinSymbol
- type (BUY | SELL | DEPOSIT | WITHDRAWAL)
- quantity, price, total, fee
- notes
- timestamps

### CryptoData Model
- id
- coinId (cached coin from CoinGecko)
- name, symbol, currentPrice
- marketCap, volume24h, priceChange24h, priceChange7d
- circulatingSupply, maxSupply
- timestamps

### AuditLog Model
- id
- action, resource, userId, details
- timestamps

## Security Features

- **JWT Tokens**: Secure token-based authentication with configurable expiration
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Role-Based Access**: Admin routes protected with role middleware
- **Input Validation**: Zod schemas validate all user inputs
- **SQL Injection Protection**: Prisma parameterized queries prevent injection attacks
- **CORS Setup**: Configurable CORS for frontend security
- **Environment Variables**: Sensitive data stored in .env file
- **Error Handling**: Detailed error messages without exposing sensitive info

## Authentication Flow

1. **Register**: User creates account with email and password
   - Password hashed with bcrypt
   - Portfolio created automatically
   - JWT token returned

2. **Login**: User authenticates with email and password
   - Credentials verified
   - JWT token generated and returned

3. **Protected Routes**: All subsequent requests include token
   - Token verified in authMiddleware
   - User info decoded from token
   - Request proceeds if valid

## Portfolio Calculation

- **Total Value**: Sum of all assets' current value
- **Total Invested**: Sum of all assets' buy value
- **Total P&L**: Total Value - Total Invested
- **P&L %**: (Total P&L / Total Invested) × 100

Each asset tracks:
- Buy price and quantity
- Current market price
- Individual P&L and percentage

## API Response Format

All responses follow consistent structure:

```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": {},
  "errorCode": "ERROR_CODE" (if error),
  "errors": [] (if validation errors)
}
```

## Error Codes

- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `CONFLICT` - Resource already exists
- `INTERNAL_ERROR` - Server error

## Production Deployment

### Environment Setup
1. Set strong JWT_SECRET
2. Configure production DATABASE_URL
3. Update CORS_ORIGIN for frontend domain
4. Set NODE_ENV=production

### Database
```bash
# Run migrations on production database
npm run prisma:migrate

# Verify database connection
npm run prisma:studio
```

### Docker (Optional)
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/server.js"]
```

Build and run:
```bash
docker build -t crypto-api .
docker run -p 5000:5000 --env-file .env crypto-api
```

### Recommended Hosting
- **App**: Render, Railway, Heroku, or AWS EC2
- **Database**: AWS RDS, Render Postgres, Heroku Postgres
- **Monitoring**: Sentry, LogRocket
- **Performance**: CloudFlare CDN

## Performance Considerations

- **Caching**: Crypto prices cached for 5 minutes
- **Pagination**: List endpoints support limit/offset
- **Indexes**: Database indexes on frequently queried fields
- **Lazy Loading**: Portfolio relationships loaded on demand
- **Connection Pooling**: Prisma handles connection optimization

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"SecurePass123"}'

# Use returned token in subsequent requests
curl -X GET http://localhost:5000/api/portfolio \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import all endpoints
2. Set environment variable: `{{baseUrl}}` = http://localhost:5000
3. After login, copy token and set in Auth header
4. Test each endpoint

See `API_EXAMPLES.md` for complete examples.

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

### JWT Token Invalid
- Token may have expired (default 7 days)
- Secret key may have changed
- Request new token by logging in

### CORS Error
- Update CORS_ORIGIN in .env to match frontend URL
- Ensure proper headers sent in request

## Contributing

1. Follow TypeScript strict mode
2. Add Zod schemas for new inputs
3. Add validation middleware for protected routes
4. Test endpoints before committing
5. Update API_EXAMPLES.md for new endpoints

## License

MIT

## Support

For issues, questions, or improvements:
1. Check API_EXAMPLES.md
2. Review README.md
3. Check error messages in API responses
4. Review database schema in prisma/schema.prisma
