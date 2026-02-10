import { Request, Response } from 'express';
import { tradeEngine } from '../services/tradeEngine';
import { TradeRequest } from '../types/trade.types';

class TradeSimController {
  /**
   * POST /api/trades
   * Execute a new trade
   */
  createTrade = (req: Request, res: Response): void => {
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
        res.status(400).json({
          success: false,
          message: 'Invalid trade type. Must be "buy" or "sell"',
        });
        return;
      }

      if (![30, 60, 120, 300].includes(tradeRequest.expirationTime)) {
        res.status(400).json({
          success: false,
          message: 'Invalid expiration time. Must be 30, 60, 120, or 300 seconds',
        });
        return;
      }

      if (tradeRequest.amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Trade amount must be greater than 0',
        });
        return;
      }

      // Execute trade
      const trade = tradeEngine.executeTrade(tradeRequest);

      res.status(200).json({
        success: true,
        message: 'Trade executed successfully',
        data: {
          tradeId: trade.id,
          userId: trade.userId,
          type: trade.type,
          asset: trade.asset,
          amount: trade.amount,
          expirationTime: trade.expirationTime,
          outcome: trade.outcome,
          returnedAmount: trade.returnedAmount,
          profitLossAmount: trade.profitLossAmount,
          profitLossPercent: trade.profitLossPercent,
          timestamp: trade.timestamp,
          completedAt: trade.completedAt,
        },
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
   * Get all trades for a specific user
   */
  getUserTrades = (req: Request, res: Response): void => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'userId parameter is required',
        });
        return;
      }

      const trades = tradeEngine.getUserTrades(userId);

      res.status(200).json({
        success: true,
        message: 'User trades retrieved successfully',
        data: {
          userId,
          totalTrades: trades.length,
          trades: trades.map(t => ({
            tradeId: t.id,
            type: t.type,
            asset: t.asset,
            amount: t.amount,
            expirationTime: t.expirationTime,
            outcome: t.outcome,
            returnedAmount: t.returnedAmount,
            profitLossAmount: t.profitLossAmount,
            profitLossPercent: t.profitLossPercent,
            timestamp: t.timestamp,
            completedAt: t.completedAt,
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
   * Delete user and all related trades
   */
  deleteUser = (req: Request, res: Response): void => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'userId parameter is required',
        });
        return;
      }

      const result = tradeEngine.deleteUser(userId);

      if (result.deletedTrades === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found or no trades to delete',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
  
  /**
   * GET /api/trades
   * Get all trades on the platform
   */
  getAllTrades = (_req: Request, res: Response): void => {
    try {
      const trades = tradeEngine.getAllTrades();

      res.status(200).json({
        success: true,
        message: 'All trades retrieved successfully',
        data: {
          totalTrades: trades.length,
          trades: trades.map(t => ({
            tradeId: t.id,
            userId: t.userId,
            type: t.type,
            asset: t.asset,
            amount: t.amount,
            expirationTime: t.expirationTime,
            outcome: t.outcome,
            returnedAmount: t.returnedAmount,
            profitLossAmount: t.profitLossAmount,
            profitLossPercent: t.profitLossPercent,
            timestamp: t.timestamp,
            completedAt: t.completedAt,
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
   * Get platform statistics
   */
  getStats = (_req: Request, res: Response): void => {
    try {
      const stats = tradeEngine.getStats();

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
