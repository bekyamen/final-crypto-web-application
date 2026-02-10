import express, { Express, Request, Response } from 'express';

import cors from 'cors';
import { config } from './config/environment';
import { errorHandler } from './middlewares/errorMiddleware';
import authRouter from './routes/authRoutes';
import portfolioRouter from './routes/portfolioRoutes';
import transactionRouter from './routes/transactionRoutes';
import adminRouter from './routes/adminRoutes';
import marketRouter from './routes/marketRoutes';
import { tradeRouter } from './routes/tradeRoutes';
import { adminTradeRouter } from './routes/tradeAdminRoutes';
import adminSimRouter from './routes/adminSimRoutes';
import superAdminRouter from './routes/superadminroute';




import tradeSimRouter from './routes/tradeSimRoutes'; 
import contactRouter from './routes/contactRoutes';

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/admin', adminRouter);
app.use('/api/market', marketRouter);
app.use('/api/trades', tradeRouter);
app.use('/api/admin/trades', adminTradeRouter);
app.use('/api/trade-sim', tradeSimRouter);
app.use('/api/admin', adminSimRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/super-admin', superAdminRouter);



// Documentation route
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Crypto Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'POST /api/auth/change-password',
      },
      portfolio: {
        getPortfolio: 'GET /api/portfolio',
        getStats: 'GET /api/portfolio/stats',
        addAsset: 'POST /api/portfolio/assets',
        updateAsset: 'PUT /api/portfolio/assets/:assetId',
        removeAsset: 'DELETE /api/portfolio/assets/:assetId',
        updatePrices: 'POST /api/portfolio/update-prices',
      },
      transactions: {
        create: 'POST /api/transactions',
        getAll: 'GET /api/transactions',
        getByCoin: 'GET /api/transactions/coin/:coinId',
        getStats: 'GET /api/transactions/stats',
        delete: 'DELETE /api/transactions/:transactionId',
      },
      market: {
        topCoins: 'GET /api/market/top-coins',
        coins: 'GET /api/market/coins',
        coinPrice: 'GET /api/market/coins/:coinId/price',
        cachedCoin: 'GET /api/market/coins/:coinId',
      },
      admin: {
        stats: 'GET /api/admin/stats',
        users: 'GET /api/admin/users',
        userDetails: 'GET /api/admin/users/:userId',
        transactions: 'GET /api/admin/transactions',
        portfolios: 'GET /api/admin/portfolios',
        mostTradedCoins: 'GET /api/admin/coins/most-traded',
        topPortfolios: 'GET /api/admin/portfolios/top',
        marketMetrics: 'GET /api/admin/market/metrics',
        auditLogs: 'GET /api/admin/audit-logs',
      },
    },
  });
});

// 404 Route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errorCode: 'NOT_FOUND',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
