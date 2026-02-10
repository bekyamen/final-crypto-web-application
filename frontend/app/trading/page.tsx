'use client'

import { useState, useEffect } from 'react'
import { GlobalSearch } from '@/components/global-search'
import { TradeModal } from '@/components/trade-modal'
import { OrderBookDisplay } from '@/components/order-book-display'
import { OrderBookDepthChart } from '@/components/order-book-depth-chart'
import { useRouter } from 'next/navigation'

interface AssetData {
  id: string
  name: string
  symbol: string
  price: number
  priceChange24h: number
  priceChangePercent24h: number
  marketCap: number
  volume24h: number
  high24h: number
  low24h: number
  image?: string
}

export default function TradingPage() {
  const router = useRouter()
  const [selectedAsset, setSelectedAsset] = useState<AssetData>({
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 84220.01,
    priceChange24h: 2500,
    priceChangePercent24h: 3.07,
    marketCap: 1650000000000,
    volume24h: 35000000000,
    high24h: 85000,
    low24h: 82000,
  })

  const [tradeModal, setTradeModal] = useState({
    isOpen: false,
    type: 'buy' as 'buy' | 'sell',
    assetClass: 'crypto' as 'crypto' | 'forex' | 'gold'
  })

  const [priceHistory, setPriceHistory] = useState<[number, number][]>([])
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)

  const handleSearchSelect = async (result: any) => {
    setIsLoadingPrice(true)
    try {
      // Fetch coin data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_COINGECKO_API_URL}/coins/${result.id}?vs_currency=usd&market_data=true`
      )
      const data = await response.json()

      setSelectedAsset({
        id: data.id,
        name: data.name,
        symbol: result.symbol,
        price: data.market_data?.current_price?.usd || 0,
        priceChange24h: data.market_data?.price_change_24h || 0,
        priceChangePercent24h: data.market_data?.price_change_percentage_24h || 0,
        marketCap: data.market_data?.market_cap?.usd || 0,
        volume24h: data.market_data?.total_volume?.usd || 0,
        high24h: data.market_data?.high_24h?.usd || 0,
        low24h: data.market_data?.low_24h?.usd || 0,
        image: data.image?.small
      })

      // Fetch price history
      const historyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_COINGECKO_API_URL}/coins/${result.id}/market_chart?vs_currency=usd&days=7`
      )
      const historyData = await historyResponse.json()
      setPriceHistory(historyData.prices || [])
    } catch (error) {
      console.error('[v0] Error fetching asset data:', error)
    } finally {
      setIsLoadingPrice(false)
    }
  }

  const openTradeModal = (type: 'buy' | 'sell') => {
    setTradeModal({
      isOpen: true,
      type,
      assetClass: 'crypto'
    })
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`
    if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`
    return `$${price.toFixed(2)}`
  }

  const isPositive = selectedAsset.priceChangePercent24h >= 0

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Trading</h1>
            <div className="flex-1 max-w-md">
              <GlobalSearch onSelect={handleSearchSelect} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Asset Header */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {selectedAsset.image && (
                <img
                  src={selectedAsset.image || "/placeholder.svg"}
                  alt={selectedAsset.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h2 className="text-3xl font-bold">{selectedAsset.name}</h2>
                <p className="text-slate-400">{selectedAsset.symbol}/USDT</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => openTradeModal('buy')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold transition"
              >
                Buy
              </button>
              <button
                onClick={() => openTradeModal('sell')}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg font-semibold transition"
              >
                Sell
              </button>
            </div>
          </div>

          {/* Price Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-slate-400 text-sm uppercase">Price</p>
              <p className="text-2xl font-bold">${selectedAsset.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm uppercase">24h Change</p>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{selectedAsset.priceChangePercent24h.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm uppercase">Market Cap</p>
              <p className="text-2xl font-bold">{formatPrice(selectedAsset.marketCap)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm uppercase">24h Volume</p>
              <p className="text-2xl font-bold">{formatPrice(selectedAsset.volume24h)}</p>
            </div>
          </div>

          {/* High/Low */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
            <div>
              <p className="text-slate-400 text-sm">24h High</p>
              <p className="text-lg font-semibold">${selectedAsset.high24h.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">24h Low</p>
              <p className="text-lg font-semibold">${selectedAsset.low24h.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Charts and Order Book */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Depth Chart */}
          <div className="lg:col-span-2">
            <OrderBookDepthChart symbol={selectedAsset.symbol} />
          </div>

          {/* Right Column - Order Book */}
          <div>
            <OrderBookDisplay symbol={selectedAsset.symbol} limit={10} />
          </div>
        </div>

        {/* Recent Trades Section */}
        <div className="mt-8 bg-slate-900 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-b-0">
                <div>
                  <p className="text-white">{(0.5 + Math.random() * 2).toFixed(4)} {selectedAsset.symbol}</p>
                  <p className="text-xs text-slate-400">${(selectedAsset.price * 0.99 + Math.random() * 100).toFixed(2)}</p>
                </div>
                <p className="text-slate-300 text-sm">
                  {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Trade Modal */}
      <TradeModal
        {...({
          isOpen: tradeModal.isOpen,
          onClose: () => setTradeModal({ ...tradeModal, isOpen: false }),
          type: tradeModal.type,
          currentPrice: selectedAsset.price,
          symbol: selectedAsset.symbol
        } as any)}
      />
    </div>
  )
}
