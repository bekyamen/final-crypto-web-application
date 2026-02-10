'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HelpCircle, Settings, Bell, User } from 'lucide-react'
import { useRouter } from "next/navigation"


const allCryptos = [
  { id: 1, symbol: 'BTC', name: 'Bitcoin', price: '45079.67', change: '-2.45%', changeAmount: '+2797.37 USD', high: '48000.00', low: '$41114.00', volume: '$383 Billion', color: 'bg-orange-500' },
  { id: 2, symbol: 'ETH', name: 'Ethereum', price: '2729.56', change: '-3.21%', changeAmount: '+7729.26 USD', high: '$2945.7980', low: '$2309.00', volume: '$230.93M', color: 'bg-purple-500' },
  { id: 3, symbol: 'USDC', name: 'USD Coin', price: '$1.0014', change: '0.001%', changeAmount: '$1.0010', high: '$1.0017', low: '$1.0012', volume: '$1782.55M', color: 'bg-blue-400' },
  { id: 4, symbol: 'XRP', name: 'Ripple', price: '$1.7267', change: '-3.27%', changeAmount: '$1.0906', high: '$1.7692', low: '$1.368-$.6.33M', volume: '', color: 'bg-blue-600' },
  { id: 5, symbol: 'BNB', name: 'BNB Coin', price: '$619.9368', change: '-4.87%', changeAmount: '$566.6788', high: '$633.5368', low: '$566-$.6.33M', volume: '', color: 'bg-yellow-500' },
  { id: 6, symbol: 'ZEC', name: 'Zcash', price: '$331.7298', change: '-4.32%', changeAmount: '$176.5\'948', high: '$326.0480', low: '$76-$.388K', volume: '', color: 'bg-teal-500' },
  { id: 7, symbol: 'TRX', name: 'TRON', price: '50.2915', change: '-3.03%', changeAmount: '+56.2952', high: '56.2952', low: '371.93M', volume: '', color: 'bg-red-500' },
  { id: 8, symbol: 'ADA', name: 'Cardano', price: '10.3213', change: '-3.64%', changeAmount: '68.3515', high: '68.3515', low: '360.98M', volume: '', color: 'bg-blue-500' },
  { id: 9, symbol: 'LINK', name: 'Chainlink', price: '$10.7293', change: '-1.58%', changeAmount: '11.6791', high: '11.6791', low: '$1.404M', volume: '', color: 'bg-blue-400' },
  { id: 10, symbol: 'LTC', name: 'Litecoin', price: '$63.4708', change: '-2.74%', changeAmount: '+$6.2350', high: '$66.2350', low: '$66.72M', volume: '', color: 'bg-gray-500' },
  { id: 11, symbol: 'DASH', name: 'Dash', price: '$51.4668', change: '-2.31%', changeAmount: '€51.1180', high: '121.153M', low: '', volume: '', color: 'bg-blue-700' },
  { id: 12, symbol: 'KLM', name: 'Klaytn', price: '58.1919', change: '-2.21%', changeAmount: '$3.7186', high: '314.17M', low: '', volume: '', color: 'bg-red-400' },
  { id: 13, symbol: 'FET', name: 'Fetch', price: '50.2262', change: '-2.24%', changeAmount: '$5.2370', high: '€15.596M', low: '', volume: '', color: 'bg-amber-500' },
  { id: 14, symbol: 'ETC', name: 'Ethereum Classic', price: '$10.5024', change: '-2.78%', changeAmount: '€16.4350', high: '$1.610M', low: '', volume: '', color: 'bg-green-500' },
  { id: 15, symbol: 'ENJ', name: 'Enjin', price: '58.8242', change: '-3.11%', changeAmount: '68.5353', high: '56.3404', low: '', volume: '', color: 'bg-purple-700' },
  { id: 16, symbol: 'ALGO', name: 'Algorand', price: '50.1111', change: '-3.82%', changeAmount: '56.1124', high: '$1.434M', low: '', volume: '', color: 'bg-blue-600' },
  { id: 17, symbol: 'VET', name: 'VeChain', price: '50.8086', change: '-3.81%', changeAmount: '50.0081', high: '$1.089K', low: '', volume: '', color: 'bg-cyan-500' },
  { id: 18, symbol: 'ATOM', name: 'Cosmos', price: '$2.0696', change: '-3.55%', changeAmount: '€2.5519', high: '$1.535M', low: '', volume: '', color: 'bg-purple-500' },
  { id: 19, symbol: 'IOTA', name: 'IOTA', price: '58.6392', change: '-5.37%', changeAmount: '68.5979', high: '$1.736K', low: '', volume: '', color: 'bg-teal-600' },
  { id: 20, symbol: 'BAT', name: 'Basic Attention Token', price: '58.1281', change: '-2.04%', changeAmount: '€1.5434', high: '$2.13M', low: '', volume: '', color: 'bg-orange-400' },
  { id: 21, symbol: 'NEO', name: 'Neo', price: '53.2798', change: '-4.03%', changeAmount: '€1.3310', high: '€1.533M', low: '', volume: '', color: 'bg-green-600' },
  { id: 22, symbol: 'THETA', name: 'Theta', price: '50.2386', change: '-3.31%', changeAmount: '68.2380', high: '€1.876M', low: '', volume: '', color: 'bg-purple-600' },
  { id: 23, symbol: 'FTM', name: 'Fantom', price: '50.6894', change: '-4.57%', changeAmount: '€0.7711', high: '€1.306M', low: '', volume: '', color: 'bg-cyan-600' },
  { id: 24, symbol: 'QTUM', name: 'Qtum', price: '$1.1279', change: '-5.11%', changeAmount: '€1.2415', high: '€1.156K', low: '', volume: '', color: 'bg-white' },
  { id: 25, symbol: 'MATIC', name: 'Polygon', price: '50.1794', change: '-8.03%', changeAmount: '€0.3774', high: '€1.976M', low: '', volume: '', color: 'bg-purple-600' },
  { id: 26, symbol: 'EOS', name: 'EOS', price: '52.7799', change: '-3.94%', changeAmount: '50.7896', high: '€2.824K', low: '', volume: '', color: 'bg-gray-700' },
  { id: 27, symbol: 'TFTL', name: 'ThreeF Token', price: '50.8342', change: '-6.03%', changeAmount: '50.7980', high: '€2.785K', low: '', volume: '', color: 'bg-indigo-500' },
  { id: 28, symbol: 'OMG', name: 'OMG Network', price: '50.3528', change: '-3.31%', changeAmount: '50.3878', high: '€1.984M', low: '', volume: '', color: 'bg-pink-600' },
  { id: 29, symbol: 'USDI', name: 'USDI Stable', price: '50.0006', change: '0.001%', changeAmount: '$0.0000', high: '€0.0000', low: '', volume: '', color: 'bg-gray-400' },
  { id: 30, symbol: 'NANO', name: 'Nano', price: '50.0006', change: '0.001%', changeAmount: '€0.0000', high: '€0.0000', low: '', volume: '', color: 'bg-green-400' }
]

const topGainers = [
  { symbol: 'DOGE', price: '€5.01M', gain: '+4.31%' },
  { symbol: 'XLM', price: '€13.76300', gain: '+3.71%' }
]

const topLosers = [
  { symbol: 'ADA', price: '€5.0001', loss: '-6.15%' },
  { symbol: 'SOL', price: '€1.142', loss: '-5.32%' },
  { symbol: 'DOT', price: '€2.2990', loss: '-3.09%' },
  { symbol: 'TRON', price: '€8.0881', loss: '-3.91%' }
]

export default function MarketPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCryptos, setFilteredCryptos] = useState(allCryptos)
  const [sortBy, setSortBy] = useState('price')

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = allCryptos.filter(
      (crypto) =>
        crypto.symbol.toLowerCase().includes(value.toLowerCase()) ||
        crypto.name.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredCryptos(filtered)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700/50 sticky top-0 z-40 bg-gradient-to-b from-slate-950 to-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">₿</span>
              </div>
              <span className="text-white font-bold text-lg">BIT TRADING</span>
            </div>

             <nav className="flex items-center gap-4 sm:gap-8 text-sm flex-1 ml-8">
              <a href="/home" className="text-slate-400 hover:text-white transition">
                Home
              </a>
              <a href="/demo" className="text-blue-400 font-semibold transition">
                Trade
              </a>
              <a href="/market-report" className="text-slate-400 hover:text-white transition">
                Market
              </a>
              <a href="/news" className="text-slate-400 hover:text-white transition">
                News
              </a>
              <a href="/assets" className="text-slate-400 hover:text-white transition">
                Assets
              </a>
            </nav>

             <div className="flex items-center gap-4">
                                      <button className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-white">
                                        <HelpCircle size={20} />
                                      </button>
                                      <button
                                        onClick={() => router.push("/settings")}
                                        className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-white"
                                      >
                                        <Settings size={20} />
                                      </button>
                                      <button className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-white relative">
                                        <Bell size={20} />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                      </button>
                                      <button className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-white">
                                        <User size={20} />
                                      </button>
                                    </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Market Overview</h1>
          <p className="text-slate-400">Real-time cryptocurrency market data and analysis</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 bg-transparent">
            <Filter className="w-4 h-4 mr-2" />
            All
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-blue-500"
          >
            <option>Sort by Volume</option>
            <option>Sort by Price</option>
            <option>Sort by Change</option>
          </select>
        </div>

        

        {/* Crypto Table */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700/50 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">NAME</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">PRICE</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">24H CHANGE</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">24H HIGH</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">24H LOW</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">24H VOLUME</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredCryptos.map((crypto, index) => (
                  <tr key={crypto.id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 text-slate-400 text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${crypto.color} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                          {crypto.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{crypto.symbol}</p>
                          <p className="text-slate-400 text-xs">{crypto.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-medium text-sm">${crypto.price}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        crypto.change.includes('-') ? 'bg-red-900/30 text-red-400' : 'bg-cyan-900/30 text-cyan-400'
                      }`}>
                        {crypto.change}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">${crypto.high}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">${crypto.low}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{crypto.volume}</td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="outline" className="text-blue-400 border-blue-500 hover:bg-blue-500/10 text-xs bg-transparent">
                        Trade
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats and Top Gainers/Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Total Market Cap</p>
            <p className="text-white text-xl font-bold">$2.4T</p>
            <p className="text-cyan-400 text-xs mt-1">+2.2% 24h</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">All Marketcaps</p>
            <p className="text-white text-xl font-bold">$89.2B</p>
            <p className="text-slate-400 text-xs mt-1">Market Volume</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">BTC Dominance</p>
            <p className="text-white text-xl font-bold">52.8%</p>
            <p className="text-slate-400 text-xs mt-1">Market Share</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Active Traders</p>
            <p className="text-white text-xl font-bold">50</p>
            <p className="text-slate-400 text-xs mt-1">Trading Pairs</p>
          </div>
        </div>

        {/* Top Gainers and Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-cyan-400">▲</span> Top Gainers
            </h3>
            <div className="space-y-3">
              {topGainers.map((gainer, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
                  <span className="text-white font-medium text-sm">{gainer.symbol}</span>
                  <span className="text-cyan-400 font-semibold">{gainer.gain}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-red-400">▼</span> Top Losers
            </h3>
            <div className="space-y-3">
              {topLosers.map((loser, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
                  <span className="text-white font-medium text-sm">{loser.symbol}</span>
                  <span className="text-red-400 font-semibold">{loser.loss}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Now */}
        <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="text-orange-400">🔥</span> Trending Now
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['BTC', 'ETH', 'XRP', 'SOL', 'BNB'].map((crypto) => (
              <div key={crypto} className="text-center p-4 bg-slate-800/50 rounded hover:bg-slate-700/50 transition cursor-pointer">
                <p className="text-white font-bold text-sm mb-1">{crypto}</p>
                <p className="text-slate-400 text-xs">+3.45%</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
