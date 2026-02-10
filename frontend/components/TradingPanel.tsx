'use client'

import React, { useState } from 'react'

interface TradingPanelProps {
  pair: string
  price: number
  assetClass: 'crypto' | 'forex' | 'gold'
  user: any
  isAuthenticated: boolean
  onOpenTradeModal: (type: 'buy' | 'sell') => void
}

export function TradePanel({
  pair,
  price,
  assetClass,
  user,
  isAuthenticated,
  onOpenTradeModal
}: TradingPanelProps) {
  const [quantity, setQuantity] = useState<number | ''>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Allow empty string so user can clear input
    if (val === '') {
      setQuantity('')
      return
    }
    const num = Number(val)
    if (!isNaN(num)) setQuantity(num)
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-4">
      <h3 className="text-white font-semibold">{`Trade ${pair}`}</h3>

      {/* Trading Buttons */}
      <div className="flex gap-2">
        {(['buy', 'sell'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              if (!isAuthenticated || !user) return
              onOpenTradeModal(type)
            }}
            disabled={!isAuthenticated || !user}
            className={`flex-1 py-2 rounded font-semibold text-white transition ${
              type === 'buy'
                ? 'bg-green-500 hover:bg-green-600 disabled:opacity-50'
                : 'bg-red-500 hover:bg-red-600 disabled:opacity-50'
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Amount Input (Editable, No Label) */}
      
    </div>
  )
}
