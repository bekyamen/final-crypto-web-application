import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/environment';

const prisma = new PrismaClient();

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  circulating_supply: number;
  max_supply: number;
  ath: number;
  atl: number;
}

export class CryptoService {
  async fetchCoinData(coinIds: string[]): Promise<CoinData[]> {
    try {
      const params = {
        ids: coinIds.join(','),
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        sparkline: false,
        price_change_percentage: '24h,7d',
      };

      const response = await axios.get(`${config.coinGeckoApiUrl}/coins/markets`, {
        params,
      });

      return response.data;
    } catch (error) {
      console.error('[CryptoService] Error fetching coin data:', error);
      throw new Error('Failed to fetch coin data');
    }
  }

  async fetchCoinPrice(coinId: string): Promise<number> {
    try {
      const params = {
        ids: coinId,
        vs_currencies: 'usd',
      };

      const response = await axios.get(
        `${config.coinGeckoApiUrl}/simple/price`,
        { params },
      );

      return response.data[coinId]?.usd || 0;
    } catch (error) {
      console.error('[CryptoService] Error fetching coin price:', error);
      return 0;
    }
  }

  async fetchTopCoins(limit: number = 10): Promise<CoinData[]> {
    try {
      const params = {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit,
        sparkline: false,
        price_change_percentage: '24h,7d',
      };

      const response = await axios.get(`${config.coinGeckoApiUrl}/coins/markets`, {
        params,
      });

      return response.data;
    } catch (error) {
      console.error('[CryptoService] Error fetching top coins:', error);
      throw new Error('Failed to fetch top coins');
    }
  }

  async getCachedOrFetchCoin(coinId: string): Promise<any> {
    // Try to get from cache
    let cachedCoin = await prisma.cryptoData.findUnique({
      where: { coinId },
    });

    // If cache exists and is less than 5 minutes old, return it
    if (cachedCoin) {
      const cacheAge = Date.now() - cachedCoin.cachedAt.getTime();
      if (cacheAge < 5 * 60 * 1000) {
        return cachedCoin;
      }
    }

    // Fetch fresh data
    const coinData = await this.fetchCoinData([coinId]);

    if (coinData.length === 0) {
      throw new Error(`Coin ${coinId} not found`);
    }

    const coin = coinData[0];

    // Update or create cache
    cachedCoin = await prisma.cryptoData.upsert({
      where: { coinId },
      create: {
        coinId,
        name: coin.name,
        symbol: coin.symbol,
        currentPrice: coin.current_price,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        priceChange24h: coin.price_change_percentage_24h,
        priceChange7d: coin.price_change_percentage_7d_in_currency,
        circulatingSupply: coin.circulating_supply,
        maxSupply: coin.max_supply,
      },
      update: {
        name: coin.name,
        symbol: coin.symbol,
        currentPrice: coin.current_price,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        priceChange24h: coin.price_change_percentage_24h,
        priceChange7d: coin.price_change_percentage_7d_in_currency,
        circulatingSupply: coin.circulating_supply,
        maxSupply: coin.max_supply,
        cachedAt: new Date(),
      },
    });

    return cachedCoin;
  }

  async clearExpiredCache(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    await prisma.cryptoData.deleteMany({
      where: {
        cachedAt: {
          lt: fiveMinutesAgo,
        },
      },
    });
  }
}

export const cryptoService = new CryptoService();
