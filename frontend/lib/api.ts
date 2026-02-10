// api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  assetClass: 'crypto' | 'forex' | 'gold';
}

export interface TradeRequest {
  userId: string;
  type: 'buy' | 'sell';
  asset: Asset;
  amount: number;
  expirationTime: number;
}

export interface TradeResult {
  tradeId: string;
  userId: string;
  type: 'buy' | 'sell';
  asset: Asset;
  amount: number;
  expirationTime: number;
  outcome: 'WIN' | 'LOSE';
  returnedAmount: number;
  profitLossAmount: number;
  profitLossPercent: number;
  timestamp: string;
  completedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
}

interface ApiError {
  success: false;
  message: string;
  errorCode?: string;
}

export class ApiClient {
  private static getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = (await res.json()) as ApiError;
      throw new Error(error.message || 'Request failed');
    }
    return res.json();
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const error = (await res.json()) as ApiError;
      throw new Error(error.message || 'Request failed');
    }
    return res.json();
  }

  static async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = (await res.json()) as ApiError;
      throw new Error(error.message || 'Request failed');
    }
    return res.json();
  }
}

/** ---------------- AUTH APIs ---------------- */
export const authApi = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    fundsPassword: string;
  }) => ApiClient.post<{ user: any; token: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    ApiClient.post<{ user: any; token: string }>('/auth/login', data),

  getProfile: () => ApiClient.get<{ user: any }>('/auth/profile'),

  updateProfile: (data: any) => ApiClient.put<{ user: any }>('/auth/profile', data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => ApiClient.post<{ message: string }>('/auth/change-password', data),

  changeFundsPassword: (data: {
    currentFundsPassword: string;
    newFundsPassword: string;
    confirmFundsPassword: string;
  }) => ApiClient.post<{ message: string }>('/auth/change-funds-password', data),

  verifyFundsPassword: (fundsPassword: string) =>
    ApiClient.post<{ isValid: boolean }>('/auth/verify-funds-password', { fundsPassword }),
};

/** ---------------- TRADE-SIM APIs ---------------- */
export const tradeSimApi = {
  executeTrade: (trade: TradeRequest) =>
    ApiClient.post<TradeResult>('/trade-sim', trade),

  getAllTrades: () =>
    ApiClient.get<{ totalTrades: number; trades: TradeResult[] }>('/trade-sim'),

  getUserTrades: (userId: string) =>
    ApiClient.get<{ userId: string; totalTrades: number; trades: TradeResult[] }>(
      `/trade-sim/user/${userId}`
    ),

  getPlatformStats: () =>
    ApiClient.get<{
      totalTrades: number;
      totalWins: number;
      totalLosses: number;
      winRate: string;
      totalVolumeUSD: string;
      totalReturned: string;
      totalProfit: string;
    }>('/trade-sim/stats'),
};
