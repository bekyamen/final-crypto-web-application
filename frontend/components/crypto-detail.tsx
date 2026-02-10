'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { CryptoAsset, getChartData, formatPrice, formatMarketCap } from '@/lib/market-data'
import { TrendingUp, TrendingDown, Share2, Star } from 'lucide-react'

interface CryptoDetailProps {
  crypto: CryptoAsset
}

export function CryptoDetail({ crypto }: CryptoDetailProps) {
  const chartData = getChartData(crypto.price, crypto.change24h)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden">
            <img
              src={crypto.image || "/placeholder.svg"}
              alt={crypto.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{crypto.name}</h1>
            <p className="text-slate-400">{crypto.symbol}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent">
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="border border-slate-700 rounded-lg bg-slate-900/50 p-6">
          <p className="text-slate-400 text-sm mb-2">Current Price</p>
          <h2 className="text-3xl font-bold text-white">{formatPrice(crypto.price)}</h2>
        </div>

        <div className="border border-slate-700 rounded-lg bg-slate-900/50 p-6">
          <p className="text-slate-400 text-sm mb-2">24h Change</p>
          <div className={`flex items-center gap-2 text-3xl font-bold ${
            crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {crypto.change24h >= 0 ? (
              <TrendingUp className="w-8 h-8" />
            ) : (
              <TrendingDown className="w-8 h-8" />
            )}
            {crypto.change24h.toFixed(2)}%
          </div>
        </div>

        <div className="border border-slate-700 rounded-lg bg-slate-900/50 p-6">
          <p className="text-slate-400 text-sm mb-2">Market Cap</p>
          <h2 className="text-3xl font-bold text-white">{formatMarketCap(crypto.marketCap)}</h2>
        </div>

        <div className="border border-slate-700 rounded-lg bg-slate-900/50 p-6">
          <p className="text-slate-400 text-sm mb-2">24h Volume</p>
          <h2 className="text-3xl font-bold text-white">{formatMarketCap(crypto.volume24h)}</h2>
        </div>
      </div>

      {/* Chart */}
      <div className="border border-slate-700 rounded-lg bg-slate-900/50 p-8 mb-8">
        <h3 className="text-lg font-bold text-white mb-6">Price Chart (24h)</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
                cursor={{ stroke: '#475569' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={crypto.change24h >= 0 ? '#10b981' : '#ef4444'}
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 text-lg">
          Buy {crypto.symbol}
        </Button>
        <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 text-lg">
          Sell {crypto.symbol}
        </Button>
      </div>
    </div>
  )
}
