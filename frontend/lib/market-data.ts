const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

/* =======================
   Interfaces (UNCHANGED)
======================= */

export interface CryptoAsset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  image: string
}

export interface TopGainer {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  image: string
}

export interface NewListing {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  image: string
}

/* =======================
   Fetch All Cryptos
======================= */

export async function getCryptos(): Promise<CryptoAsset[]> {
  const res = await fetch(
    `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false`,
    { next: { revalidate: 30 } }
  )

  if (!res.ok) throw new Error('Failed to fetch crypto assets')

  const data = await res.json()

  return data.map((coin: any): CryptoAsset => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    change24h: coin.price_change_percentage_24h,
    marketCap: coin.market_cap,
    volume24h: coin.total_volume,
    image: coin.image
  }))
}

/* =======================
   Top Gainers (Real Data)
======================= */

export async function getTopGainers(): Promise<TopGainer[]> {
  const cryptos = await getCryptos()

  return cryptos
    .filter(c => c.change24h > 0)
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      price: c.price,
      change24h: c.change24h,
      image: c.image
    }))
}

/* =======================
   New Listings (Approx.)
   Based on lowest market cap
======================= */

export async function getNewListings(): Promise<NewListing[]> {
  const res = await fetch(
    `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_asc&per_page=5&page=1&sparkline=false`,
    { next: { revalidate: 60 } }
  )

  if (!res.ok) throw new Error('Failed to fetch new listings')

  const data = await res.json()

  return data.map((coin: any): NewListing => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    change24h: coin.price_change_percentage_24h,
    image: coin.image
  }))
}

/* =======================
   Single Crypto Details
======================= */

export async function getCryptoById(id: string): Promise<CryptoAsset | undefined> {
  const res = await fetch(
    `${COINGECKO_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true`
  )

  if (!res.ok) return undefined

  const coin = await res.json()

  return {
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.market_data.current_price.usd,
    change24h: coin.market_data.price_change_percentage_24h,
    marketCap: coin.market_data.market_cap.usd,
    volume24h: coin.market_data.total_volume.usd,
    image: coin.image.large
  }
}

/* =======================
   Chart Data (Live-based)
======================= */

export async function getChartData(id: string, days = 1) {
  const res = await fetch(
    `${COINGECKO_BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  )

  if (!res.ok) throw new Error('Failed to fetch chart data')

  const data = await res.json()

  return data.prices.map((p: any) => ({
    time: p[0],
    price: Number(p[1].toFixed(2))
  }))
}


/* =======================
   Helpers
======================= */

export function formatPrice(price: number): string {
  return price >= 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(4)}`
}

export function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(0)}`
}
