import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const adminRouter = Router();

// Apply auth + roleMiddleware to all admin routes
adminRouter.use(authMiddleware, roleMiddleware(["ADMIN", "SUPER_ADMIN"]));

/**
 * @route GET /api/admin/stats
 */
adminRouter.get('/stats', asyncHandler(adminController.getStats));

/**
 * @route GET /api/admin/users
 */
adminRouter.get('/users', asyncHandler(adminController.getUsers));

/**
 * @route GET /api/admin/users/:userId
 */
adminRouter.get('/users/:userId', asyncHandler(adminController.getUserDetails));

/**
 * @route DELETE /api/admin/users/:userId
 */
adminRouter.delete('/users/:userId', asyncHandler(adminController.deleteUser));

/**
 * @route GET /api/admin/transactions
 */
adminRouter.get('/transactions', asyncHandler(adminController.getTransactions));

/**
 * @route GET /api/admin/portfolios
 */
adminRouter.get('/portfolios', asyncHandler(adminController.getPortfolios));

/**
 * @route GET /api/admin/coins/most-traded
 */
adminRouter.get('/coins/most-traded', asyncHandler(adminController.getMostTradedCoins));

/**
 * @route GET /api/admin/portfolios/top
 */
adminRouter.get('/portfolios/top', asyncHandler(adminController.getTopPortfolios));

/**
 * @route GET /api/admin/market/metrics
 */
adminRouter.get('/market/metrics', asyncHandler(adminController.getMarketMetrics));

/**
 * @route GET /api/admin/audit-logs
 */
adminRouter.get('/audit-logs', asyncHandler(adminController.getAuditLogs));

/**
 * @route GET /api/admin/contacts
 */
adminRouter.get('/contacts', asyncHandler(adminController.getContacts));

/**
 * @route POST /api/admin/contacts
 */
adminRouter.post('/contacts', asyncHandler(adminController.addOrUpdateContact));

/**
 * @route DELETE /api/admin/contacts/:id
 */
adminRouter.delete('/contacts/:id', asyncHandler(adminController.deleteContact));

/**
 * @route POST /api/admin/users/:userId/reset-password
 */
adminRouter.post('/users/:userId/reset-password', asyncHandler(adminController.resetAdminPassword));

export default adminRouter;
