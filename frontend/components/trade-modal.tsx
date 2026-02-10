'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { CircularCountdown } from './circular-countdown'
import { executeTrade, type Asset, type TradeResult } from '@/lib/api-two'
import { useAuth } from '@/hooks/useAuth'

interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'buy' | 'sell'
  asset: Asset
  onTradeComplete?: (result: TradeResult) => void
}

interface ExpirationOption {
  label: string
  seconds: number
  percent: number
  min: number
  max: number
}

const EXPIRATION_OPTIONS: ExpirationOption[] = [
  { label: '30s', seconds: 30, percent: 12, min: 500, max: 5_000 },
  { label: '60s', seconds: 60, percent: 15, min: 5_000, max: 20_000 },
  { label: '90s', seconds: 90, percent: 18, min: 20_000, max: 50_000 },
  { label: '120s', seconds: 120, percent: 21, min: 50_000, max: 90_000 },
  { label: '180s', seconds: 180, percent: 24, min: 90_000, max: 200_000 },
  { label: '360s', seconds: 360, percent: 27, min: 200_000, max: 1_000_000 }
]

export function TradeModal({
  isOpen,
  onClose,
  type,
  asset,
  onTradeComplete
}: TradeModalProps) {
  const { user, isAuthenticated } = useAuth()

  const [amount, setAmount] = useState<number | ''>('')
  const [selected, setSelected] = useState(EXPIRATION_OPTIONS[0])

  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownActive, setCountdownActive] = useState(false)

  const [tradeResultTemp, setTradeResultTemp] = useState<TradeResult | null>(null)
  const [result, setResult] = useState<TradeResult | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setAmount('')
      setSelected(EXPIRATION_OPTIONS[0])
      setShowCountdown(false)
      setCountdownActive(false)
      setTradeResultTemp(null)
      setResult(null)
      setIsLoading(false)
    }
  }, [isOpen])

  const estimatedIncome =
    amount !== '' ? amount + amount * (selected.percent / 100) : null

  const handleQuickAmount = (p: number) => {
    setAmount(Math.round(10_000 * (p / 100)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isAuthenticated || amount === '') return

    setIsLoading(true)
    setShowCountdown(true)
    setCountdownActive(true)

    try {
      const res = await executeTrade(
        user.id,
        type,
        asset,
        amount,
        selected.seconds
      )
      setTradeResultTemp(res)
    } catch (err) {
      console.error(err)
      setShowCountdown(false)
      setCountdownActive(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCountdownComplete = useCallback(() => {
    setCountdownActive(false)

    if (tradeResultTemp) {
      setResult(tradeResultTemp)
      onTradeComplete?.(tradeResultTemp)
    }
  }, [tradeResultTemp, onTradeComplete])

  // Cancel countdown / trade
  const handleCancelTrade = () => {
    setCountdownActive(false)
    setShowCountdown(false)
    setTradeResultTemp(null)
    setResult(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-blue-900 bg-gradient-to-b from-[#0b1d33] to-[#050b18] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900 bg-[#050b18] p-5">
          <h2 className="text-xl font-bold text-white">
            {asset.symbol}/USDT
          </h2>

          {/* Always show X button to close or cancel trade */}
          <button
            onClick={showCountdown ? handleCancelTrade : onClose}
            className="text-slate-400 hover:text-white"
          >
            <X />
          </button>
        </div>

        {!showCountdown ? (
          /* ---------------- FORM ---------------- */
          <form onSubmit={handleSubmit} className="space-y-6 p-6">

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Trade Amount (USDT)
              </label>

              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  e.target.value === ''
                    ? setAmount('')
                    : setAmount(Number(e.target.value))
                }
                className="no-spinner w-full rounded-lg border border-blue-900 bg-[#08162b] px-4 py-3 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                placeholder="Enter amount"
              />

              <div className="mt-3 grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleQuickAmount(p)}
                    className="rounded-lg border border-blue-900 bg-[#08162b] py-2 text-xs text-slate-300 hover:border-cyan-400"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* Expiration */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Expiration Time
              </label>

              <div className="grid grid-cols-3 gap-3">
                {EXPIRATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.seconds}
                    type="button"
                    onClick={() => setSelected(opt)}
                    className={`rounded-xl border p-3 transition ${
                      selected.seconds === opt.seconds
                        ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                        : 'border-blue-900 hover:border-cyan-500'
                    }`}
                  >
                    <div className="text-sm font-bold text-white">
                      {opt.label}
                    </div>
                    <div className="text-xs text-cyan-400">
                      +{opt.percent}%
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated */}
            <div className="rounded-xl border border-blue-900 bg-[#08162b] p-4">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Estimated Income</span>
                <span className="font-bold text-emerald-400">
                  {estimatedIncome
                    ? `${estimatedIncome.toLocaleString()} USDT`
                    : '--'}
                </span>
              </div>
            </div>

            {/* Min / Max */}
            <div className="flex justify-between text-xs text-slate-400">
              <span>MIN: {selected.min.toLocaleString()} USD</span>
              <span>MAX: {selected.max.toLocaleString()} USD</span>
            </div>

            <button
              type="submit"
              disabled={!isAuthenticated || amount === ''}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/40 disabled:opacity-50"
            >
              Place Trade
            </button>
          </form>
        ) : (
          /* ---------------- COUNTDOWN / RESULT ---------------- */
          <div className="space-y-6 p-6">

            <div className="flex justify-center">
              <CircularCountdown
                duration={selected.seconds}
                isActive={countdownActive}
                onComplete={handleCountdownComplete}
              />
            </div>

            {result && (
              <>
                <div className="space-y-3 text-center">
                  <div
                    className={`text-3xl font-bold ${
                      result.outcome === 'WIN'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {result.outcome === 'WIN' ? 'You Won!' : 'You Lost'}
                  </div>

                  <div className="text-slate-400">
                    Returned:{' '}
                    <span className="font-semibold text-white">
                      {result.returnedAmount.toLocaleString()} USDT
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/40"
                >
                  Close
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
