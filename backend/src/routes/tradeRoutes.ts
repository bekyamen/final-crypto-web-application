import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';

import { asyncHandler } from '../middlewares/asyncHandler';

import { tradeController } from '../controllers/tradeController';

const tradeRouter = Router();

/**
 * @route POST /api/trades/schedule
 * @desc Schedule a new trade
 * @body {type: 'BUY'|'SELL', cryptoSymbol: string, amountUSD: number, scheduledTime: ISO8601}
 * @returns {trade object}
 */
tradeRouter.post(
  '/schedule',
  authMiddleware,
  asyncHandler((req, res) => tradeController.scheduleTrade(req, res)),
);

/**
 * @route GET /api/trades/history
 * @desc Get user's trade history
 * @query {limit?: number, offset?: number}
 * @returns {trades array}
 */
tradeRouter.get(
  '/history',
  authMiddleware,
  asyncHandler((req, res) => tradeController.getTradeHistory(req, res)),
);

/**
 * @route GET /api/trades/stats
 * @desc Get user's trade statistics
 * @returns {trade stats}
 */
tradeRouter.get(
  '/stats',
  authMiddleware,
  asyncHandler((req, res) => tradeController.getTradeStats(req, res)),
);

/**
 * @route GET /api/trades/wallets
 * @desc Get user's crypto wallets
 * @returns {wallets array}
 */
tradeRouter.get(
  '/wallets',
  authMiddleware,
  asyncHandler((req, res) => tradeController.getUserWallets(req, res)),
);

export { tradeRouter };
