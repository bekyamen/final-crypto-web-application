# Complete Backend Development Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Setup Instructions](#setup-instructions)
3. [API Reference](#api-reference)
4. [Database Schema](#database-schema)
5. [Security Implementation](#security-implementation)
6. [Deployment Guide](#deployment-guide)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Clean Architecture Layers

```
Request/Response Layer (Routes)
         ↓
Middleware Layer (Auth, Validation, Error)
         ↓
Controller Layer (Request handling)
         ↓
Service Layer (Business logic)
         ↓
Data Layer (Prisma ORM)
         ↓
Database (PostgreSQL)
```

### Request Flow Example

1. **POST /api/portfolio/assets** → Route handler
2. **authMiddleware** → Verify JWT token
3. **Portfolio Controller** → Parse request
4. **Validation** → Zod schema check
5. **Portfolio Service** → Business logic
6. **Crypto Service** → Fetch market data
7. **Prisma** → Update database
8. **Response** → Return JSON to client

---

## Setup Instructions

### Prerequisites Checklist
- [ ] Node.js 16+ installed: `node --version`
- [ ] PostgreSQL 13+ installed: `psql --version`
- [ ] PostgreSQL running: `pg_isready`
- [ ] npm installed: `npm --version`

### Installation Steps

#### 1. Install Dependencies
```bash
cd backend
npm install
```

**What it does**: Installs all required npm packages listed in package.json

#### 2. Create Database
```bash
createdb crypto_db
```

**Verify**: `psql -l | grep crypto_db`

#### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/crypto_db
JWT_SECRET=your_secret_key_at_least_32_characters_long
```

**Important**: Never commit .env to git

#### 4. Initialize Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

**What it does**:
- `prisma:generate` creates Prisma client
- `prisma:migrate` creates database tables from schema

#### 5. Seed Sample Data (Optional)
```bash
npm run prisma:seed
```

**Creates**:
- 1 admin user
- 3 test users
- Sample portfolios and transactions
- Market data cache

#### 6. Start Development Server
```bash
npm run dev
```

**Output**:
```
[Server] Running in development mode
[Server] Server is running on http://localhost:5000
[Server] API documentation available at http://localhost:5000/api
```

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
```
Authorization: Bearer <JWT_TOKEN>
```

### Response Format
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Authentication Endpoints

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "success": true,
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "portfolio": {...}
  }
}
```

### Portfolio Endpoints

#### Get Portfolio
```
GET /portfolio
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": {
    "id": "portfolio-id",
    "userId": "user-id",
    "totalValue": 50000,
    "totalInvested": 45000,
    "totalPnL": 5000,
    "pnlPercentage": 11.11,
    "assets": [...]
  }
}
```

#### Add Asset
```
POST /portfolio/assets
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "coinId": "bitcoin",
  "quantity": 0.5,
  "averageBuyPrice": 40000
}

Response (201):
{
  "success": true,
  "data": {
    "id": "asset-id",
    "coinId": "bitcoin",
    "coinName": "Bitcoin",
    "quantity": 0.5,
    "totalBuyValue": 20000,
    "currentPrice": 50000,
    "totalCurrentValue": 25000,
    "pnl": 5000
  }
}
```

#### Update Asset
```
PUT /portfolio/assets/asset-id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "quantity": 0.75,
  "averageBuyPrice": 42000
}

Response (200):
{
  "success": true,
  "data": {...}
}
```

#### Remove Asset
```
DELETE /portfolio/assets/asset-id
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "message": "Asset removed successfully"
}
```

### Transaction Endpoints

#### Create Transaction
```
POST /transactions
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "coinId": "bitcoin",
  "type": "BUY",
  "quantity": 0.5,
  "price": 40000,
  "fee": 50,
  "notes": "Market order"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "transaction-id",
    "coinSymbol": "BTC",
    "type": "BUY",
    "quantity": 0.5,
    "price": 40000,
    "total": 20050,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get All Transactions
```
GET /transactions?limit=50&offset=0
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": {
    "transactions": [...],
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

#### Get Transaction Stats
```
GET /transactions/stats
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": {
    "totalTransactions": 25,
    "buyTransactions": 15,
    "sellTransactions": 10,
    "totalSpent": 100000,
    "totalProceeds": 105000,
    "totalFees": 250
  }
}
```

### Market Data Endpoints

#### Get Top Coins
```
GET /market/top-coins?limit=10

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "bitcoin",
      "name": "Bitcoin",
      "symbol": "BTC",
      "current_price": 45000,
      "market_cap": 880000000000,
      "price_change_24h": 2.5
    },
    ...
  ]
}
```

#### Get Coin Price
```
GET /market/coins/bitcoin/price

Response (200):
{
  "success": true,
  "data": {
    "coinId": "bitcoin",
    "price": 45000
  }
}
```

### Admin Endpoints

#### Get Platform Stats
```
GET /admin/stats
Authorization: Bearer ADMIN_TOKEN

Response (200):
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "admins": 2,
      "regularUsers": 148
    },
    "portfolios": {
      "total": 145,
      "totalValue": 5000000,
      "totalInvested": 4500000,
      "totalPnL": 500000
    },
    "transactions": {
      "total": 5000,
      "totalVolume": 10000000,
      "totalFees": 25000
    }
  }
}
```

#### List Users
```
GET /admin/users?limit=50&offset=0
Authorization: Bearer ADMIN_TOKEN

Response (200):
{
  "success": true,
  "data": {
    "users": [...],
    "total": 150
  }
}
```

---

## Database Schema

### User Table
```sql
CREATE TABLE "User" (
  id           String    @id @default(cuid())
  email        String    @unique
  password     String    (hashed)
  firstName    String?
  lastName     String?
  role         UserRole  @default(USER)
  portfolio    Portfolio?
  transactions Transaction[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
)
```

### Portfolio Table
```sql
CREATE TABLE "Portfolio" (
  id            String            @id @default(cuid())
  userId        String            @unique
  user          User
  totalValue    Float             @default(0)
  totalInvested Float             @default(0)
  totalPnL      Float             @default(0)
  pnlPercentage Float             @default(0)
  assets        PortfolioAsset[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
)
```

### PortfolioAsset Table
```sql
CREATE TABLE "PortfolioAsset" (
  id               String    @id @default(cuid())
  portfolioId      String
  portfolio        Portfolio
  coinId           String
  coinName         String
  coinSymbol       String
  quantity         Float
  averageBuyPrice  Float
  currentPrice     Float
  totalBuyValue    Float
  totalCurrentValue Float
  pnl              Float
  pnlPercentage    Float
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
)
```

### Transaction Table
```sql
CREATE TABLE "Transaction" (
  id        String           @id @default(cuid())
  userId    String
  user      User
  coinId    String
  coinName  String
  coinSymbol String
  type      TransactionType
  quantity  Float
  price     Float
  total     Float
  fee       Float            @default(0)
  notes     String?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
)
```

---

## Security Implementation

### 1. Password Hashing
```typescript
// authService.ts
const hashedPassword = await bcrypt.hash(password, 10);
// Uses bcrypt with 10 salt rounds
// Takes ~100ms per hash (intentional slowdown for security)
```

### 2. JWT Token Generation
```typescript
// jwt.ts
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '7d'
});
// Token includes: userId, email, role
// Expires after 7 days
```

### 3. Middleware Chain
```typescript
// Middleware order matters!
app.use(cors());              // 1. CORS
app.use(express.json());      // 2. Parse JSON
app.use(authMiddleware);      // 3. Verify token
app.use(adminMiddleware);     // 4. Check role
// Routes after this are protected
```

### 4. Role-Based Access
```typescript
// authMiddleware.ts
export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};
```

### 5. Input Validation
```typescript
// validations/authValidation.ts
export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must include uppercase')
    .regex(/[0-9]/, 'Must include number'),
});

// Used in routes
const validatedData = registerSchema.parse(req.body);
// Throws ZodError if invalid
```

### 6. SQL Injection Prevention
```typescript
// Prisma handles this automatically
// Never concatenate SQL strings!
// ❌ WRONG: `WHERE email = '${email}'`
// ✅ RIGHT: prisma.user.findUnique({
//    where: { email }
// })
```

### 7. CORS Configuration
```typescript
// app.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 8. Environment Variables
```bash
# .env (never commit!)
JWT_SECRET=long_random_string_min_32_chars
DATABASE_URL=postgresql://...
# Load via process.env in code
```

---

## Deployment Guide

### Production Checklist
- [ ] Change JWT_SECRET to strong random value
- [ ] Update DATABASE_URL to production database
- [ ] Set NODE_ENV=production
- [ ] Update CORS_ORIGIN to frontend domain
- [ ] Update API_BASE_URL to production URL
- [ ] Verify HTTPS configured
- [ ] Setup error logging (Sentry, etc.)
- [ ] Setup monitoring

### Deploy to Render

1. **Push code to GitHub**
```bash
git add .
git commit -m "Initial backend deployment"
git push origin main
```

2. **Create Render PostgreSQL Database**
- Dashboard → Create New → PostgreSQL
- Save connection string

3. **Create Render Web Service**
- Dashboard → Create New → Web Service
- Connect GitHub repo
- Auto-deploy on push

4. **Set Environment Variables**
- Settings → Environment
- Add all variables from .env

5. **Deploy**
```bash
npm run build
npm start
```

### Deploy to AWS EC2

1. **Launch EC2 Instance**
- Ubuntu 22.04 LTS
- Security group: ports 80, 443, 5000

2. **Setup Server**
```bash
sudo apt update
sudo apt install -y nodejs npm postgresql
node --version
```

3. **Clone and Install**
```bash
git clone your-repo
cd backend
npm install
npm run build
```

4. **Setup Database**
```bash
psql -U postgres
CREATE DATABASE crypto_db;
```

5. **Run Migrations**
```bash
npm run prisma:migrate
```

6. **Start Service**
```bash
npm start
```

7. **Setup PM2 (Process Manager)**
```bash
npm install -g pm2
pm2 start dist/server.js --name "crypto-api"
pm2 startup
pm2 save
```

---

## Troubleshooting

### Database Connection Failed
**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions**:
1. Check PostgreSQL running: `pg_isready`
2. Verify DATABASE_URL: `psql $DATABASE_URL`
3. Restart PostgreSQL: `sudo service postgresql restart`

### JWT Token Invalid
**Error**: `Invalid or expired token`

**Solutions**:
1. Ensure token format: `Bearer <token>`
2. Check JWT_SECRET matches (restart server if changed)
3. Get new token by logging in again
4. Check token expiration: default 7 days

### Port 5000 Already In Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
1. Kill process: `lsof -i :5000` then `kill -9 PID`
2. Change PORT in .env and restart

### Prisma Migrations Failed
**Error**: `Error in migration engine`

**Solutions**:
1. Reset database: `npm run prisma:migrate reset`
2. Check schema.prisma syntax
3. Verify database permissions

### CORS Error
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solutions**:
1. Check CORS_ORIGIN matches frontend URL
2. Verify Authorization header sent
3. Check backend is accessible

### Import Errors
**Error**: `Cannot find module`

**Solutions**:
1. Reinstall dependencies: `npm install`
2. Generate Prisma client: `npm run prisma:generate`
3. Check import paths (case-sensitive on Linux)
4. Clear build cache: `rm -rf dist node_modules`

### Rate Limit Errors
**Error**: `429 Too Many Requests` from CoinGecko

**Solutions**:
1. Increase cache duration in cryptoService
2. Get CoinGecko API key
3. Implement request batching
4. Add COINGECKO_API_KEY to .env

---

## Performance Tips

### Database Performance
- Use indexes: Prisma creates them automatically
- Batch queries when possible
- Use pagination: limit 50 items per request
- Monitor slow queries

### API Performance
- Enable caching: Market data cached 5 minutes
- Use CDN for static files
- Implement pagination
- Monitor response times

### Monitoring
```bash
# View Prisma metrics
npm run prisma:studio

# Monitor logs
tail -f logs/error.log

# Check database
psql -U user -d crypto_db -c "SELECT count(*) FROM \"User\";"
```

---

## Next Steps

1. **Setup Frontend**: Connect to these APIs
2. **Add Features**: Extend services as needed
3. **Testing**: Write unit tests for services
4. **Monitoring**: Setup error tracking
5. **Documentation**: Keep docs updated
6. **Deployment**: Deploy to production

---

**Your production-ready backend is ready!** 🚀
