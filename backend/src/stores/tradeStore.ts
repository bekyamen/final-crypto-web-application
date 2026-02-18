import { Trade, AdminSettings, AdminMode, UserOverride, BetConfig } from '../types/trade.types';


class TradeStore {
  private trades: Map<string, Trade> = new Map();
  private userBalances: Map<string, number> = new Map();
  private adminSettings: AdminSettings = {
    globalMode: 'RANDOM',
    winProbability: 60,
    userOverrides: new Map(),
  };


  
  private betConfig: BetConfig = {
  30: { profitPercent: 12, lossPercent: 100 },   // 30s → 12%
  60: { profitPercent: 15, lossPercent: 100 },   // 60s → 15%
  90: { profitPercent: 18, lossPercent: 100 },   // 90s → 18%
  120: { profitPercent: 21, lossPercent: 100 },  // 120s → 21%
  180: { profitPercent: 24, lossPercent: 100 },  // 180s → 24%
  360: { profitPercent: 27, lossPercent: 100 },  // 360s → 27%
}


  // Trade operations
  addTrade(trade: Trade): void {
    this.trades.set(trade.id, trade);
  }

 getUserBalance(userId: string): number {
  return this.userBalances.get(userId) || 0;
}

  getAllTrades(): Trade[] {
    return Array.from(this.trades.values());
  }

  getUserTrades(userId: string): Trade[] {
    return Array.from(this.trades.values()).filter(t => t.userId === userId);
  }

  updateUserBalance(userId: string, delta: number): void {
  const current = this.userBalances.get(userId) || 0;
  const newBalance = current + delta;

  // Never allow negative balance
  this.userBalances.set(userId, Math.max(0, newBalance));
}

  /**
   * ✅ DELETE ALL TRADES FOR A USER
   */
  deleteUserTrades(userId: string): number {
    let deleted = 0;

    for (const [tradeId, trade] of this.trades.entries()) {
      if (trade.userId === userId) {
        this.trades.delete(tradeId);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * ✅ REMOVE USER OVERRIDE (ADMIN)
   */
  removeUserOverride(userId: string): void {
    this.adminSettings.userOverrides.delete(userId);
  }

  // Admin settings
  getAdminSettings(): AdminSettings {
    return this.adminSettings;
  }

  setGlobalMode(mode: AdminMode): void {
    this.adminSettings.globalMode = mode;
  }

  setWinProbability(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Win probability must be between 0 and 100');
    }
    this.adminSettings.winProbability = percentage;
  }

  setUserOverride(
    userId: string,
    forceOutcome: 'win' | 'lose' | null,
    expiresAt?: Date
  ): void {
    if (forceOutcome === null) {
      this.adminSettings.userOverrides.delete(userId);
    } else {
      this.adminSettings.userOverrides.set(userId, {
        userId,
        forceOutcome,
        expiresAt,
      });
    }
  }

  getUserOverride(userId: string): UserOverride | undefined {
    const override = this.adminSettings.userOverrides.get(userId);

    if (override && override.expiresAt && new Date() > override.expiresAt) {
      this.adminSettings.userOverrides.delete(userId);
      return undefined;
    }

    return override;
  }

  // Bet configuration
  getBetConfig(): BetConfig {
    return this.betConfig;
  }

  updateBetConfig(
    expirationTime: number,
    profitPercent: number,
    lossPercent: number
  ): void {
    if (!this.betConfig.hasOwnProperty(expirationTime)) {
      throw new Error('Invalid expiration time');
    }

    this.betConfig[expirationTime] = { profitPercent, lossPercent };
  }

  // Reset all data (for testing)
  reset(): void {
    this.trades.clear();
    this.adminSettings = {
      globalMode: 'RANDOM',
      winProbability: 60,
      userOverrides: new Map(),
    };
  }

  // Statistics
  getStats() {
    const allTrades = Array.from(this.trades.values());
    const totalTrades = allTrades.length;
    const totalWins = allTrades.filter(t => t.outcome === 'WIN').length;
    const totalLosses = allTrades.filter(t => t.outcome === 'LOSS').length;
    const totalVolumeUSD = allTrades.reduce((sum, t) => sum + t.amount, 0);
    const totalReturned = allTrades.reduce((sum, t) => sum + t.returnedAmount, 0);
    const totalProfit = totalReturned - totalVolumeUSD;

    return {
      totalTrades,
      totalWins,
      totalLosses,
      winRate: totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(2) : '0',
      totalVolumeUSD: totalVolumeUSD.toFixed(2),
      totalReturned: totalReturned.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
    };
  }
}

export const tradeStore = new TradeStore();