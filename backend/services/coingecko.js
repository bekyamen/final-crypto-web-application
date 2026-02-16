import axios from 'axios';


// Simple in-memory cache
const cache = {
  data: null,
  timestamp: 0,
  ttl: 30 * 1000 // cache for 30 seconds
};

/**
 * Fetch crypto prices from CoinGecko with caching
 * @param {string} coinId - e.g. 'binancecoin'
 * @param {string} vsCurrency - e.g. 'usd'
 */
export async function getPrice(coinId = 'binancecoin', vsCurrency = 'usd') {
  const now = Date.now();

  // Return cached data if valid
  if (cache.data && now - cache.timestamp < cache.ttl) {
    return cache.data;
  }

  try {
    const res = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: coinId,
          vs_currencies: vsCurrency,
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true
        },
        headers: {
          'User-Agent': 'crypto-backend'
        },
        timeout: 5000
      }
    );

    // Save to cache
    cache.data = res.data;
    cache.timestamp = now;

    return res.data;
  } catch (err) {
    console.error('[CoinGecko] Error fetching price:', err.response?.status || err.message);
    // Return last cached data if available
    if (cache.data) return cache.data;
    return null;
  }
}
