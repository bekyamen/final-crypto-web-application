'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, EyeOff, ArrowDown, ArrowUp, BarChart3, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HelpCircle, Settings, Bell, User } from 'lucide-react'
import { useRouter } from "next/navigation"

const cryptoData = [
  { symbol: 'BTC', name: 'Bitcoin', price: '45079.67', change: '+2.45%', changeAmount: '+2797.37 USD', icon: '₿', color: 'bg-orange-500' },
  { symbol: 'ETH', name: 'Ethereum', price: '2729.56', change: '-3.21%', changeAmount: '+727.26 USD', icon: 'Ξ', color: 'bg-purple-500' },
  { symbol: 'BNB', name: 'BNB', price: '303.68', change: '+4.87%', changeAmount: '+702.168 USD', icon: 'B', color: 'bg-yellow-500' },
  { symbol: 'ADA', name: 'Cardano', price: '0.4243', change: '-0.51%', changeAmount: '+0.5243 USD', icon: 'A', color: 'bg-blue-600' },
  { symbol: 'SOL', name: 'Solana', price: '97.34', change: '+3.12%', changeAmount: '+917.26 USD', icon: 'S', color: 'bg-purple-600' },
  { symbol: 'DOT', name: 'Polkadot', price: '7.46', change: '-1.23%', changeAmount: '+0.7435 USD', icon: 'D', color: 'bg-pink-500' },
  { symbol: 'LINK', name: 'Chainlink', price: '14.43', change: '+2.11%', changeAmount: '+11.6 USD', icon: 'L', color: 'bg-blue-400' },
  { symbol: 'AVAX', name: 'Avalanche', price: '33.34', change: '-0.45%', changeAmount: '+43.34 USD', icon: 'A', color: 'bg-red-500' }
]

export default function HomePage() {
   const router = useRouter()
  const [showBalance, setShowBalance] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)

  const carouselSlides = [
    {
      title: 'Secure & Fast Transactions',
      description: 'Deposit and withdraw funds instantly with bank-level security'
    },
    {
      title: '24/7 Market Access',
      description: 'Trade cryptocurrencies anytime with real-time market data'
    },
    {
      title: 'Advanced Trading Tools',
      description: 'Professional charts and analytics for informed decisions'
    }
  ]

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
        {/* Carousel Section */}
        <div className="relative mb-12">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg border border-slate-700/50 p-8 min-h-[280px] flex flex-col justify-center items-center relative overflow-hidden">
            {/* Carousel content */}
            <button
              onClick={() => setCarouselIndex((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-700/50 rounded-lg transition"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-blue-400 mb-2">{carouselSlides[carouselIndex].title}</h2>
              <p className="text-slate-400">{carouselSlides[carouselIndex].description}</p>
            </div>

            <button
              onClick={() => setCarouselIndex((prev) => (prev + 1) % carouselSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-700/50 rounded-lg transition"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Carousel indicators */}
            <div className="absolute bottom-4 flex gap-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`w-2 h-2 rounded-full transition ${
                    index === carouselIndex ? 'bg-blue-500' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700/50 p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-slate-400 text-sm mb-2">AVAILABLE BALANCE</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-bold text-white">
                      {showBalance ? '0.00' : '••••'}
                    </h3>
                    <span className="text-slate-400">USD</span>
                  </div>
                  <p className="text-blue-400 text-sm mt-2">Welcome back, bereket1terefe@gmail.com</p>
                </div>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition"
                >
                  {showBalance ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-4">
                <button className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-slate-800/50 transition group">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center group-hover:border-blue-400 transition">
                    <ArrowDown className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                  </div>
                  <span className="text-slate-400 text-xs">Deposit</span>
                </button>

                <button className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-slate-800/50 transition group">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center group-hover:border-blue-400 transition">
                    <BarChart3 className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                  </div>
                  <span className="text-slate-400 text-xs">Trade</span>
                </button>

                <button className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-slate-800/50 transition group">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center group-hover:border-blue-400 transition">
                    <ArrowUp className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                  </div>
                  <span className="text-slate-400 text-xs">Withdraw</span>
                </button>

                <button className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-slate-800/50 transition group">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center group-hover:border-blue-400 transition">
                    <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                  </div>
                  <span className="text-slate-400 text-xs">Demo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Deposit Button */}
          <div className="flex items-start justify-end">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-blue-500">
              <ArrowDown className="w-4 h-4 mr-2" />
              Deposit
            </Button>
          </div>
        </div>

        {/* Market Overview */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Market Overview</h2>
            <p className="text-slate-400">Real-time cryptocurrency prices and trends</p>
          </div>

          {/* Crypto Table */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700/50 overflow-hidden">
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
                  {cryptoData.map((crypto, index) => (
                    <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 text-slate-400 text-sm">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${crypto.color} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                            {crypto.icon}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{crypto.symbol}</p>
                            <p className="text-slate-400 text-xs">{crypto.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-medium text-sm">${crypto.price}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${crypto.change.includes('+') ? 'text-cyan-400' : 'text-red-400'}`}>
                          {crypto.change}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">--</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">--</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">--</td>
                      <td className="px-6 py-4">
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-500 hover:bg-blue-500/10 bg-transparent">
                          Trade
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
