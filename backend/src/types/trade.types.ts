export type TradeType = 'BUY' | 'SELL';
export type TradeOutcome = 'WIN' | 'LOSS' | 'NEUTRAL';

export type AdminMode = 'WIN' | 'LOSS' | 'RANDOM';

export type ExpirationTime = 30 | 60 | 90 | 120 | 180 | 360 ; // seconds

export interface Trade {
  id: string;
  userId: string;
  type: TradeType;
  asset: string | { symbol: string };
  amount: number;
  expirationTime: ExpirationTime;
  outcome: TradeOutcome;
  returnedAmount: number;
  profitLossAmount: number;
  profitLossPercent: number;
  timestamp: Date;
  completedAt: Date;
}

export interface TradeRequest {
  userId: string;
  type: TradeType;
  asset: string | { symbol: string };
  amount: number;
  expirationTime: ExpirationTime;
  isDemo: boolean;
}

export interface TradeResponse {
  tradeId: string;
  userId: string;
  type: TradeType;
  asset: string;
  amount: number;
  expirationTime: ExpirationTime;
  outcome: TradeOutcome;
  returnedAmount: number;
  profitLossAmount: number;
  profitLossPercent: number;
  timestamp: Date;
  newBalance?: number;
}

export interface UserOverride {
  userId: string;
  forceOutcome: 'win' | 'lose' | null;
  expiresAt?: Date;
}

export interface AdminSettings {
  globalMode: AdminMode;
  winProbability: number; // 0-100
  userOverrides: Map<string, UserOverride>;
}

export interface BetConfig {
  [key: string]: {
    profitPercent: number;
    lossPercent: number;
  };
}
