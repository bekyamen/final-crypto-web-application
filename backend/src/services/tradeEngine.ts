// src/services/tradeEngine.ts
import { PrismaClient, TradeOutcome } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { TradeRequest } from '../types/trade.types';

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

  private adminSettings = {
    globalMode: 'RANDOM' as 'WIN' | 'LOSS' | 'RANDOM',
    winProbability: 60,
  };

  private betConfig: Record<number, { profitPercent: number; lossPercent: number }> = {};

  /** ====================== ADMIN METHODS ====================== */
  setGlobalMode(mode: 'WIN' | 'LOSS' | 'RANDOM') {
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

  async getUserOverride(userId: string) {
    const override = await prisma.userOverride.findUnique({ where: { userId } });
    if (!override) return null;

    if (override.expiresAt && override.expiresAt < new Date()) {
      await prisma.userOverride.delete({ where: { userId } });
      return null;
    }

    return override;
  }

  updateBetConfig(expirationTime: number, profitPercent: number, lossPercent: number) {
    this.betConfig[expirationTime] = { profitPercent, lossPercent };
  }

  getAdminSettings() {
    return {
      globalMode: this.adminSettings.globalMode,
      winProbability: this.adminSettings.winProbability,
    };
  }

  getStats() {
    return {
      totalTrades: 0, // optional: implement if needed
      totalVolume: 0,
    };
  }

  reset() {
    this.adminSettings.globalMode = 'RANDOM';
    this.adminSettings.winProbability = 60;
    this.betConfig = {};
  }

  /** ====================== TRADE LOGIC ====================== */
  async calculateOutcome(userId: string): Promise<TradeOutcome> {
    const override = await this.getUserOverride(userId);
    if (override?.forceOutcome) {
      return override.forceOutcome === 'WIN' ? 'WIN' : 'LOSS';
    }

    if (this.adminSettings.globalMode === 'RANDOM') {
      const randomValue = Math.random() * 100;
      return randomValue <= this.adminSettings.winProbability ? 'WIN' : 'LOSS';
    }

    return this.adminSettings.globalMode === 'WIN' ? 'WIN' : 'LOSS';
  }

  calculateReturnedAmount(amount: number, expirationTime: number, outcome: TradeOutcome) {
    const percent = this.PERCENTAGE_MAP[expirationTime];
    if (percent === undefined) throw new Error('Invalid expiration time');

    let profitLossAmount = amount * percent;
    profitLossAmount = Math.round(profitLossAmount * 100) / 100;

    const profitLossPercent = outcome === 'WIN' ? percent * 100 : -percent * 100;
    return { returnedAmount: profitLossAmount, profitLossAmount, profitLossPercent };
  }

  async scheduleTrade(tradeRequest: TradeRequest) {
    const assetSymbol =
      typeof tradeRequest.asset === 'string'
        ? tradeRequest.asset
        : tradeRequest.asset.symbol;

    const scheduledTime = new Date(Date.now() + tradeRequest.expirationTime * 1000);
    const balanceField = tradeRequest.isDemo ? 'demoBalance' : 'balance';

    await prisma.user.update({
      where: { id: tradeRequest.userId },
      data: { [balanceField]: { decrement: tradeRequest.amount } },
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
        isDemo: tradeRequest.isDemo,
      },
    });

    return trade;
  }

  async executeExpiredTrades() {
    const expiredTrades = await prisma.trade.findMany({
      where: { status: 'SCHEDULED', scheduledTime: { lte: new Date() } },
    });

    for (const trade of expiredTrades) {
      if (!trade.expirationTime) continue;

      const outcome = await this.calculateOutcome(trade.userId);
      const { profitLossAmount, profitLossPercent } = this.calculateReturnedAmount(
        trade.amountUSD,
        trade.expirationTime,
        outcome
      );

      const balanceField = trade.isDemo ? 'demoBalance' : 'balance';

      await prisma.$transaction(async (tx) => {
        if (outcome === 'WIN') {
          await tx.user.update({
            where: { id: trade.userId },
            data: { [balanceField]: { increment: trade.amountUSD + profitLossAmount } },
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
