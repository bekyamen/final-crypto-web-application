// src/engine/tradeEngine.ts
import { v4 as uuidv4 } from 'uuid';
import { Trade, TradeRequest, TradeOutcome, ExpirationTime } from '../types/trade.types';
import { tradeStore } from '../stores/tradeStore';

export class TradeEngine {
  ALLOWED_EXPIRATION_TIMES = [30, 60, 120, 180, 240, 300, 360];

  calculateOutcome(userId: string): TradeOutcome {
    const adminSettings = tradeStore.getAdminSettings();

    const userOverride = tradeStore.getUserOverride(userId);
    if (userOverride) {
      return userOverride.forceOutcome === 'win' ? 'WIN' : 'LOSE';
    }

    if (adminSettings.globalMode === 'win') return 'WIN';
    if (adminSettings.globalMode === 'lose') return 'LOSE';

    const randomValue = Math.random() * 100;
    return randomValue <= adminSettings.winProbability ? 'WIN' : 'LOSE';
  }

  calculateReturnedAmount(
    amount: number,
    expirationTime: ExpirationTime,
    outcome: TradeOutcome,
  ) {
    const betConfig = tradeStore.getBetConfig();
    const config = betConfig[expirationTime];

    if (!config) throw new Error('Invalid expiration time');

    let profitLossAmount = 0;
    let profitLossPercent = 0;

    if (outcome === 'WIN') {
      profitLossPercent = config.profitPercent;
      profitLossAmount = amount * (config.profitPercent / 100);
    } else {
      profitLossPercent = -config.lossPercent;
      profitLossAmount = -amount * (config.lossPercent / 100);
    }

    const returnedAmount = amount + profitLossAmount;

    return {
      returnedAmount: Math.max(0, returnedAmount),
      profitLossAmount,
      profitLossPercent,
    };
  }

  executeTrade(tradeRequest: TradeRequest): Trade {
    const tradeId = uuidv4();
    const outcome = this.calculateOutcome(tradeRequest.userId);

    const result = this.calculateReturnedAmount(
      tradeRequest.amount,
      tradeRequest.expirationTime,
      outcome,
    );

    const trade: Trade = {
      id: tradeId,
      userId: tradeRequest.userId,
      type: tradeRequest.type,
      asset: tradeRequest.asset,
      amount: tradeRequest.amount,
      expirationTime: tradeRequest.expirationTime,
      outcome,
      ...result,
      timestamp: new Date(),
      completedAt: new Date(),
    };

    tradeStore.addTrade(trade);
    return trade;
  }

  getAllTrades() {
    return tradeStore.getAllTrades();
  }

    deleteUser(userId: string) {
    const deletedTrades = tradeStore.deleteUserTrades(userId);

    return {
      userId,
      deletedTrades,
    };
  }
  
  getUserTrades(userId: string) {
    return tradeStore.getUserTrades(userId);
  }

  getStats() {
    return tradeStore.getStats();
  }

  getAdminSettings() {
    return tradeStore.getAdminSettings();
  }

  setGlobalMode(mode: 'win' | 'lose' | 'random') {
    tradeStore.setGlobalMode(mode);
  }

  setWinProbability(percentage: number) {
    tradeStore.setWinProbability(percentage);
  }

  setUserOverride(
    userId: string,
    forceOutcome: 'win' | 'lose' | null,
    expiresAt?: Date,
  ) {
    tradeStore.setUserOverride(userId, forceOutcome, expiresAt);
  }

  updateBetConfig(
    expirationTime: number,
    profitPercent: number,
    lossPercent: number,
  ) {
    if (!this.ALLOWED_EXPIRATION_TIMES.includes(expirationTime)) {
      throw new Error('Invalid expiration time');
    }

    tradeStore.updateBetConfig(expirationTime, profitPercent, lossPercent);
  }

  reset() {
    tradeStore.reset();
  }
}

export const tradeEngine = new TradeEngine();
