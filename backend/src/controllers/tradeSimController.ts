import { Request, Response } from 'express';
import { tradeEngine } from '../services/tradeEngine';
import { TradeRequest,ExpirationTime } from '../types/trade.types';

class TradeSimController {
  /**
   * POST /api/trades
   * Execute a new trade
   */
  // src/controllers/tradeSimController.ts
createTrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const tradeRequest: TradeRequest = req.body;

    // Validation
    if (!tradeRequest.userId || !tradeRequest.type || !tradeRequest.asset || !tradeRequest.amount) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, type, asset, amount',
      });
      return;
    }

    if (!['buy', 'sell'].includes(tradeRequest.type)) {
      res.status(400).json({ success: false, message: 'Invalid trade type. Must be "buy" or "sell"' });
      return;
    }

    // Accept all valid expiration times from TradeEngine
const validExpirationTimes: ExpirationTime[] = [30, 60, 90, 120, 180, 360];

if (!validExpirationTimes.includes(tradeRequest.expirationTime)) {
  res.status(400).json({
    success: false,
    message: `Invalid expiration time. Must be one of: ${validExpirationTimes.join(', ')} seconds`,
  });
  return;
}


    if (tradeRequest.amount <= 0) {
      res.status(400).json({ success: false, message: 'Trade amount must be greater than 0' });
      return;
    }

    // Execute trade
    const trade = await tradeEngine.executeExpiredTrades();

    res.status(200).json({
      success: true,
      message: 'Trade executed successfully',
      data: trade,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error executing trade',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


  /**
   * GET /api/trades/user/:userId
   */
  getUserTrades = async (req: Request, res: Response): Promise<void> => {
  try {
    let { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'userId parameter is required',
      });
      return;
    }

    // Trim any whitespace/newlines from the userId
    userId = userId.trim();

    const trades = await tradeEngine.getUserTrades(userId);

    res.status(200).json({
      success: true,
      message: 'User trades retrieved successfully',
      data: {
        userId,
        totalTrades: trades.length,
        trades: trades.map((t: any) => ({
          tradeId: t.id,
          type: t.type,
          asset: t.cryptoSymbol,
          amount: t.amountUSD,
          expirationTime: t.expirationTime,
          outcome: t.outcome,
          returnedAmount: (t.amountUSD || 0) + (t.profitLoss || 0),
          profitLossAmount: t.profitLoss,
          profitLossPercent: t.profitLossPercent,
          timestamp: t.createdAt,
          completedAt: t.executedAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user trades',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


  /**
   * DELETE /api/trade-sim/user/:userId
   */
  // deleteUser = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { userId } = req.params;

  //     if (!userId) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'userId parameter is required',
  //       });
  //       return;
  //     }

  //     const result = await tradeEngine.deleteUser(userId);

  //     if (result.deletedTrades === 0) {
  //       res.status(404).json({
  //         success: false,
  //         message: 'User not found or no trades to delete',
  //       });
  //       return;
  //     }

  //     res.status(200).json({
  //       success: true,
  //       message: 'User deleted successfully',
  //       data: result,
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: 'Error deleting user',
  //       error: error instanceof Error ? error.message : 'Unknown error',
  //     });
  //   }
  // };

  /**
   * GET /api/trades
   */
  getAllTrades = async (_req: Request, res: Response): Promise<void> => {
    try {
      const trades = await tradeEngine.getAllTrades();

      res.status(200).json({
        success: true,
        message: 'All trades retrieved successfully',
        data: {
          totalTrades: trades.length,
          trades: trades.map((t: any) => ({
            tradeId: t.id,
            userId: t.userId,
            type: t.type,
            asset: t.cryptoSymbol,
            amount: t.amountUSD,
            outcome: t.outcome,
            returnedAmount:
              (t.amountUSD || 0) + (t.profitLoss || 0),
            profitLossAmount: t.profitLoss,
            profitLossPercent: t.profitLossPercent,
            timestamp: t.createdAt,
            completedAt: t.executedAt,
          })),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving trades',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * GET /api/trades/stats
   */
  getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await tradeEngine.getStats();

      res.status(200).json({
        success: true,
        message: 'Platform statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

export const tradeSimController = new TradeSimController();