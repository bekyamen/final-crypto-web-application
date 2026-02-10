const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
export interface Asset {
  symbol: string
  name: string
  price: number
  assetClass: 'crypto' | 'forex' | 'gold'
}

export interface TradeRequest {
  userId: string
  type: 'buy' | 'sell'
  asset: Asset
  amount: number
  expirationTime: number
}

export interface TradeResult {
  tradeId: string
  userId: string
  type: 'buy' | 'sell'
  asset: Asset
  amount: number
  expirationTime: number
  outcome: 'WIN' | 'LOSE'
  returnedAmount: number
  profitLossAmount: number
  profitLossPercent: number
  timestamp: string
  completedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface TradeResponse extends ApiResponse<TradeResult> {}

export interface TradesResponse {
  success: boolean
  message: string
  data: {
    totalTrades: number
    trades: TradeResult[]
  }
}

export interface UserTradesResponse {
  success: boolean
  message: string
  data: {
    userId: string
    totalTrades: number
    trades: TradeResult[]
  }
}

export interface StatsResponse {
  success: boolean
  message: string
  data: {
    totalTrades: number
    totalWins: number
    totalLosses: number
    winRate: string
    totalVolumeUSD: string
    totalReturned: string
    totalProfit: string
  }
}

/**
 * Execute a trade
 */
export async function executeTrade(
  userId: string,
  type: 'buy' | 'sell',
  asset: Asset,
  amount: number,
  expirationTime: number
): Promise<TradeResult> {
  try {
    console.log('[v0] Executing trade with payload:', {
      userId,
      type,
      asset,
      amount,
      expirationTime
    })

    const response = await fetch(`${API_BASE_URL}/trade-sim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        type,
        asset,
        amount,
        expirationTime
      })
    })

    console.log('[v0] Trade response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] API error response:', errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data: TradeResponse = await response.json()
    console.log('[v0] Trade executed successfully:', data)

    if (!data.success) {
      throw new Error(data.message || 'Trade failed')
    }

    return data.data
  } catch (error) {
    console.error('[v0] Trade execution failed:', error)
    throw error
  }
}

/**
 * Get all trades (platform-wide)
 */
export async function getAllTrades(): Promise<TradeResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/trade-sim`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: TradesResponse = await response.json()
    console.log('[v0] All trades fetched:', data)
    return data.data.trades
  } catch (error) {
    console.error('[v0] Failed to fetch all trades:', error)
    throw error
  }
}

/**
 * Get user's trade history
 */
export async function getUserTrades(userId: string): Promise<TradeResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/trade-sim/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: UserTradesResponse = await response.json()
    console.log('[v0] User trades fetched:', data)
    return data.data.trades
  } catch (error) {
    console.error('[v0] Failed to fetch user trades:', error)
    throw error
  }
}

/**
 * Get platform statistics
 */
export async function getPlatformStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/trade-sim/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: StatsResponse = await response.json()
    console.log('[v0] Platform stats fetched:', data)
    return data.data
  } catch (error) {
    console.error('[v0] Failed to fetch platform stats:', error)
    throw error
  }
}
