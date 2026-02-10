export type TradeType = 'buy' | 'sell';
export type TradeOutcome = 'WIN' | 'LOSE';
export type AdminMode = 'win' | 'lose' | 'random';
export type ExpirationTime = 30 | 60 | 120 | 300; // seconds

export interface Trade {
  id: string;
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
  completedAt: Date;
}

export interface TradeRequest {
  userId: string;
  type: TradeType;
  asset: string;
  amount: number;
  expirationTime: ExpirationTime;
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

