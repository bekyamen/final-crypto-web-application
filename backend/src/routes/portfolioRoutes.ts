import { Router } from 'express';
import { portfolioController } from '../controllers/portfolioController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const portfolioRouter = Router();

// All portfolio routes require authentication
portfolioRouter.use(authMiddleware);

/**
 * @route GET /api/portfolio
 * @desc Get user portfolio with all assets
 * @returns {portfolio with assets}
 */
portfolioRouter.get(
  '/',
  asyncHandler((req, res) => portfolioController.getPortfolio(req, res)),
);

/**
 * @route GET /api/portfolio/stats
 * @desc Get portfolio statistics and allocation
 * @returns {portfolio stats}
 */
portfolioRouter.get(
  '/stats',
  asyncHandler((req, res) => portfolioController.getPortfolioStats(req, res)),
);

/**
 * @route POST /api/portfolio/assets
 * @desc Add a new asset to portfolio
 * @body {coinId: string, quantity: number, averageBuyPrice: number}
 * @returns {created asset}
 */
portfolioRouter.post(
  '/assets',
  asyncHandler((req, res) => portfolioController.addAsset(req, res)),
);

/**
 * @route PUT /api/portfolio/assets/:assetId
 * @desc Update an asset in portfolio
 * @body {quantity?: number, averageBuyPrice?: number}
 * @returns {updated asset}
 */
portfolioRouter.put(
  '/assets/:assetId',
  asyncHandler((req, res) => portfolioController.updateAsset(req, res)),
);

/**
 * @route DELETE /api/portfolio/assets/:assetId
 * @desc Remove an asset from portfolio
 * @returns {message}
 */
portfolioRouter.delete(
  '/assets/:assetId',
  asyncHandler((req, res) => portfolioController.removeAsset(req, res)),
);

/**
 * @route POST /api/portfolio/update-prices
 * @desc Update current prices for all assets
 * @returns {updated portfolio}
 */
portfolioRouter.post(
  '/update-prices',
  asyncHandler((req, res) => portfolioController.updatePrices(req, res)),
);

export default portfolioRouter;
