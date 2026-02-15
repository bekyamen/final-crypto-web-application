import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';
import { tradeAdminController } from '../controllers/tradeAdminController';

const adminTradeRouter = Router();

// Middleware to check admin role
const adminOnly = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};



/**
 * @route POST /api/admin/trades/balance
 * @desc Adjust user balance
 * @body {userId: string, amount: number, reason: string}
 * @returns {adjustment result}
 */
adminTradeRouter.post(
  '/balance',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.adjustUserBalance(req, res)),
);

/**
 * @route POST /api/admin/trades/password-reset
 * @desc Reset user password
 * @body {userId: string, newPassword: string}
 * @returns {success message}
 */
adminTradeRouter.post(
  '/password-reset',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.resetUserPassword(req, res)),
);

/**
 * @route GET /api/admin/trades/settings
 * @desc Get trading settings
 * @returns {trading settings}
 */
adminTradeRouter.get(
  '/settings',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.getTradingSettings(req, res)),
);

/**
 * @route PUT /api/admin/trades/settings
 * @desc Update trading settings
 * @body {winPercentage?: number, lossPercentage?: number, ...}
 * @returns {updated settings}
 */
adminTradeRouter.put(
  '/settings',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.updateTradingSettings(req, res)),
);

/**
 * @route POST /api/admin/trades/force-execute
 * @desc Force execute a trade with specific outcome
 * @body {tradeId: string, outcome: 'WIN'|'LOSS'|'NEUTRAL'}
 * @returns {execution result}
 */
adminTradeRouter.post(
  '/force-execute',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.forceExecuteTrade(req, res)),
);

/**
 * @route POST /api/admin/trades/cancel
 * @desc Cancel a scheduled trade
 * @body {tradeId: string, reason: string}
 * @returns {cancelled trade}
 */
adminTradeRouter.post(
  '/cancel',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.cancelTrade(req, res)),
);

/**
 * @route GET /api/admin/trades/stats/platform
 * @desc Get platform statistics
 * @returns {platform stats}
 */
adminTradeRouter.get(
  '/stats/platform',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.getPlatformStats(req, res)),
);

/**
 * @route GET /api/admin/trades/stats/user/:userId
 * @desc Get specific user statistics
 * @returns {user stats}
 */
adminTradeRouter.get(
  '/stats/user/:userId',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.getUserStats(req, res)),
);

/**
 * @route GET /api/admin/trades/users
 * @desc Get all users
 * @query {limit?: number, offset?: number}
 * @returns {users array}
 */
adminTradeRouter.get(
  '/users',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.getAllUsers(req, res)),
);

/**
 * @route GET /api/admin/trades/users/:userId
 * @desc Get single user by ID with details
 * @param userId
 * @returns {user object with trades and wallets}
 */
adminTradeRouter.get(
  '/users/:userId',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.getUserById(req, res)),
);



/**
 * @route DELETE /api/admin/trades/users/:userId
 * @desc Delete a user along with all trades and wallets
 * @param userId
 * @returns { success, deletedTrades, message }
 */
adminTradeRouter.delete(
  '/users/:userId',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.deleteUser(req, res)),
);


/**
 * @route GET /api/admin/trades/all
 * @desc Get all trades
 * @query {limit?: number, offset?: number}
 * @returns {trades array}
 */
adminTradeRouter.get(
  '/all',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.getAllTrades(req, res)),
);

/**
 * @route GET /api/admin/trades/audit-logs
 * @desc Get audit logs
 * @query {adminId?: string, limit?: number, offset?: number}
 * @returns {audit logs array}
 */
adminTradeRouter.get(
  '/audit-logs',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res) => tradeAdminController.getAuditLogs(req, res)),
);

export { adminTradeRouter };

