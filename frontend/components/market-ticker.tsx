'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react'

interface TickerData {
  name: string
  symbol: string
  price: number
  change24h: number
}

const tickerLogos: Record<string, React.ReactNode> = {
  BTC: (
    <Image
      src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
      alt="Bitcoin"
      width={24}
      height={24}
    />
  ),
  ETH: (
    <Image
      src="https://assets.coingecko.com/coins/images/279/large/ethereum.png"
      alt="Ethereum"
      width={24}
      height={24}
    />
  ),
  MCAP: <BarChart3 className="w-5 h-5 text-blue-400" />,
  VOL: <Activity className="w-5 h-5 text-purple-400" />,
}

export function MarketTicker() {
  const [tickerData, setTickerData] = useState<TickerData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const res = await fetch(
          '/api/market/prices?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true'
        )
        const data = await res.json()

        const btc = data.bitcoin || {}
        const eth = data.ethereum || {}

        const baseData: TickerData[] = [
          {
            name: 'Bitcoin',
            symbol: 'BTC',
            price: btc.usd || 0,
            change24h: btc.usd_24h_change || 0,
          },
          {
            name: 'Ethereum',
            symbol: 'ETH',
            price: eth.usd || 0,
            change24h: eth.usd_24h_change || 0,
          },
          {
            name: 'Market Cap',
            symbol: 'MCAP',
            price:
              (btc.usd_market_cap || 0) +
              (eth.usd_market_cap || 0),
            change24h: 0,
          },
          {
            name: '24h Volume',
            symbol: 'VOL',
            price:
              (btc.usd_24h_vol || 0) +
              (eth.usd_24h_vol || 0),
            change24h: 0,
          },
        ]

        // duplicate for infinite slider
        setTickerData([...baseData, ...baseData])
      } catch (err) {
        console.error('Ticker fetch failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickerData()
    const interval = setInterval(fetchTickerData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 overflow-hidden">
      <div className="ticker-track py-3">
        {isLoading ? (
          <div className="flex gap-10 px-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-20 bg-slate-700 rounded mb-2" />
                <div className="h-6 w-28 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          tickerData.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-6 flex-shrink-0"
            >
              {/* Logo */}
              <div className="w-6 h-6 flex items-center justify-center">
                {tickerLogos[item.symbol]}
              </div>

              {/* Text */}
              <div>
                <p className="text-xs text-slate-400 font-semibold">
                  {item.symbol}
                </p>

                <p className="text-lg font-bold text-white">
                  $
                  {item.price.toLocaleString('en-US', {
                    maximumFractionDigits: item.price > 1000 ? 0 : 2,
                  })}
                </p>

                {item.change24h !== 0 && (
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      item.change24h >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {item.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(item.change24h).toFixed(2)}%
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-10 bg-slate-700/40" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
