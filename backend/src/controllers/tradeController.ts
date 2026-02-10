import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { tradingService } from '../services/tradingService';
import { createSuccessResponse, ValidationError } from '../utils/errors';
import { TradeType } from '@prisma/client';

class TradeController {
  async scheduleTrade(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { type, cryptoSymbol, amountUSD, scheduledTime } = req.body;

    if (!type || !cryptoSymbol || !amountUSD || !scheduledTime) {
      throw new ValidationError('Missing required fields');
    }

    if (!Object.values(TradeType).includes(type)) {
      throw new ValidationError('Invalid trade type');
    }

    const trade = await tradingService.scheduleTrade({
      userId,
      type,
      cryptoSymbol,
      amountUSD,
      scheduledTime: new Date(scheduledTime),
    });

    res.status(201).json(
      createSuccessResponse(trade, 'Trade scheduled successfully'),
    );
  }

  async getTradeHistory(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { limit = 50, offset = 0 } = req.query;

    const trades = await tradingService.getTradeHistory(
      userId,
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.status(200).json(
      createSuccessResponse(trades, 'Trade history retrieved'),
    );
  }

  async getTradeStats(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const stats = await tradingService.getTradeStats(userId);

    res.status(200).json(
      createSuccessResponse(stats, 'Trade stats retrieved'),
    );
  }

  async getUserWallets(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const wallets = await tradingService.getUserWallets(userId);

    res.status(200).json(
      createSuccessResponse(wallets, 'User wallets retrieved'),
    );
  }
}

export const tradeController = new TradeController();
