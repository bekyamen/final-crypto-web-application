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
    userOverrides: new Map<string, { userId: string; forceOutcome: 'win' | 'lose' }>(),
  };

  private betConfig: BetConfig = {};

  /** ====================== ADMIN METHODS ====================== */
  setGlobalMode(mode: AdminMode) {
    this.adminSettings.globalMode = mode;
  }

  setWinProbability(percentage: number) {
    this.adminSettings.winProbability = percentage;
  }

  /** Permanent User Override */
  async setUserOverride(userId: string, forceOutcome: 'win' | 'lose' | null) {
    // 1️⃣ Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`Cannot set override: User with ID ${userId} does not exist`);

    if (forceOutcome === null) {
      // Remove override if null
      await prisma.userOverride.deleteMany({ where: { userId } });
      this.adminSettings.userOverrides.delete(userId);
      return;
    }

    // Upsert override
    await prisma.userOverride.upsert({
      where: { userId },
      update: { forceOutcome: forceOutcome.toUpperCase() },
      create: { userId, forceOutcome: forceOutcome.toUpperCase() },
    });

    // Update in-memory map
    this.adminSettings.userOverrides.set(userId, { userId, forceOutcome });
  }

  /** Get active mode for a user */
  getUserMode(userId: string): 'win' | 'lose' | 'random' {
    const override = this.adminSettings.userOverrides.get(userId);
    if (override?.forceOutcome) return override.forceOutcome;

    const globalMode = this.adminSettings.globalMode.toLowerCase();
    return ['win', 'lose'].includes(globalMode) ? (globalMode as 'win' | 'lose') : 'random';
  }

  /** ====================== TRADE METHODS ====================== */
  async calculateOutcome(userId: string): Promise<TradeOutcome> {
    const override = this.adminSettings.userOverrides.get(userId);
    if (override?.forceOutcome) return override.forceOutcome === 'win' ? 'WIN' : 'LOSS';

    if (this.adminSettings.globalMode === 'RANDOM') {
      return Math.random() * 100 <= this.adminSettings.winProbability ? 'WIN' : 'LOSS';
    }

    return this.adminSettings.globalMode === 'WIN' ? 'WIN' : 'LOSS';
  }

  calculateReturnedAmount(amount: number, expirationTime: number, outcome: TradeOutcome) {
    const percent = this.PERCENTAGE_MAP[expirationTime];
    if (percent === undefined) throw new Error('Invalid expiration time');

    let profitLossAmount = Math.round(amount * percent * 100) / 100;
    const profitLossPercent = outcome === 'WIN' ? percent * 100 : -percent * 100;

    return { returnedAmount: profitLossAmount, profitLossAmount, profitLossPercent };
  }

  async executeTrade(tradeRequest: TradeRequest): Promise<TradeResponse> {
    const outcome = await this.calculateOutcome(tradeRequest.userId);

    const { returnedAmount, profitLossAmount, profitLossPercent } = this.calculateReturnedAmount(
      tradeRequest.amount,
      tradeRequest.expirationTime,
      outcome
    );

    const assetSymbol = typeof tradeRequest.asset === 'string' ? tradeRequest.asset : tradeRequest.asset.symbol;

    const trade = await prisma.trade.create({
      data: {
        id: uuidv4(),
        userId: tradeRequest.userId,
        type: tradeRequest.type.toUpperCase() as 'BUY' | 'SELL',
        cryptoSymbol: assetSymbol,
        amountUSD: tradeRequest.amount,
        expirationTime: tradeRequest.expirationTime,
        scheduledTime: new Date(Date.now() + tradeRequest.expirationTime * 1000),
        executedAt: new Date(),
        outcome: outcome as PrismaTradeOutcome,
        profitLoss: profitLossAmount,
        profitLossPercent,
        notes: `Asset: ${assetSymbol}`,
      },
    });

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: tradeRequest.userId } });
      if (!user) throw new Error('User not found');

      const balanceField = tradeRequest.isDemo ? 'demoBalance' : 'balance';
      const netChange = outcome === 'WIN' ? profitLossAmount : -profitLossAmount;

      return await tx.user.update({
        where: { id: user.id },
        data: { [balanceField]: { increment: netChange } },
      });
    });

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
      newBalance: tradeRequest.isDemo ? updatedUser.demoBalance : updatedUser.balance,
    };
  }

  /** ====================== USER TRADES ====================== */
  getUserTrades(userId: string) {
    return prisma.trade.findMany({ where: { userId }, orderBy: { executedAt: 'desc' } });
  }

  getAllTrades() {
    return prisma.trade.findMany({ orderBy: { executedAt: 'desc' } });
  }

  /** ====================== ADMIN ====================== */
  updateBetConfig(expirationTime: ExpirationTime, profitPercent: number, lossPercent: number) {
    this.betConfig[expirationTime] = { profitPercent, lossPercent };
  }

  getAdminSettings(): AdminSettings {
    return this.adminSettings;
  }

  getStats() {
    return { totalTrades: 0, totalVolume: 0 }; // implement stats if needed
  }

  reset() {
    this.adminSettings = { globalMode: 'RANDOM', winProbability: 60, userOverrides: new Map() };
    this.betConfig = {};
  }
}

export const tradeEngine = new TradeEngine();