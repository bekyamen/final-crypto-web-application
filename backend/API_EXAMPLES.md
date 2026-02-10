# Crypto Backend API - Request Examples

## Authentication Endpoints

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "phoneNumber": "+1(555)123-4567",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "fundsPassword": "FundsPass456!"
  }'
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user-id-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1(555)123-4567",
      "role": "USER",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Get User Profile
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phoneNumber": "+1(555)987-6543"
  }'
```

### Change Login Password
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!",
    "confirmNewPassword": "NewSecurePass456!"
  }'
```

### Change Funds Password
```bash
curl -X POST http://localhost:5000/api/auth/change-funds-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentFundsPassword": "FundsPass456!",
    "newFundsPassword": "NewFundsPass789!",
    "confirmFundsPassword": "NewFundsPass789!"
  }'
```

### Verify Funds Password
Used before performing transactions to confirm user identity
```bash
curl -X POST http://localhost:5000/api/auth/verify-funds-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fundsPassword": "FundsPass456!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Funds password verified",
  "data": {
    "isValid": true
  }
}
```

---

## Market Data Endpoints

### Get Top Coins
```bash
curl -X GET "http://localhost:5000/api/market/top-coins?limit=10"
```

### Get Specific Coin Data
```bash
curl -X GET "http://localhost:5000/api/market/coins?coinIds=bitcoin,ethereum,cardano"
```

### Get Coin Price
```bash
curl -X GET http://localhost:5000/api/market/coins/bitcoin/price
```

### Get Cached Coin Data
```bash
curl -X GET http://localhost:5000/api/market/coins/bitcoin
```

---

## Portfolio Endpoints

### Get User Portfolio
```bash
curl -X GET http://localhost:5000/api/portfolio \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Portfolio retrieved successfully",
  "data": {
    "id": "portfolio-id",
    "userId": "user-id-123",
    "totalValue": 50000,
    "totalInvested": 45000,
    "totalPnL": 5000,
    "pnlPercentage": 11.11,
    "assets": [
      {
        "id": "asset-id",
        "portfolioId": "portfolio-id",
        "coinId": "bitcoin",
        "coinName": "Bitcoin",
        "coinSymbol": "BTC",
        "quantity": 0.5,
        "averageBuyPrice": 40000,
        "currentPrice": 50000,
        "totalBuyValue": 20000,
        "totalCurrentValue": 25000,
        "pnl": 5000,
        "pnlPercentage": 25
      }
    ]
  }
}
```

### Get Portfolio Statistics
```bash
curl -X GET http://localhost:5000/api/portfolio/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Add Asset to Portfolio
```bash
curl -X POST http://localhost:5000/api/portfolio/assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "bitcoin",
    "quantity": 0.5,
    "averageBuyPrice": 40000
  }'
```

### Update Portfolio Asset
```bash
curl -X PUT http://localhost:5000/api/portfolio/assets/asset-id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 0.75,
    "averageBuyPrice": 42000
  }'
```

### Remove Asset from Portfolio
```bash
curl -X DELETE http://localhost:5000/api/portfolio/assets/asset-id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update All Asset Prices
```bash
curl -X POST http://localhost:5000/api/portfolio/update-prices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Transaction Endpoints

### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "bitcoin",
    "type": "BUY",
    "quantity": 0.5,
    "price": 40000,
    "fee": 50,
    "notes": "Bought at market price"
  }'
```

### Get All Transactions
```bash
curl -X GET "http://localhost:5000/api/transactions?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Transactions for Specific Coin
```bash
curl -X GET http://localhost:5000/api/transactions/coin/bitcoin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Transaction Statistics
```bash
curl -X GET http://localhost:5000/api/transactions/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Transaction
```bash
curl -X DELETE http://localhost:5000/api/transactions/transaction-id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Admin Endpoints (Requires Admin Role)

### Get Platform Statistics
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Admin statistics retrieved successfully",
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
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Get All Users
```bash
curl -X GET "http://localhost:5000/api/admin/users?limit=50&offset=0" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get User Details
```bash
curl -X GET http://localhost:5000/api/admin/users/user-id-123 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get All Transactions
```bash
curl -X GET "http://localhost:5000/api/admin/transactions?limit=50&offset=0" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get All Portfolios
```bash
curl -X GET "http://localhost:5000/api/admin/portfolios?limit=50&offset=0" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get Most Traded Coins
```bash
curl -X GET http://localhost:5000/api/admin/coins/most-traded \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get Top Portfolios
```bash
curl -X GET http://localhost:5000/api/admin/portfolios/top \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get Market Metrics
```bash
curl -X GET http://localhost:5000/api/admin/market/metrics \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get Audit Logs
```bash
curl -X GET "http://localhost:5000/api/admin/audit-logs?limit=50&offset=0" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errorCode": "ERROR_CODE",
  "statusCode": 400
}
```

### Example Error Response
```json
{
  "success": false,
  "message": "Invalid credentials",
  "errorCode": "UNAUTHORIZED",
  "statusCode": 401
}
```

---

## Testing with Postman

1. Register a new user and save the JWT token
2. Use the token in the Authorization header for subsequent requests
3. Set header: `Authorization: Bearer <token>`
4. Test all endpoints with provided examples above
