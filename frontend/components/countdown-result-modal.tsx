'use client'

import React, { useState, useEffect } from 'react'
import { CircularCountdown } from './circular-countdown'

interface Asset {
  symbol: string
  name: string
  price: number
}

interface CountdownResultModalProps {
  isOpen: boolean
  onClose: () => void
  tradeData: {
    type: 'buy' | 'sell'
    asset: Asset
    amount: number
    expirationTime: string
    estimatedReturn: number
    currentPrice: number
  } | null
}

interface TradeResult {
  won: boolean
  returned: number
}

export function CountdownResultModal({
  isOpen,
  onClose,
  tradeData
}: CountdownResultModalProps) {
  const [countdownActive, setCountdownActive] = useState(false)
  const [result, setResult] = useState<TradeResult | null>(null)
  const [livePrice, setLivePrice] = useState<number | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && tradeData) {
      setCountdownActive(true)
      setResult(null)
      setLivePrice(tradeData.currentPrice)
    }

  }, [isOpen, tradeData])

  // Simulate live price ONLY while countdown is running
  useEffect(() => {
    if (!countdownActive || result || !tradeData) return

    const interval = setInterval(() => {
      setLivePrice(
        tradeData.currentPrice * (0.98 + Math.random() * 0.04)
      )
    }, 1000)
   
    return () => clearInterval(interval)
  }, [countdownActive, result, tradeData])

  // Decide result ONCE when countdown ends
  const handleCountdownComplete = () => {
    if (!tradeData) return

    const won = Math.random() > 0.4
   
    const returned = won
      ? tradeData.amount * (1 + tradeData.estimatedReturn / 100)
      : tradeData.amount * 0.7

    setResult({ won, returned })
    setCountdownActive(false)
  }

  
  if (!isOpen || !tradeData) return null

  const pair = `${tradeData.asset.symbol}/USDT`
  const tradeTypeLabel = tradeData.type === 'buy' ? 'Buy Long' : 'Sell Short'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-950">
          <h2 className="text-2xl font-bold text-white text-center">{pair}</h2>
          <p className="text-slate-400 text-center mt-1">Binary Option</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Countdown */}
          <div className="flex justify-center">
            <CircularCountdown
              duration={parseInt(tradeData.expirationTime)}
              isActive={countdownActive}
              onComplete={handleCountdownComplete}
            />
          </div>

          {/* Trade Details */}
          <div className="space-y-4 text-sm">
            <DetailRow label="Direction">
              <span className={`font-semibold text-lg ${
                tradeData.type === 'buy'
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}>
                {tradeTypeLabel}
              </span>
            </DetailRow>

            <DetailRow label="Stake">
              <span className="font-semibold">
                {tradeData.amount.toFixed(2)} USDT
              </span>
            </DetailRow>

            <DetailRow label="Purchase Price">
              <span className="font-semibold">
                ${tradeData.currentPrice.toFixed(4)}
              </span>
            </DetailRow>

            <DetailRow label="Current Price">
              <span className="font-semibold">
                ${(livePrice ?? tradeData.currentPrice).toFixed(4)}
              </span>
            </DetailRow>
          </div>

          {/* Result */}
          {result && (
            <>
              <div className="border-t border-slate-700 pt-4 text-center space-y-3">
                <div className={`text-4xl font-bold ${
                  result.won ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {result.won ? 'You Won!' : 'You Lost!'}
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Returned</p>
                  <p className={`text-2xl font-bold ${
                    result.won ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {result.returned.toFixed(2)} USDT
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg font-semibold text-white
                  bg-gradient-to-r from-cyan-500 to-cyan-600
                  hover:shadow-lg hover:shadow-cyan-500/50 transition"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* Small helper */
function DetailRow({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between text-slate-300">
      <span className="text-slate-400">{label}:</span>
      {children}
    </div>
  )
}

