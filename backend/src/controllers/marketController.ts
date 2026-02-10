import { Response, Request } from 'express';
import { cryptoService } from '../services/cryptoService';
import { createSuccessResponse } from '../utils/errors';

export class MarketController {
  async getTopCoins(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const coins = await cryptoService.fetchTopCoins(Math.min(limit, 250));

    res.status(200).json(
      createSuccessResponse(coins, 'Top coins retrieved successfully'),
    );
  }

  async getCoinData(req: Request, res: Response): Promise<void> {
    const { coinIds } = req.query;

    if (!coinIds) {
      res.status(400).json({
        success: false,
        message: 'coinIds query parameter is required',
        errorCode: 'VALIDATION_ERROR',
      });
      return;
    }

    const ids = (coinIds as string).split(',').map((id) => id.trim());
    const coins = await cryptoService.fetchCoinData(ids);

    res.status(200).json(
      createSuccessResponse(coins, 'Coin data retrieved successfully'),
    );
  }

  async getCoinPrice(req: Request, res: Response): Promise<void> {
    const { coinId } = req.params;

    if (!coinId) {
      res.status(400).json({
        success: false,
        message: 'Coin ID is required',
        errorCode: 'VALIDATION_ERROR',
      });
      return;
    }

    const price = await cryptoService.fetchCoinPrice(coinId);

    res.status(200).json(
      createSuccessResponse({ coinId, price }, 'Coin price retrieved successfully'),
    );
  }

  async getCachedCoin(req: Request, res: Response): Promise<void> {
    const { coinId } = req.params;

    if (!coinId) {
      res.status(400).json({
        success: false,
        message: 'Coin ID is required',
        errorCode: 'VALIDATION_ERROR',
      });
      return;
    }

    const coinData = await cryptoService.getCachedOrFetchCoin(coinId);

    res.status(200).json(
      createSuccessResponse(coinData, 'Coin data retrieved successfully'),
    );
  }
}

export const marketController = new MarketController();
