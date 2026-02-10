'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight, Copy, Share2, AlertCircle, CheckCircle, Clock, Trophy, TrendingUp, TrendingDown, Star } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const pathname = usePathname()
  const activeTab = pathname === '/settings' ? 'dashboard' : pathname.includes('identity') ? 'identity' : pathname.includes('history') ? 'history' : 'security'
  const [copiedCode, setCopiedCode] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/settings' },
    { id: 'identity', label: 'Identity Verification', icon: '🔐', href: '/settings/identity-verification' },
    { id: 'history', label: 'Spot History', icon: '📝', href: '/settings/spot-history' },
    { id: 'security', label: 'Security', icon: '🛡️', href: '/settings/security' },
  ]

  const statCards = [
    { label: 'Total Deposits', value: '$0', icon: '⬇️' },
    { label: 'Total Withdrawals', value: '$0', icon: '⬆️' },
    { label: 'Trading Volume', value: '$0', icon: '📊' },
    { label: 'ROI', value: '+0%', icon: '$' },
  ]

  const favoritePairs = [
    { pair: 'BTC/USDT', change: '-5.65%', negative: true },
    { pair: 'ETH/USDT', change: '-11.43%', negative: true },
    { pair: 'BNB/USDT', change: '-7.75%', negative: true },
  ]

  const topGainers = [
    { pair: 'CREAM/USDT', price: '$0.1', change: '+65.35%' },
    { pair: 'PNT/USDT', price: '$0.155', change: '+45.23%' },
    { pair: 'RAD/USDT', price: '$0.341', change: '+32.17%' },
  ]

  const topLosers = [
    { pair: 'BETA/USDT', price: '$0.1', change: '-64.00%' },
    { pair: 'VIB/USDT', price: '$0.11', change: '-63.26%' },
    { pair: 'WTC/USDT', price: '$0.31', change: '-56.54%' },
  ]

  const watchlist = [
    { pair: 'CREAM/USDT', change: '+65.35%' },
    { pair: 'PNT/USDT', change: '+45.23%' },
  ]

  const achievements = [
    { title: 'First Trade', description: 'Complete your first trade', current: 0, total: 1, icon: '🎯', percentage: 0 },
    { title: 'Rising Star', description: 'Complete 10 trades', current: 0, total: 10, icon: '⭐', percentage: 0 },
    { title: 'Trading Master', description: 'Complete 50 trades', current: 0, total: 50, icon: '👑', percentage: 0 },
    { title: 'Win Streak', description: 'Win 5 trades in a row', current: 0, total: 5, icon: '🔥', percentage: 0 },
    { title: 'Profit Maker', description: 'Earn $1,000 in profit', current: 0, total: 1000, icon: '💰', percentage: 0 },
    { title: 'Big Spender', description: 'Deposit $5,000 total', current: 0, total: 5000, icon: '💵', percentage: 0 },
  ]

  const handleCopyCode = () => {
    navigator.clipboard.writeText('F1A7F06N')
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700/50 sticky top-0 z-40 bg-gradient-to-b from-slate-950 to-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">₿</span>
              </div>
              <span className="text-white font-bold text-lg">BIT TRADING</span>
            </div>
          </div>

          <nav className="flex items-center gap-4 sm:gap-8 text-sm mb-6">
            <Link href="/" className="text-slate-400 hover:text-white transition">Home</Link>
            <Link href="/market" className="text-slate-400 hover:text-white transition">Market</Link>
            <Link href="/news" className="text-slate-400 hover:text-white transition">News</Link>
            <Link href="/assets" className="text-slate-400 hover:text-white transition">Assets</Link>
            <span className="text-blue-400 font-semibold transition">Settings</span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account settings, security, and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b border-slate-700/50 pb-4">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Portfolio Performance & Security Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Performance */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📊</span>
                  <h2 className="text-lg font-semibold text-white">Portfolio Performance</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Total P&L</p>
                    <p className="text-3xl font-bold text-white">$0.00</p>
                    <p className="text-slate-400 text-xs">0 Trades 0 coins</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[{ period: '24h', value: '$0.00' }, { period: '7d', value: '$0.00' }, { period: '30d', value: '$0.00' }].map((item, idx) => (
                      <div key={idx} className="bg-slate-900/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-2">{item.period}</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <TrendingUp size={14} /> {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-blue-400">📈</span>
                        <span className="text-sm">Win Rate</span>
                      </div>
                      <p className="text-white font-semibold">0%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🛡️</span>
                  <h2 className="text-lg font-semibold text-white">Security Status</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-sm">Security Score</p>
                      <p className="text-white font-semibold">25%</p>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-400" />
                        <span className="text-white">Email Verified</span>
                      </div>
                      <CheckCircle size={18} className="text-green-400" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="text-slate-400" />
                        <span className="text-white">Identity Verified</span>
                      </div>
                      <AlertCircle size={18} className="text-slate-400" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="text-slate-400" />
                        <span className="text-white">2FA Enabled</span>
                      </div>
                      <AlertCircle size={18} className="text-slate-400" />
                    </div>

                    <div className="pt-4 border-t border-slate-700/50 text-xs text-slate-400">
                      <p className="flex items-center gap-2">
                        <Clock size={14} /> Last login: Jan 31, 2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Allocation & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Allocation */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">💼</span>
                  <h2 className="text-lg font-semibold text-white">Asset Allocation</h2>
                </div>
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-400">No assets to display</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">⚡</span>
                  <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 text-center hover:bg-slate-600/50 transition">
                    <div className="text-2xl mb-2">⬇️</div>
                    <p className="text-white text-sm font-medium">Quick Buy</p>
                  </button>
                  <button className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 text-center hover:bg-slate-600/50 transition">
                    <div className="text-2xl mb-2">⬆️</div>
                    <p className="text-white text-sm font-medium">Quick Sell</p>
                  </button>
                  <button className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 text-center hover:bg-slate-600/50 transition">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-white text-sm font-medium">Trade Now</p>
                  </button>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-3 flex items-center gap-2">
                    <Star size={16} className="text-yellow-400" /> Favorite Pairs
                  </p>
                  <div className="space-y-2">
                    {favoritePairs.map((pair, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
                        <span className="text-white text-sm">{pair.pair}</span>
                        <span className={`text-sm font-semibold ${pair.negative ? 'text-red-400' : 'text-green-400'}`}>
                          {pair.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Program & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Referral Program */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🔗</span>
                  <h2 className="text-lg font-semibold text-white">Referral Program</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Your Referral Code</p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2 flex items-center">
                        <span className="text-blue-400 font-mono font-bold">F1A7F06N</span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                      >
                        <Copy size={16} />
                      </button>
                      <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                        <Share2 size={16} />
                      </button>
                    </div>
                    {copiedCode && <p className="text-green-400 text-xs mt-2">Copied to clipboard!</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/50">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs mb-1">Total</p>
                      <p className="text-white font-bold text-lg">0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs mb-1">Active</p>
                      <p className="text-white font-bold text-lg">0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs mb-1">Earnings</p>
                      <p className="text-white font-bold text-lg">$0.00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🔔</span>
                  <h2 className="text-lg font-semibold text-white">Notifications</h2>
                </div>
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-400">No notifications</p>
                </div>
              </div>
            </div>

            {/* Recent Activity & Market Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                  </div>
                  <button className="text-slate-400 hover:text-white">⚙️</button>
                </div>
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-400">No recent activity</p>
                </div>
              </div>

              {/* Market Overview */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌍</span>
                    <h2 className="text-lg font-semibold text-white">Market Overview</h2>
                  </div>
                  <Link href="/market" className="text-blue-400 hover:text-blue-300 text-sm">View All</Link>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-xs mb-3 font-semibold">Top Gainers</p>
                    {topGainers.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-white">{item.pair}</span>
                        <span className="text-green-400 font-semibold flex items-center gap-1">
                          <TrendingUp size={14} /> {item.change}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-slate-400 text-xs mb-3 font-semibold">Top Losers</p>
                    {topLosers.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-white">{item.pair}</span>
                        <span className="text-red-400 font-semibold flex items-center gap-1">
                          <TrendingDown size={14} /> {item.change}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-slate-400 text-xs mb-3 font-semibold">Watchlist</p>
                    {watchlist.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-white flex items-center gap-2">
                          <Star size={14} className="text-yellow-400" /> {item.pair}
                        </span>
                        <span className="text-green-400 font-semibold">{item.change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">🏆</span>
                <h2 className="text-lg font-semibold text-white">Achievements</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, idx) => (
                  <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <p className="text-white font-semibold text-sm">{achievement.title}</p>
                          <p className="text-slate-400 text-xs">{achievement.description}</p>
                        </div>
                      </div>
                      <span className="text-slate-400 text-xs font-semibold">{achievement.percentage}%</span>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${achievement.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-slate-400 text-xs text-center">
                        {achievement.current}/{achievement.total}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs - Placeholder */}
        {activeTab !== 'dashboard' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-12 text-center">
            <p className="text-slate-400 text-lg">Coming soon...</p>
          </div>
        )}
      </main>
    </div>
  )
}
