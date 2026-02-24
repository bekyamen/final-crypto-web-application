import { CoinType, NetworkType } from "@prisma/client"

// Minimum USD withdrawal
export const MIN_WITHDRAW_USD = 10

// Define network info for each coin
export const networks: Record<CoinType, { value: NetworkType; label: string; description: string }[]> = {
  BTC: [
    {
      value: 'BTC',          // matches NetworkType in Prisma
      label: 'Bitcoin',
      description: 'Bitcoin Network • Fee: 0.0005 BTC',
    },
  ],
  ETH: [
    {
      value: 'ERC20',        // matches NetworkType in Prisma
      label: 'Ethereum (ERC20)',
      description: 'Ethereum Network • Fee: 0.005 ETH',
    },
  ],
  USDT: [
    {
      value: 'TRC20',
      label: 'TRON (TRC20)',
      description: 'TRON Network • Fee: 1 USDT',
    },
    {
      value: 'ERC20',
      label: 'Ethereum (ERC20)',
      description: 'Ethereum Network • Fee: 5 USDT',
    },
  ],
}



export const withdrawFees: Record<
  CoinType,
  Partial<Record<NetworkType, number>>
> = {
  BTC: {
    BTC: 0.0005,
  },
  ETH: {
    ERC20: 0.005,
  },
  USDT: {
    TRC20: 1,
    ERC20: 1,
  },
};