import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CryptoPriceData {
  symbol: string;
  price: number;
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;
  lastUpdated: Date;
}

class CryptoPriceService {
  private priceCache: Map<string, CryptoPriceData> = new Map();
  private lastCacheUpdate: Map<string, number> = new Map();

  async getCryptoPrice(symbol: string): Promise<CryptoPriceData> {
    // Check cache first
    const cachedPrice = this.priceCache.get(symbol);
    const lastUpdate = this.lastCacheUpdate.get(symbol) || 0;

    if (cachedPrice && Date.now() - lastUpdate < CACHE_DURATION) {
      return cachedPrice;
    }

    try {
      // Fetch from CoinGecko API
      const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
        params: {
          ids: this.getCoingeckoId(symbol),
          vs_currencies: 'usd',
          include_market_cap: 'true',
          include_24hr_vol: 'true',
          include_24hr_change: 'true',
        },
      });

      const coingeckoId = this.getCoingeckoId(symbol);
      const data = response.data[coingeckoId];

      if (!data) {
        throw new Error(`No price data found for ${symbol}`);
      }

      const priceData: CryptoPriceData = {
        symbol,
        price: data.usd,
        marketCap: data.usd_market_cap,
        volume24h: data.usd_24h_vol,
        priceChange24h: data.usd_24h_change,
        lastUpdated: new Date(),
      };

      // Update cache
      this.priceCache.set(symbol, priceData);
      this.lastCacheUpdate.set(symbol, Date.now());

      // Save to database
      await this.savePriceToDatabase(priceData);

      return priceData;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);

      // Try to get from database if API fails
      const dbPrice = await prisma.cryptoPrice.findUnique({
        where: { symbol },
      });

      if (dbPrice) {
        return {
          symbol,
          price: dbPrice.price,
          marketCap: dbPrice.marketCap || undefined,
          volume24h: dbPrice.volume24h || undefined,
          priceChange24h: dbPrice.priceChange24h || undefined,
          lastUpdated: dbPrice.updatedAt,
        };
      }

      throw error;
    }
  }

  async getMultiplePrices(symbols: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();

    const ids = symbols.map(s => this.getCoingeckoId(s)).join(',');

    try {
      const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
        params: {
          ids,
          vs_currencies: 'usd',
        },
      });

      for (const symbol of symbols) {
        const coingeckoId = this.getCoingeckoId(symbol);
        const data = response.data[coingeckoId];
        if (data) {
          prices.set(symbol, data.usd);
        }
      }

      return prices;
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      throw error;
    }
  }

  private getCoingeckoId(symbol: string): string {
    const symbolMap: { [key: string]: string } = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      ADA: 'cardano',
      SOL: 'solana',
      DOT: 'polkadot',
      DOGE: 'dogecoin',
      XRP: 'ripple',
      USDT: 'tether',
      USDC: 'usd-coin',
      BNB: 'binancecoin',
    };

    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  private async savePriceToDatabase(priceData: CryptoPriceData): Promise<void> {
    try {
      await prisma.cryptoPrice.upsert({
        where: { symbol: priceData.symbol },
        update: {
          price: priceData.price,
          marketCap: priceData.marketCap,
          volume24h: priceData.volume24h,
          priceChange24h: priceData.priceChange24h,
          lastUpdated: priceData.lastUpdated,
        },
        create: {
          symbol: priceData.symbol,
          price: priceData.price,
          marketCap: priceData.marketCap,
          volume24h: priceData.volume24h,
          priceChange24h: priceData.priceChange24h,
        },
      });
    } catch (error) {
      console.error('Error saving price to database:', error);
    }
  }

  async getPriceFromDatabase(symbol: string): Promise<CryptoPriceData | null> {
    const price = await prisma.cryptoPrice.findUnique({
      where: { symbol },
    });

    if (!price) return null;

    return {
      symbol,
      price: price.price,
      marketCap: price.marketCap || undefined,
      volume24h: price.volume24h || undefined,
      priceChange24h: price.priceChange24h || undefined,
      lastUpdated: price.updatedAt,
    };
  }

  async refreshAllPrices(symbols: string[]): Promise<void> {
    for (const symbol of symbols) {
      try {
        await this.getCryptoPrice(symbol);
      } catch (error) {
        console.error(`Error refreshing price for ${symbol}:`, error);
      }
    }
  }
}

export const cryptoPriceService = new CryptoPriceService();
export type { CryptoPriceData };
