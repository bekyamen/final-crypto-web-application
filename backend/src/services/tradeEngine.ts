 import { PrismaClient, TradeOutcome as PrismaTradeOutcome } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import {
  TradeRequest,
  TradeOutcome,
  AdminMode,
  ExpirationTime,
  TradeResponse,
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

   async setUserOverride(userId: string, forceOutcome: 'win' | 'lose' | null, expiresAt?: Date) {
    if (forceOutcome === null) {
      // remove override
      await prisma.userOverride.deleteMany({ where: { userId } });
    } else {
      await prisma.userOverride.upsert({
        where: { userId },
        update: { forceOutcome: forceOutcome.toUpperCase(), expiresAt: expiresAt ?? null },
        create: { userId, forceOutcome: forceOutcome.toUpperCase(), expiresAt: expiresAt ?? null },
      });
    }
  }


  /** Returns the active mode for a given user */
getUserMode(userId: string): 'win' | 'lose' | 'random' {
  const override = this.adminSettings.userOverrides.get(userId);

  // If override exists and not expired
  if (override?.forceOutcome) {
    if (!override.expiresAt || new Date() <= new Date(override.expiresAt)) {
      return override.forceOutcome;
    } else {
      // Clean up expired override
      this.adminSettings.userOverrides.delete(userId);
    }
  }

  // Return normalized global mode
  const globalMode = this.adminSettings.globalMode.toLowerCase();
  return ['win', 'lose'].includes(globalMode) ? (globalMode as 'win' | 'lose') : 'random';
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



 async executeTrade(tradeRequest: TradeRequest): Promise<TradeResponse> {
  // Step 1: Determine the trade outcome (WIN or LOSS) based on admin settings and randomization
  const outcome = await this.calculateOutcome(tradeRequest.userId);

  // Step 2: Calculate profit/loss based on expiration time and trade amount
  const { returnedAmount, profitLossAmount, profitLossPercent } = this.calculateReturnedAmount(
    tradeRequest.amount,
    tradeRequest.expirationTime,
    outcome
  );

  // Step 3: Normalize asset symbol
  const getAssetSymbol = (asset: string | { symbol: string }): string => {
    return typeof asset === 'string' ? asset : asset.symbol;
  };
  const assetSymbol = getAssetSymbol(tradeRequest.asset);

  // Step 4: Record trade in database
  const trade = await prisma.trade.create({
    data: {
      id: uuidv4(),
      userId: tradeRequest.userId,
      type: tradeRequest.type.toUpperCase() as 'BUY' | 'SELL',
      cryptoSymbol: assetSymbol,
      amountUSD: tradeRequest.amount,
      scheduledTime: new Date(Date.now() + tradeRequest.expirationTime * 1000),
      executedAt: new Date(),
      outcome: outcome as PrismaTradeOutcome,
      profitLoss: profitLossAmount,
      profitLossPercent,
      notes: `Asset: ${assetSymbol}`,
    },
  });

  // Step 5: Update user balance correctly using a transaction
  // Step 5: Update correct balance (demo OR real) using transaction
const updatedUser = await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({
    where: { id: tradeRequest.userId },
  });

  if (!user) throw new Error('User not found');

  const netChange = outcome === 'WIN'
    ? profitLossAmount
    : -profitLossAmount;

  // Determine which balance to update
  const balanceField = tradeRequest.isDemo ? 'demoBalance' : 'balance';

  const finalUser = await tx.user.update({
    where: { id: user.id },
    data: {
      [balanceField]: {
        increment: netChange,
      },
    },
  });

  return finalUser;
});



  // Step 6: Return full trade response including new balance
  return {
  tradeId: trade.id,
  userId: trade.userId,
  type: tradeRequest.type,
  asset: assetSymbol,
  amount: tradeRequest.amount,
  expirationTime: tradeRequest.expirationTime,
  outcome,
  returnedAmount,
  profitLossAmount,
  profitLossPercent,
  timestamp: trade.createdAt,
  newBalance: tradeRequest.isDemo
    ? updatedUser.demoBalance
    : updatedUser.balance,
};



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

