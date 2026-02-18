import { Router } from 'express';
import { tradeSimController } from '../controllers/tradeSimController';

export const tradeSimRouter = Router();

/**
 * @route POST /api/trades
 * @desc Execute a new trade (buy/sell)
 * @body { userId, type, asset, amount, expirationTime }
 * @returns Trade result with outcome and returned amount
 */

tradeSimRouter.post('/', tradeSimController.createTrade);

/**
 * @route GET /api/trades/user/:userId
 * @desc Get all trades for a specific user
 * @param userId
 * @returns Array of user's trades
 */

tradeSimRouter.get('/user/:userId', tradeSimController.getUserTrades);


/**
 * @route DELETE /api/trade-sim/user/:userId
 * @desc Delete user and all trades
 */

// tradeSimRouter.delete('/user/:userId', tradeSimController.deleteUser);


/**
 * @route GET /api/trades
 * @desc Get all trades on the platform
 * @returns Array of all trades
 */

tradeSimRouter.get('/', tradeSimController.getAllTrades);

/**
 * @route GET /api/trades/stats
 * @desc Get platform statistics
 * @returns Platform stats (total trades, win rate, volume, etc.)
 */

// tradeSimRouter.get('/stats', tradeSimController.getStats);

export default tradeSimRouter;
