// src/controllers/tradeSimController.ts
import { Request, Response } from 'express';
import { tradeEngine } from '../services/tradeEngine';
import { TradeRequest, ExpirationTime, TradeOutcome } from '../types/trade.types';
import { Trade } from '@prisma/client';
import { NextFunction } from 'express';
/** ====================== HELPERS ====================== */

/** Validate trade request */
function validateTradeRequest(trade: TradeRequest): string | null {
  if (!trade.userId || !trade.type || !trade.asset || !trade.amount) {
    return 'Missing required fields: userId, type, asset, amount';
  }

  if (!['buy', 'sell'].includes(trade.type)) {
    return 'Invalid trade type. Must be "buy" or "sell"';
  }

  const validExpirationTimes: ExpirationTime[] = [30, 60, 90, 120, 180, 360];
  if (!validExpirationTimes.includes(trade.expirationTime)) {
    return `Invalid expiration time. Must be one of: ${validExpirationTimes.join(', ')} seconds`;
  }

  if (trade.amount <= 0) {
    return 'Trade amount must be greater than 0';
  }

  return null;
}

/** Format trade for API response */

function formatTrade(t: Trade) {
  const profitLoss = t.profitLoss ?? 0;

  return {
    tradeId: t.id,
    userId: t.userId,
    type: t.type,
    asset: t.cryptoSymbol,
    amount: t.amountUSD,
    expirationTime: t.expirationTime,
    outcome: t.outcome as TradeOutcome,
    returnedAmount: t.amountUSD + profitLoss,
    profitLossAmount: profitLoss,
    profitLossPercent: t.profitLossPercent ?? 0,
    timestamp: t.createdAt,
    completedAt: t.executedAt,
  };
}

/** Async wrapper for controllers */
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
/** ====================== CONTROLLER ====================== */
class TradeSimController {
  /** POST /api/trades - Execute a trade */
  createTrade = asyncHandler(async (req: Request, res: Response) => {
    const tradeRequest: TradeRequest = req.body;

    const errorMsg = validateTradeRequest(tradeRequest);
    if (errorMsg) {
      return res.status(400).json({ success: false, message: errorMsg });
    }

    const trade = await tradeEngine.executeTrade(tradeRequest);

    return res.status(200).json({
      success: true,
      message: 'Trade executed successfully',
      data: trade,
    });
  });

  /** GET /api/trades/user/:userId - Get trades for a user */
  getUserTrades = asyncHandler(async (req: Request, res: Response) => {
    let { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId parameter is required',
      });
    }

    userId = userId.trim();
    const trades = await tradeEngine.getUserTrades(userId);

    if (trades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No trades found for this user',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User trades retrieved successfully',
      data: {
        userId,
        totalTrades: trades.length,
        trades: trades.map(formatTrade),
      },
    });
  });

  /** GET /api/trades - Get all trades */
  getAllTrades = asyncHandler(async (_req: Request, res: Response) => {
    const trades = await tradeEngine.getAllTrades();

    return res.status(200).json({
      success: true,
      message: 'All trades retrieved successfully',
      data: {
        totalTrades: trades.length,
        trades: trades.map(formatTrade),
      },
    });
  });

  /** GET /api/trades/stats - Platform statistics */
  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await tradeEngine.getStats();

    return res.status(200).json({
      success: true,
      message: 'Platform statistics retrieved successfully',
      data: stats,
    });
  });
}

export const tradeSimController = new TradeSimController();