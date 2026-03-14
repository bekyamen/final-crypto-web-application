import { PrismaClient, TradeOutcome as PrismaTradeOutcome } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  TradeRequest,
  TradeOutcome,
  AdminMode,
  TradeResponse,
  BetConfig,
} from '../types/trade.types';

const prisma = new PrismaClient();

// Corrected AdminSettings type for demo/real distinction
interface AdminSettingsItem {
  globalMode: AdminMode;
  winProbability: number;
  userOverrides: Map<string, { userId: string; forceOutcome: 'win' | 'lose' }>;
}

interface AdminSettings {
  DEMO: AdminSettingsItem;
  REAL: AdminSettingsItem;
}

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
    DEMO: {
      globalMode: 'RANDOM',
      winProbability: 60,
      userOverrides: new Map(),
    },
    REAL: {
      globalMode: 'RANDOM',
      winProbability: 60,
      userOverrides: new Map(),
    },
  };

  private betConfig: BetConfig = {};

  /* ================= ADMIN METHODS ================= */
  setGlobalMode(mode: AdminMode, tradeType: 'DEMO' | 'REAL'): void {
    this.adminSettings[tradeType].globalMode = mode;
  }

  setWinProbability(percentage: number, tradeType: 'DEMO' | 'REAL'): void {
    this.adminSettings[tradeType].winProbability = percentage;
  }

  async setUserOverride(
    userId: string,
    forceOutcome: 'win' | 'lose' | null,
    tradeType: 'DEMO' | 'REAL'
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User ${userId} not found`);

    await prisma.userOverride.deleteMany({ where: { userId, tradeType } });

    const target = this.adminSettings[tradeType].userOverrides;

    if (!forceOutcome) {
      target.delete(userId);
      return;
    }

    const enumMap = { win: 'WIN', lose: 'LOSS' } as const;

    await prisma.userOverride.create({
      data: {
        userId,
        tradeType,
        forceOutcome: enumMap[forceOutcome],
      },
    });

    target.set(userId, { userId, forceOutcome });
  }

  getAdminSettings(): AdminSettings {
    return this.adminSettings;
  }

  reset(): void {
    this.adminSettings = {
      DEMO: {
        globalMode: 'RANDOM',
        winProbability: 60,
        userOverrides: new Map(),
      },
      REAL: {
        globalMode: 'RANDOM',
        winProbability: 60,
        userOverrides: new Map(),
      },
    };

    this.betConfig = {};
  }

  /* ================= TRADE LOGIC ================= */
  async calculateOutcome(userId: string, isDemo: boolean): Promise<TradeOutcome> {
    const tradeType = isDemo ? 'DEMO' : 'REAL';
    const settings = this.adminSettings[tradeType];
    const override = settings.userOverrides.get(userId);

    if (override?.forceOutcome) {
      return override.forceOutcome === 'win' ? 'WIN' : 'LOSS';
    }

    if (settings.globalMode === 'WIN') return 'WIN';
    if (settings.globalMode === 'LOSS') return 'LOSS';

    const rand = Math.random() * 100;
    return rand <= settings.winProbability ? 'WIN' : 'LOSS';
  }

  calculateReturnedAmount(amount: number, expirationTime: number, outcome: TradeOutcome) {
    const custom = this.betConfig[expirationTime];
    const percent = custom
      ? outcome === 'WIN'
        ? custom.profitPercent / 100
        : custom.lossPercent / 100
      : this.PERCENTAGE_MAP[expirationTime];

    if (!percent) throw new Error('Invalid expiration time');

    const value = Math.round(amount * percent * 100) / 100;

    return {
      returnedAmount: value,
      profitLossAmount: value,
      profitLossPercent: outcome === 'WIN' ? percent * 100 : -percent * 100,
    };
  }

  async executeTrade(tradeRequest: TradeRequest): Promise<TradeResponse> {
    const outcome = await this.calculateOutcome(tradeRequest.userId, tradeRequest.isDemo);
    const { returnedAmount, profitLossAmount, profitLossPercent } = this.calculateReturnedAmount(
      tradeRequest.amount,
      tradeRequest.expirationTime,
      outcome
    );

    const assetSymbol =
      typeof tradeRequest.asset === 'string' ? tradeRequest.asset : tradeRequest.asset.symbol;

    const trade = await prisma.trade.create({
      data: {
        id: uuidv4(),
        userId: tradeRequest.userId,
        type: tradeRequest.type.toUpperCase() as 'BUY' | 'SELL',
        cryptoSymbol: assetSymbol,
        amountUSD: tradeRequest.amount,
        expirationTime: tradeRequest.expirationTime,
        isDemo: tradeRequest.isDemo,
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
      const net = outcome === 'WIN' ? profitLossAmount : -profitLossAmount;

      return tx.user.update({ where: { id: user.id }, data: { [balanceField]: { increment: net } } });
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
      isDemo: trade.isDemo,
    };
  }

  /* ================= USER DATA ================= */
  async getUserTrades(userId: string, isDemo?: boolean) {
    const whereClause: any = { userId };
    if (typeof isDemo === 'boolean') whereClause.isDemo = isDemo;

    return prisma.trade.findMany({ where: whereClause, orderBy: { executedAt: 'desc' } });
  }

  getAllTrades() {
    return prisma.trade.findMany({ orderBy: { executedAt: 'desc' } });
  }

  getStats() {
    return { totalTrades: 0, totalVolume: 0 };
  }

  /* ================= BET CONFIG ================= */
  updateBetConfig(expirationTime: number, profitPercent: number, lossPercent: number): void {
    if (!this.betConfig) this.betConfig = {};

    this.betConfig[expirationTime] = { profitPercent, lossPercent };
  }
}

export const tradeEngine = new TradeEngine();