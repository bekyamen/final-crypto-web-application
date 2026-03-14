import { Trade, AdminSettings, AdminMode, UserOverride, BetConfig } from '../types/trade.types';

class TradeStore {
  private trades: Map<string, Trade> = new Map();
  private userBalances: Map<string, number> = new Map();

  // ===================== ADMIN SETTINGS =====================
 private adminSettings: AdminSettings = {
  DEMO: {  // Uppercase to match type
    globalMode: 'RANDOM', 
    winProbability: 60, 
    userOverrides: new Map() 
  },
  REAL: {  // Uppercase to match type
    globalMode: 'RANDOM', 
    winProbability: 60, 
    userOverrides: new Map() 
  },
};

  private betConfig: BetConfig = {
    30: { profitPercent: 12, lossPercent: 100 },
    60: { profitPercent: 15, lossPercent: 100 },
    90: { profitPercent: 18, lossPercent: 100 },
    120: { profitPercent: 21, lossPercent: 100 },
    180: { profitPercent: 24, lossPercent: 100 },
    360: { profitPercent: 27, lossPercent: 100 },
  };

  // ===================== ADMIN SETTINGS METHODS =====================
  getAdminSettings(): AdminSettings {
    return this.adminSettings;
  }

 
  // Update the methods to handle the uppercase keys
setGlobalMode(tradeType: 'DEMO' | 'REAL', mode: AdminMode): void {
  // No need to convert to lowercase anymore
  this.adminSettings[tradeType].globalMode = mode;
}


  setWinProbability(tradeType: 'DEMO' | 'REAL', percentage: number): void {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Win probability must be between 0 and 100');
  }
  this.adminSettings[tradeType].winProbability = percentage;
}


  setUserOverride(
  tradeType: 'DEMO' | 'REAL',
  userId: string,
  forceOutcome: 'win' | 'lose' | null,
  expiresAt?: Date
): void {
  const overrides = this.adminSettings[tradeType].userOverrides;

  if (forceOutcome === null) {
    overrides.delete(userId);
  } else {
    overrides.set(userId, { userId, forceOutcome, expiresAt });
  }
}



  getUserOverride(tradeType: 'DEMO' | 'REAL', userId: string): UserOverride | undefined {
  const overrides = this.adminSettings[tradeType].userOverrides;

  const override = overrides.get(userId);
  if (override?.expiresAt && new Date() > override.expiresAt) {
    overrides.delete(userId);
    return undefined;
  }
  return override;
}

  // ===================== BET CONFIG =====================
  getBetConfig(): BetConfig {
    return this.betConfig;
  }

  updateBetConfig(expirationTime: number, profitPercent: number, lossPercent: number): void {
    if (!this.betConfig.hasOwnProperty(expirationTime)) {
      throw new Error('Invalid expiration time');
    }
    this.betConfig[expirationTime] = { profitPercent, lossPercent };
  }

  // ===================== RESET =====================
 reset(): void {
  this.trades.clear();
  this.adminSettings = {
    DEMO: { globalMode: 'RANDOM', winProbability: 60, userOverrides: new Map() },  // Changed from 'demo' to 'DEMO'
    REAL: { globalMode: 'RANDOM', winProbability: 60, userOverrides: new Map() },  // Changed from 'real' to 'REAL'
  };
  this.userBalances.clear();
}

  // ===================== STATISTICS =====================
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