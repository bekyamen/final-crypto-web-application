# Quick Start Guide - Crypto Backend API

Get the backend API running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- PostgreSQL 13+ installed and running
- npm installed

## Step 1: Install Dependencies (1 min)

```bash
cd backend
npm install
```

## Step 2: Setup Database (1 min)

Create PostgreSQL database:

```bash
createdb crypto_db
```

## Step 3: Configure Environment (1 min)

```bash
cp .env.example .env
```

Edit `.env` and update:
```
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/crypto_db
JWT_SECRET=your_super_secret_key_here_change_in_production
```

## Step 4: Initialize Database (1 min)

```bash
npm run prisma:migrate
npm run prisma:generate
```

## Step 5: Start Server (1 min)

```bash
npm run dev
```

Server runs on: `http://localhost:5000`

Health check: `http://localhost:5000/health`

---

## First API Test

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

You'll get a response with a JWT token. Copy it for next steps.

### 2. Use Token to Get Profile

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Add Cryptocurrency to Portfolio

```bash
curl -X POST http://localhost:5000/api/portfolio/assets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "bitcoin",
    "quantity": 0.5,
    "averageBuyPrice": 40000
  }'
```

### 4. Get Portfolio

```bash
curl -X GET http://localhost:5000/api/portfolio \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Create Transaction

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "ethereum",
    "type": "BUY",
    "quantity": 2.5,
    "price": 2500,
    "fee": 25,
    "notes": "Bought ETH"
  }'
```

### 6. Get Market Data

```bash
curl -X GET "http://localhost:5000/api/market/top-coins?limit=10"
```

---

## Sample Credentials (If Using Seed Data)

First, seed the database with sample data:

```bash
npm run prisma:seed
```

Then use these credentials:

**Admin:**
- Email: `admin@crypto.local`
- Password: `admin123456`

**Test Users:**
- Email: `user1@example.com` | Password: `TestPass123`
- Email: `user2@example.com` | Password: `TestPass123`
- Email: `user3@example.com` | Password: `TestPass123`

---

## Admin Endpoints

After logging in as admin, try:

```bash
# Get platform stats
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get all users
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get market metrics
curl -X GET http://localhost:5000/api/admin/market/metrics \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Available Scripts

```bash
npm run dev                    # Start development server
npm run build                  # Build TypeScript
npm start                      # Start production server
npm run prisma:migrate         # Run database migrations
npm run prisma:studio          # Open Prisma Studio (GUI)
npm run prisma:seed            # Seed database with sample data
npm run lint                   # Run linter
npm run format                 # Format code
```

---

## API Documentation

- Full endpoint list: `http://localhost:5000/api`
- Detailed examples: See `API_EXAMPLES.md`
- Complete docs: See `README.md`

---

## Database Management

### View Data in GUI

```bash
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555`

### Reset Database

```bash
# Delete and recreate database
npm run prisma:migrate reset

# Seed with sample data
npm run prisma:seed
```

---

## Troubleshooting

### "Database connection refused"
- Check PostgreSQL is running: `psql -U postgres -l`
- Verify DATABASE_URL in .env
- Ensure database exists: `createdb crypto_db`

### "JWT token invalid"
- Token may have expired (default 7 days)
- Login again to get new token
- Update JWT_EXPIRATION in .env if needed

### "Port 5000 already in use"
- Change PORT in .env
- Or kill existing process: `lsof -i :5000` then `kill -9 PID`

### "Migration failed"
- Reset database: `npm run prisma:migrate reset`
- Check database connection in .env

---

## Next Steps

1. Connect frontend to API using JWT token from login
2. Read `API_EXAMPLES.md` for all endpoint examples
3. Review `README.md` for architecture details
4. Customize business logic in `src/services/`
5. Add more validation schemas in `src/validations/`

---

## Production Deployment

Before deploying:

1. Set strong JWT_SECRET
2. Update CORS_ORIGIN for frontend domain
3. Use production database URL
4. Set NODE_ENV=production
5. Review security settings in `src/app.ts`

Deploy to Render, Railway, or AWS:

```bash
npm run build
npm start
```

---

## Support

- API Documentation: `http://localhost:5000/api`
- Request Examples: `API_EXAMPLES.md`
- Full Documentation: `README.md`
- Database Schema: `prisma/schema.prisma`

Enjoy your production-ready crypto API!
