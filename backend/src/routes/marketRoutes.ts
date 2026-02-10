import { Router } from 'express';
import { marketController } from '../controllers/marketController';
import { asyncHandler } from '../middlewares/errorMiddleware';

const marketRouter = Router();

/**
 * @route GET /api/market/top-coins
 * @desc Get top cryptocurrencies by market cap
 * @query {limit?: number}
 * @returns {top coins array}
 */
marketRouter.get(
  '/top-coins',
  asyncHandler((req, res) => marketController.getTopCoins(req, res)),
);

/**
 * @route GET /api/market/coins
 * @desc Get data for specific coins
 * @query {coinIds: string} comma-separated coin IDs
 * @returns {coins array}
 */
marketRouter.get(
  '/coins',
  asyncHandler((req, res) => marketController.getCoinData(req, res)),
);

/**
 * @route GET /api/market/coins/:coinId/price
 * @desc Get current price of a coin
 * @returns {coin price}
 */
marketRouter.get(
  '/coins/:coinId/price',
  asyncHandler((req, res) => marketController.getCoinPrice(req, res)),
);

/**
 * @route GET /api/market/coins/:coinId
 * @desc Get cached coin data
 * @returns {coin data}
 */
marketRouter.get(
  '/coins/:coinId',
  asyncHandler((req, res) => marketController.getCachedCoin(req, res)),
);

export default marketRouter;
