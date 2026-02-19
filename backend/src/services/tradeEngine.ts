import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import {
  TradeRequest,
  TradeOutcome,
  AdminMode,
  ExpirationTime,
  AdminSettings,
  BetConfig,
} from '../types/trade.types';

const prisma = new PrismaClient();

export class TradeEngine {
  private PERCENTAGE_MAP: Record<number, number> = {
    30: 0.12,
    60: 0.15,
    90: 0.18,
    120: 0.21,
    180: 0.24,
    360: 0.27,
  };

  private adminSettings: AdminSettings = {
    globalMode: 'RANDOM',
    winProbability: 60,
    userOverrides: new Map<string, { userId: string; forceOutcome: 'win' | 'lose' | null; expiresAt?: Date }>(),
  };

  private betConfig: BetConfig = {};

  /** ====================== ADMIN METHODS ====================== */
  setGlobalMode(mode: AdminMode) {
    this.adminSettings.globalMode = mode;
  }

  setWinProbability(percentage: number) {
    this.adminSettings.winProbability = percentage;
  }

  setUserOverride(userId: string, forceOutcome: 'win' | 'lose' | null, expiresAt?: Date) {
    this.adminSettings.userOverrides.set(userId, { userId, forceOutcome, expiresAt });
  }

  updateBetConfig(expirationTime: ExpirationTime, profitPercent: number, lossPercent: number) {
    this.betConfig[expirationTime] = { profitPercent, lossPercent };
  }

  getAdminSettings(): AdminSettings {
    return this.adminSettings;
  }

  getStats() {
    return {
      totalTrades: 0, // Implement if needed
      totalVolume: 0, // Implement if needed
    };
  }

  reset() {
    this.adminSettings = {
      globalMode: 'RANDOM',
      winProbability: 60,
      userOverrides: new Map(),
    };
    this.betConfig = {};
  }

  /** ====================== TRADE LOGIC ====================== */
  async calculateOutcome(userId: string): Promise<TradeOutcome> {
    const override = this.adminSettings.userOverrides.get(userId);
    if (override?.forceOutcome) {
      if (override.expiresAt && new Date() > override.expiresAt) {
        this.adminSettings.userOverrides.delete(userId);
      } else {
        // return 'WIN' or 'LOSS' because TradeOutcome is uppercase
        return override.forceOutcome === 'win' ? 'WIN' : 'LOSS';
      }
    }

    if (this.adminSettings.globalMode === 'RANDOM') {
      const randomValue = Math.random() * 100;
      return randomValue <= this.adminSettings.winProbability ? 'WIN' : 'LOSS';
    }

    // Map adminMode to TradeOutcome
    return this.adminSettings.globalMode === 'WIN' ? 'WIN' : 'LOSS';
  }

 
  calculateReturnedAmount(amount: number, expirationTime: number, outcome: TradeOutcome) {
  const percent = this.PERCENTAGE_MAP[expirationTime];
  if (percent === undefined) throw new Error('Invalid expiration time');

  // Calculate profit/loss precisely
  let profitLossAmount = amount * percent;

  // Round to 2 decimals to avoid floating point errors
  profitLossAmount = Math.round(profitLossAmount * 100) / 100;

  const returnedAmount = profitLossAmount; // only profit/loss, not principal
  const profitLossPercent = outcome === 'WIN' ? percent * 100 : -percent * 100;

  return {
    returnedAmount,
    profitLossAmount,
    profitLossPercent,
  };
}



 async scheduleTrade(tradeRequest: TradeRequest) {
  const assetSymbol =
    typeof tradeRequest.asset === 'string'
      ? tradeRequest.asset
      : tradeRequest.asset.symbol;

  const scheduledTime = new Date(
    Date.now() + tradeRequest.expirationTime * 1000
  );

  const balanceField = tradeRequest.isDemo
    ? 'demoBalance'
    : 'balance';

  // Deduct stake immediately
  await prisma.user.update({
    where: { id: tradeRequest.userId },
    data: {
      [balanceField]: {
        decrement: tradeRequest.amount,
      },
    },
  });

  const trade = await prisma.trade.create({
    data: {
      id: uuidv4(),
      userId: tradeRequest.userId,
      type: tradeRequest.type.toUpperCase() as 'BUY' | 'SELL',
      cryptoSymbol: assetSymbol,
      amountUSD: tradeRequest.amount,
      expirationTime: tradeRequest.expirationTime,
      scheduledTime,
      status: 'SCHEDULED',
    },
  });

  return trade;
}

async executeExpiredTrades() {
  const expiredTrades = await prisma.trade.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledTime: { lte: new Date() },
    },
  });

  for (const trade of expiredTrades) {
  if (trade.expirationTime == null) {
    console.error(`Trade ${trade.id} has null expirationTime`);
    continue;
  }

  const outcome = await this.calculateOutcome(trade.userId);

  const { profitLossAmount, profitLossPercent } =
    this.calculateReturnedAmount(
      trade.amountUSD,
      trade.expirationTime, // now guaranteed number
      outcome
    );


    const balanceField = trade.isDemo
      ? 'demoBalance'
      : 'balance';

    await prisma.$transaction(async (tx) => {
      if (outcome === 'WIN') {
        await tx.user.update({
          where: { id: trade.userId },
          data: {
            [balanceField]: {
              increment: trade.amountUSD + profitLossAmount,
            },
          },
        });
      }

      await tx.trade.update({
        where: { id: trade.id },
        data: {
          outcome,
          profitLoss: profitLossAmount,
          profitLossPercent,
          executedAt: new Date(),
          status: 'EXECUTED',
        },
      });
    });
  }
}





  /** ====================== USER TRADES ====================== */
  getUserTrades(userId: string) {
    return prisma.trade.findMany({ where: { userId }, orderBy: { executedAt: 'desc' } });
  }

  getAllTrades() {
    return prisma.trade.findMany({ orderBy: { executedAt: 'desc' } });
  }
}

export const tradeEngine = new TradeEngine();