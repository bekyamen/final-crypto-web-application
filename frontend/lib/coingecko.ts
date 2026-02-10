export async function fetchCoinGeckoPrice(ids: string) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_high=true&include_24hr_low=true&include_24hr_change=true`,
    { cache: 'no-store' }
  )

  if (!res.ok) throw new Error('Failed to fetch price')

  return res.json()
}
