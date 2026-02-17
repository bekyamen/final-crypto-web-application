// src/engine/tradeEngine.ts
import { v4 as uuidv4 } from 'uuid';
import { Trade, TradeRequest, TradeOutcome, ExpirationTime } from '../types/trade.types';
import { tradeStore } from '../stores/tradeStore';

export class TradeEngine {
  // Allowed expiration times and their profit/loss percentages
  private PERCENTAGE_MAP: Record<number, number> = {
    30: 0.12,
    60: 0.15,
    90: 0.18,
    120: 0.21,
    180: 0.24,
    360: 0.27,
  };

  ALLOWED_EXPIRATION_TIMES = Object.keys(this.PERCENTAGE_MAP).map(Number);

  /**
   * Decide if trade is WIN or LOSE
   */
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

  /**
   * Calculate profit/loss based on amount, expiration, and outcome
   * ✅ Symmetric: Win +%, Lose -%
   * ✅ Never return full amount
   */
  calculateReturnedAmount(
    amount: number,
    expirationTime: ExpirationTime,
    outcome: TradeOutcome,
  ) {
    const percent = this.PERCENTAGE_MAP[expirationTime];
    if (!percent) throw new Error('Invalid expiration time');

    const profitLossAmount = amount * percent;
    const profitLossPercent = percent * 100; // store as %

    // Symmetric: WIN adds, LOSE subtracts
    const balanceChange = outcome === 'WIN' ? profitLossAmount : -profitLossAmount;

    return {
      returnedAmount: balanceChange, // this is the change to balance
      profitLossAmount: balanceChange,
      profitLossPercent: outcome === 'WIN' ? profitLossPercent : -profitLossPercent,
    };
  }

  /**
   * Execute trade, store result
   */
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

    // Update user balance by ±profitLossAmount
    tradeStore.updateUserBalance(tradeRequest.userId, result.profitLossAmount);

    tradeStore.addTrade(trade);
    return trade;
  }

  getAllTrades() {
    return tradeStore.getAllTrades();
  }

  deleteUser(userId: string) {
    const deletedTrades = tradeStore.deleteUserTrades(userId);
    return { userId, deletedTrades };
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

  setUserOverride(userId: string, forceOutcome: 'win' | 'lose' | null, expiresAt?: Date) {
    tradeStore.setUserOverride(userId, forceOutcome, expiresAt);
  }

  updateBetConfig(expirationTime: number, profitPercent: number, lossPercent: number) {
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
