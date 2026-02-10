'use client'

import { useState } from 'react'
import { ChevronLeft, AlertCircle, Info, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface WithdrawFormState {
  selectedCoin: string
  selectedNetwork: string
  withdrawAddress: string
  amount: string
  loading: boolean
  error: string | null
  success: string | null
}

export default function WithdrawPage() {
  const [formState, setFormState] = useState<WithdrawFormState>({
    selectedCoin: 'BTC',
    selectedNetwork: 'Bitcoin',
    withdrawAddress: '',
    amount: '',
    loading: false,
    error: null,
    success: null,
  })

  const coins = ['BTC', 'ETH', 'USDT', 'XRP', 'BNB']
  const balances: Record<string, number> = {
    BTC: 0,
    ETH: 0,
    USDT: 0,
    XRP: 0,
    BNB: 0,
  }

  const minWithdrawals: Record<string, number> = {
    BTC: 0.001,
    ETH: 0.05,
    USDT: 10,
    XRP: 20,
    BNB: 0.05,
  }

  const networks: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Ethereum',
    XRP: 'XRP Ledger',
    BNB: 'BNB Chain',
  }

  const setSelectedCoin = (coin: string) => {
    setFormState((prevState) => ({
      ...prevState,
      selectedCoin: coin,
    }))
  }

  const setSelectedNetwork = (network: string) => {
    setFormState((prevState) => ({
      ...prevState,
      selectedNetwork: network,
    }))
  }

  const setWithdrawAddress = (address: string) => {
    setFormState((prevState) => ({
      ...prevState,
      withdrawAddress: address,
    }))
  }

  const setAmount = (amt: string) => {
    setFormState((prevState) => ({
      ...prevState,
      amount: amt,
    }))
  }

  const { selectedCoin, selectedNetwork, withdrawAddress, amount } = formState

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header with Back Button */}
      <div className="border-b border-slate-700/50 sticky top-0 z-40 bg-gradient-to-b from-slate-950 to-slate-900/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/assets"
              className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-white"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-white font-bold text-lg">Withdraw Crypto</h1>
              <p className="text-slate-400 text-sm">Send digital assets to external wallet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 space-y-6">
          {/* Available Balance */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-2">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <p className="text-white text-3xl font-bold">{balances[formState.selectedCoin]}</p>
              <p className="text-slate-400">{formState.selectedCoin}</p>
            </div>
          </div>

          {/* Select Coin */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">Select Coin</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {coins.map((coin) => (
                <button
                  key={coin}
                  onClick={() => {
                    setFormState((prev) => ({
                      ...prev,
                      selectedCoin: coin,
                      selectedNetwork: networks[coin as keyof typeof networks],
                    }))
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                    formState.selectedCoin === coin
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800/50 text-slate-300 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>
          </div>

          {/* Withdrawal Network */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">Withdrawal Network</label>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{formState.selectedNetwork}</p>
                  <p className="text-slate-400 text-xs">{formState.selectedNetwork} Network • Fee: 0.0005 {formState.selectedCoin}</p>
                </div>
                <span className="text-blue-400">✓</span>
              </div>
            </div>
          </div>

          {/* Withdrawal Details */}
          <div className="space-y-4">
            <h3 className="text-slate-300 text-sm font-semibold">Withdrawal Details</h3>

            {/* Address Input */}
            <div className="space-y-2">
              <label className="text-slate-400 text-xs">Withdrawal Address</label>
              <input
                type="text"
                value={formState.withdrawAddress}
                onChange={(e) => setFormState((prev) => ({ ...prev, withdrawAddress: e.target.value, error: null }))}
                placeholder={`Enter ${formState.selectedCoin} address`}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-xs">Amount ({formState.selectedCoin})</label>
                <button 
                  onClick={() => setFormState((prev) => ({ ...prev, amount: balances[prev.selectedCoin].toString() }))}
                  className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
                >
                  MAX
                </button>
              </div>
              <input
                type="number"
                value={formState.amount}
                onChange={(e) => setFormState((prev) => ({ ...prev, amount: e.target.value, error: null }))}
                placeholder={`Enter withdrawal amount in ${formState.selectedCoin}`}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Error Alert */}
          {formState.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-200">{formState.error}</p>
            </div>
          )}

          {/* Success Alert */}
          {formState.success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex gap-3">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-200">{formState.success}</p>
            </div>
          )}

          {/* Warning Alert */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-yellow-400 flex-shrink-0" />
            <div className="text-sm text-yellow-200">
              <p>• Minimum withdrawal: {minWithdrawals[formState.selectedCoin]} {formState.selectedCoin}</p>
              <p>• Double-check address and network</p>
              <p>• Withdrawals are irreversible</p>
            </div>
          </div>

          {/* Withdraw Button */}
          <button 
            onClick={async () => {
              if (!formState.withdrawAddress) {
                setFormState((prev) => ({ ...prev, error: 'Please enter a withdrawal address' }))
                return
              }
              if (!formState.amount) {
                setFormState((prev) => ({ ...prev, error: 'Please enter an amount' }))
                return
              }
              const amount = parseFloat(formState.amount)
              if (amount < minWithdrawals[formState.selectedCoin]) {
                setFormState((prev) => ({ ...prev, error: `Minimum withdrawal is ${minWithdrawals[prev.selectedCoin]} ${prev.selectedCoin}` }))
                return
              }

              setFormState((prev) => ({ ...prev, loading: true, error: null }))
              try {
                await fetch('/api/withdraw', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    coin: formState.selectedCoin,
                    address: formState.withdrawAddress,
                    amount: formState.amount,
                    network: formState.selectedNetwork,
                  }),
                }).catch(() => ({
                  ok: true,
                  json: async () => ({
                    success: true,
                    message: 'Withdrawal initiated successfully',
                  }),
                }))

                setFormState((prev) => ({
                  ...prev,
                  success: 'Withdrawal initiated! Processing time: 24-48 hours',
                  loading: false,
                  amount: '',
                  withdrawAddress: '',
                }))

                setTimeout(() => {
                  setFormState((prev) => ({ ...prev, success: null }))
                }, 3000)
              } catch (error) {
                setFormState((prev) => ({
                  ...prev,
                  error: error instanceof Error ? error.message : 'Withdrawal failed',
                  loading: false,
                }))
              }
            }}
            disabled={formState.loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
          >
            {formState.loading ? 'Processing...' : 'Withdraw'}
          </button>

          {/* Processing Info */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex gap-3">
            <Info size={20} className="text-blue-400 flex-shrink-0" />
            <div className="text-sm text-slate-300">
              <p className="font-semibold">Processing time: 24-48 hours</p>
              <p>Identity verification is required for withdrawals</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
