import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler'; // <- generic asyncHandler

const adminRouter = Router();

// Apply auth + admin middleware to all admin routes
adminRouter.use(authMiddleware, adminMiddleware);

/**
 * @route GET /api/admin/stats
 * @desc Get overall admin statistics
 */
adminRouter.get('/stats', asyncHandler(adminController.getStats));

/**
 * @route GET /api/admin/users
 * @desc Get all users with pagination
 */
adminRouter.get('/users', asyncHandler(adminController.getUsers));

/**
 * @route GET /api/admin/users/:userId
 * @desc Get details of a specific user
 */
adminRouter.get('/users/:userId', asyncHandler(adminController.getUserDetails));

/**
 * @route DELETE /api/admin/users/:userId
 * @desc Delete a user
 */
adminRouter.delete('/users/:userId', asyncHandler(adminController.deleteUser));

/**
 * @route GET /api/admin/transactions
 * @desc Get all platform transactions
 */
adminRouter.get('/transactions', asyncHandler(adminController.getTransactions));

/**
 * @route GET /api/admin/portfolios
 * @desc Get all portfolios
 */
adminRouter.get('/portfolios', asyncHandler(adminController.getPortfolios));

/**
 * @route GET /api/admin/coins/most-traded
 * @desc Get most traded coins
 */
adminRouter.get('/coins/most-traded', asyncHandler(adminController.getMostTradedCoins));

/**
 * @route GET /api/admin/portfolios/top
 * @desc Get top portfolios by value
 */
adminRouter.get('/portfolios/top', asyncHandler(adminController.getTopPortfolios));

/**
 * @route GET /api/admin/market/metrics
 * @desc Get market metrics
 */
adminRouter.get('/market/metrics', asyncHandler(adminController.getMarketMetrics));

/**
 * @route GET /api/admin/audit-logs
 * @desc Get audit logs with pagination
 */
adminRouter.get('/audit-logs', asyncHandler(adminController.getAuditLogs));

/**
 * @route GET /api/admin/contacts
 * @desc Get all platform contacts
 */
adminRouter.get('/contacts', asyncHandler(adminController.getContacts));

/**
 * @route POST /api/admin/contacts
 * @desc Add or update a contact
 */
adminRouter.post('/contacts', asyncHandler(adminController.addOrUpdateContact));

/**
 * @route DELETE /api/admin/contacts/:id
 * @desc Delete a contact
 */
adminRouter.delete('/contacts/:id', asyncHandler(adminController.deleteContact));

/**
 * @route POST /api/admin/users/:userId/reset-password
 * @desc Reset an admin user's password
 */
adminRouter.post('/users/:userId/reset-password', asyncHandler(adminController.resetAdminPassword));

export default adminRouter;
