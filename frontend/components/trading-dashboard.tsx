'use client'

import { useState, useEffect, useMemo } from 'react'
import { CryptoChart } from '@/components/crypto-chart'
import { ForexChart } from '@/components/forex-chart'
import { GoldChart } from '@/components/gold-chart'
import { TradeModal } from './trade-modal'
import { useAuth } from '@/hooks/useAuth'

interface Market {
  symbol: string
  name: string
  price: number
  change: number
}

interface TradingDashboardProps {
  tab: 'crypto' | 'forex' | 'gold'
  onTrade?: (
    type: 'buy' | 'sell',
    userId: string,
    symbol: string,
    name: string,
    price: number,
    assetClass: 'crypto' | 'forex' | 'gold'
  ) => void
}

export function TradingDashboard({ tab, onTrade }: TradingDashboardProps) {
  const { user, isAuthenticated } = useAuth()

  // ---------------- States ----------------
  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [markets, setMarkets] = useState<Market[]>([])
  const [bids, setBids] = useState<any[]>([])
  const [asks, setAsks] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const [quantity, setQuantity] = useState(0) // <-- added

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'buy' | 'sell'>('buy')
  const [searchQuery, setSearchQuery] = useState('')

  // ---------------- Fetch Market List ----------------
  useEffect(() => {
    if (tab !== 'crypto') return

    const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr')
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data) as any[]
      const marketList: Market[] = data
        .filter(t => t.s.endsWith('USDT'))
        .map(t => ({
          symbol: t.s.slice(0, -4) + '/USDT',
          name: t.s.slice(0, -4),
          price: parseFloat(t.c),
          change: parseFloat(t.P)
        }))
      setMarkets(marketList)
    }
    return () => ws.close()
  }, [tab])

  // ---------------- Order Book ----------------
  useEffect(() => {
    if (!selectedPair) return
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedPair.replace('/', '').toLowerCase()}@depth20@100ms`)
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data)
      setBids(data.bids)
      setAsks(data.asks)
    }
    return () => ws.close()
  }, [selectedPair])

  // ---------------- Recent Trades ----------------
  useEffect(() => {
    if (!selectedPair) return
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedPair.replace('/', '').toLowerCase()}@trade`)
    ws.onmessage = (msg) => {
      const t = JSON.parse(msg.data)
      setTrades(prev => [{ price: parseFloat(t.p), amount: parseFloat(t.q) }, ...prev].slice(0, 20))
    }
    return () => ws.close()
  }, [selectedPair])

  // ---------------- Filtered Markets ----------------
  const filteredMarkets = useMemo(() => {
    return markets.filter(m =>
      m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [markets, searchQuery])

  const currentPrice = markets.find(m => m.symbol === selectedPair)?.price ?? 0
  const currentChange = markets.find(m => m.symbol === selectedPair)?.change ?? 0

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ---------------- Left Sidebar: Market List ---------------- */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 sticky top-24">
            <input
              type="text"
              placeholder="Search pairs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white mb-4"
            />
            <div className="space-y-2 max-h-[80vh] overflow-y-auto">
              {filteredMarkets.map(market => {
                const isPositive = market.change >= 0
                return (
                  <button
                    key={market.symbol}
                    onClick={() => setSelectedPair(market.symbol)}
                    className={`w-full px-3 py-2 rounded ${
                      selectedPair === market.symbol ? 'bg-blue-500/20 border border-blue-500/50' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">{market.name}</div>
                        <div className="text-slate-400 text-xs">{market.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">{market.price.toFixed(2)}</div>
                        <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{market.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ---------------- Center Chart ---------------- */}
        <div className="lg:col-span-2">
          {tab === 'crypto' && <CryptoChart pair={selectedPair} price={currentPrice} change24h={currentChange} />}
          {tab === 'forex' && <ForexChart pair={selectedPair} price={currentPrice} change24h={currentChange} />}
          {tab === 'gold' && <GoldChart pair={selectedPair} price={currentPrice} change24h={currentChange} />}
        </div>

        {/* ---------------- Right Sidebar ---------------- */}
        <div className="space-y-6">
          {/* Order Book */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">Order Book</h3>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-red-400 font-medium">Bids</span>
              <span className="text-green-400 font-medium">Asks</span>
            </div>
            <div className="flex gap-2 max-h-[60vh] overflow-y-auto">
              <div className="flex-1">
                {bids.map(([p, a], i) => (
                  <div key={i} className="flex justify-between text-xs text-red-400">
                    <span>{parseFloat(p).toFixed(2)}</span>
                    <span>{parseFloat(a).toFixed(6)}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1">
                {asks.map(([p, a], i) => (
                  <div key={i} className="flex justify-between text-xs text-green-400">
                    <span>{parseFloat(p).toFixed(2)}</span>
                    <span>{parseFloat(a).toFixed(6)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">Trade {selectedPair}</h3>

            {!isAuthenticated && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-2 text-sm text-red-300 mb-3">
                You must be logged in to place a trade.
              </div>
            )}

            <div className="flex gap-2 mb-4">
              {(['buy', 'sell'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    if (!isAuthenticated || !user) return
                    onTrade?.(
                      type,
                      user.id,
                      selectedPair.split('/')[0],
                      selectedPair,
                      currentPrice,
                      tab
                    )
                  }}
                  disabled={!isAuthenticated || !user}
                  className={`flex-1 py-2 rounded font-semibold text-white ${
                    type === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(+e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
              disabled={!isAuthenticated || !user}
              min={0}
            />

            <div className="mt-2 text-white text-sm">
              Total: <span className="font-medium">{(quantity * currentPrice).toFixed(2)}</span>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">Recent Trades</h3>
            {trades.map((t, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-white">{t.price.toFixed(2)}</span>
                <span className="text-green-400">{t.amount.toFixed(6)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Trade Modal ---------------- */}
      {modalOpen && (
        <TradeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          asset={{ symbol: selectedPair.split('/')[0], price: currentPrice } as any}
        />
      )}
    </>
  )
}
