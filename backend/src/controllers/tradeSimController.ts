// src/controllers/tradeSimController.ts
import { Request, Response, NextFunction } from 'express'
import { tradeEngine } from '../services/tradeEngine'
import { TradeRequest, ExpirationTime, TradeOutcome } from '../types/trade.types'
import { Trade } from '@prisma/client'

/** ====================== HELPERS ====================== */

function validateTradeRequest(trade: TradeRequest): string | null {
  if (!trade.userId || !trade.type || !trade.asset || !trade.amount) {
    return 'Missing required fields: userId, type, asset, amount'
  }

  if (!['buy', 'sell'].includes(trade.type)) {
    return 'Invalid trade type. Must be "buy" or "sell"'
  }

  const validExpirationTimes: ExpirationTime[] = [30, 60, 90, 120, 180, 360]

  if (!validExpirationTimes.includes(trade.expirationTime)) {
    return `Invalid expiration time. Must be one of: ${validExpirationTimes.join(', ')} seconds`
  }

  if (trade.amount <= 0) {
    return 'Trade amount must be greater than 0'
  }

  return null
}

/** Format trade for API response */
function formatTrade(t: Trade) {
  const profitLoss = t.profitLoss ?? 0

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
    isDemo: t.isDemo
  }
}

/** Async wrapper */
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/** ====================== CONTROLLER ====================== */

class TradeSimController {

  /** POST /api/trade-sim */
  createTrade = asyncHandler(async (req: Request, res: Response) => {
    const tradeRequest: TradeRequest = req.body

    const errorMsg = validateTradeRequest(tradeRequest)
    if (errorMsg) {
      return res.status(400).json({ success: false, message: errorMsg })
    }

    const isDemo = Boolean(req.body.isDemo)

    const trade = await tradeEngine.executeTrade({
      ...tradeRequest,
      isDemo
    })

    return res.status(200).json({
      success: true,
      message: 'Trade executed successfully',
      data: trade
    })
  })

  /** GET /api/trade-sim/user/:userId - Only demo trades by default */
  
  /** GET /api/trade-sim/user/:userId */
getUserTrades = asyncHandler(async (req: Request, res: Response) => {
  let { userId } = req.params;
  const tradeType = String(req.query.tradeType || 'demo').toLowerCase();

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'userId parameter is required',
    });
  }

  userId = userId.trim();

  // Convert tradeType to boolean
  const isDemo = tradeType === 'demo';

  // Fetch trades filtered by userId and isDemo
  const trades = await tradeEngine.getUserTrades(userId, isDemo);

  return res.status(200).json({
    success: true,
    message: `User ${tradeType} trades retrieved successfully`,
    data: {
      userId,
      totalTrades: trades.length,
      trades: trades.map(formatTrade),
    },
  });
});

  /** GET /api/trade-sim */
  getAllTrades = asyncHandler(async (_req: Request, res: Response) => {
    const trades = await tradeEngine.getAllTrades() // no arguments needed

    return res.status(200).json({
      success: true,
      message: 'All trades retrieved successfully',
      data: {
        totalTrades: trades.length,
        trades: trades.map(formatTrade)
      }
    })
  })

  /** GET /api/trade-sim/stats */
  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await tradeEngine.getStats() // no arguments needed

    return res.status(200).json({
      success: true,
      message: 'Platform statistics retrieved successfully',
      data: stats
    })
  })
}

export const tradeSimController = new TradeSimController()