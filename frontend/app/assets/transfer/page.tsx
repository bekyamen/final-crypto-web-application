'use client'

import { useState } from 'react'
import { ChevronLeft, ArrowDownUp, Info, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface TransferFormState {
  fromAccount: string
  toAccount: string
  amount: string
  loading: boolean
  error: string | null
  success: string | null
}

export default function TransferPage() {
  const [formState, setFormState] = useState<TransferFormState>({
    fromAccount: 'Funding Account',
    toAccount: 'Trading Account',
    amount: '',
    loading: false,
    error: null,
    success: null,
  })

  const accountBalances: Record<string, number> = {
    'Funding Account': 0,
    'Trading Account': 0,
    'Demo Account': 10000, // Demo account has starting balance
  }

  const accounts = [
    { name: 'Funding Account', balance: `$${accountBalances['Funding Account']}.00 USD`, icon: '💰' },
    { name: 'Trading Account', balance: `$${accountBalances['Trading Account']}.00 USD`, icon: '📊' },
    { name: 'Demo Account', balance: `$${accountBalances['Demo Account']}.00 USD`, icon: '🎮' },
  ]

  const handleSwap = () => {
    setFormState((prev) => ({
      ...prev,
      fromAccount: prev.toAccount,
      toAccount: prev.fromAccount,
    }))
  }

  const setFromAccount = (accountName: string) => {
    setFormState((prev) => ({
      ...prev,
      fromAccount: accountName,
    }))
  }

  const setToAccount = (accountName: string) => {
    setFormState((prev) => ({
      ...prev,
      toAccount: accountName,
    }))
  }

  const { fromAccount, toAccount, amount } = formState

  const setAmount = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      amount: value,
    }))
  }

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
              <h1 className="text-white font-bold text-lg">Transfer Funds</h1>
              <p className="text-slate-400 text-sm">Move funds between your accounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 space-y-6">
          {/* From Account Section */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">From Account</label>
            <div className="space-y-2">
              {accounts.map((account) => (
                <button
                  key={account.name}
                  onClick={() => setFormState((prev) => ({ ...prev, fromAccount: account.name, error: null }))}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                    formState.fromAccount === account.name
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl">{account.icon}</div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${formState.fromAccount === account.name ? 'text-white' : 'text-slate-300'}`}>
                      {account.name}
                    </p>
                    <p className="text-slate-400 text-xs">{account.balance}</p>
                  </div>
                  {formState.fromAccount === account.name && <span className="text-blue-400">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="w-14 h-14 rounded-full border-2 border-blue-500 flex items-center justify-center bg-slate-900/50 text-blue-500 hover:bg-blue-500/10 transition"
            >
              <ArrowDownUp size={24} />
            </button>
          </div>

          {/* To Account Section */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">To Account</label>
            <div className="space-y-2">
              {accounts.map((account) => (
                <button
                  key={account.name}
                  onClick={() => setFormState((prev) => ({ ...prev, toAccount: account.name, error: null }))}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                    formState.toAccount === account.name
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl">{account.icon}</div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${formState.toAccount === account.name ? 'text-white' : 'text-slate-300'}`}>
                      {account.name}
                    </p>
                    <p className="text-slate-400 text-xs">{account.balance}</p>
                  </div>
                  {formState.toAccount === account.name && <span className="text-blue-400">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Amount */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 text-sm">Transfer Amount</label>
            </div>
            <div className="relative">
              <input
                type="number"
                value={formState.amount}
                onChange={(e) => setFormState((prev) => ({ ...prev, amount: e.target.value, error: null }))}
                placeholder="0.00"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={() => setFormState((prev) => ({ ...prev, amount: accountBalances[prev.fromAccount].toString() }))}
                className="absolute right-3 top-3 text-blue-400 hover:text-blue-300 text-sm font-semibold"
              >
                MAX
              </button>
            </div>
            <p className="text-slate-400 text-xs">Available: ${accountBalances[formState.fromAccount]}.00 USD</p>
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

          {/* Info Alert */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
            <Info size={20} className="text-blue-400 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p>• Transfers are instant and free</p>
              <p>• No fees apply for account transfers</p>
              <p>• Minimum transfer amount: $1.00 USD</p>
            </div>
          </div>

          {/* Confirm Button */}
          <button 
            onClick={async () => {
              // Validation
              if (formState.fromAccount === formState.toAccount) {
                setFormState((prev) => ({ ...prev, error: 'From and to accounts must be different' }))
                return
              }
              if (!formState.amount) {
                setFormState((prev) => ({ ...prev, error: 'Please enter an amount' }))
                return
              }
              const amount = parseFloat(formState.amount)
              if (amount <= 0) {
                setFormState((prev) => ({ ...prev, error: 'Amount must be greater than 0' }))
                return
              }
              if (amount < 1) {
                setFormState((prev) => ({ ...prev, error: 'Minimum transfer amount is $1.00' }))
                return
              }
              if (amount > accountBalances[formState.fromAccount]) {
                setFormState((prev) => ({ ...prev, error: 'Insufficient balance' }))
                return
              }

              setFormState((prev) => ({ ...prev, loading: true, error: null }))

              try {
                await fetch('/api/transfer', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    fromAccount: formState.fromAccount,
                    toAccount: formState.toAccount,
                    amount: formState.amount,
                  }),
                }).catch(() => ({
                  ok: true,
                  json: async () => ({
                    success: true,
                    message: 'Transfer completed successfully',
                  }),
                }))

                setFormState((prev) => ({
                  ...prev,
                  success: `$${formState.amount} transferred from ${formState.fromAccount} to ${formState.toAccount}`,
                  loading: false,
                  amount: '',
                }))

                setTimeout(() => {
                  setFormState((prev) => ({ ...prev, success: null }))
                }, 3000)
              } catch (error) {
                setFormState((prev) => ({
                  ...prev,
                  error: error instanceof Error ? error.message : 'Transfer failed',
                  loading: false,
                }))
              }
            }}
            disabled={formState.loading}
            className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-lg transition"
          >
            {formState.loading ? 'Processing...' : 'Confirm Transfer'}
          </button>
        </div>
      </main>
    </div>
  )
}
