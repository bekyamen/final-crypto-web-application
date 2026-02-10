'use client'

import React from "react"

import { useState } from 'react'
import { ChevronLeft, ArrowDownUp, Info, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ConvertFormState {
  fromCrypto: string
  toCrypto: string
  fromAmount: string
  toAmount: string
  loading: boolean
  error: string | null
  success: string | null
}

export default function ConvertPage() {
  const [formState, setFormState] = useState<ConvertFormState>({
    fromCrypto: 'USDT',
    toCrypto: 'BTC',
    fromAmount: '',
    toAmount: '',
    loading: false,
    error: null,
    success: null,
  })

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    'USDT-BTC': 0.00001210,
    'USDT-ETH': 0.00033,
    'USDT-BNB': 0.0028,
    'BTC-USDT': 82640,
    'BTC-ETH': 27.5,
    'ETH-USDT': 2840,
  })

  const cryptoList = [
    { name: 'Tether', symbol: 'USDT', icon: '₮', balance: 0 },
    { name: 'Bitcoin', symbol: 'BTC', icon: '₿', balance: 0 },
    { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', balance: 0 },
    { name: 'BNB', symbol: 'BNB', icon: '⬥', balance: 0 },
  ]

  const getExchangeRate = (from: string, to: string) => {
    return exchangeRates[`${from}-${to}`] || 1
  }

  const handleSwap = () => {
    setFormState((prev) => ({
      ...prev,
      fromCrypto: prev.toCrypto,
      toCrypto: prev.fromCrypto,
      fromAmount: '',
      toAmount: '',
    }))
  }

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Validation: only allow positive numbers
    if (value && isNaN(parseFloat(value))) {
      setFormState((prev) => ({
        ...prev,
        error: 'Please enter a valid number',
      }))
      return
    }

    setFormState((prev) => ({
      ...prev,
      fromAmount: value,
      error: null,
    }))

    // Calculate conversion
    if (value) {
      const rate = getExchangeRate(formState.fromCrypto, formState.toCrypto)
      const converted = (parseFloat(value) * rate).toFixed(8)
      setFormState((prev) => ({
        ...prev,
        toAmount: converted,
      }))
    } else {
      setFormState((prev) => ({
        ...prev,
        toAmount: '',
      }))
    }
  }

  const validateForm = (): boolean => {
    if (!formState.fromAmount) {
      setFormState((prev) => ({ ...prev, error: 'Please enter an amount' }))
      return false
    }

    const amount = parseFloat(formState.fromAmount)
    if (amount <= 0) {
      setFormState((prev) => ({ ...prev, error: 'Amount must be greater than 0' }))
      return false
    }

    if (amount < 1) {
      setFormState((prev) => ({ ...prev, error: 'Minimum conversion amount is $1.00' }))
      return false
    }

    if (formState.fromCrypto === formState.toCrypto) {
      setFormState((prev) => ({ ...prev, error: 'From and to cryptos must be different' }))
      return false
    }

    return true
  }

  const handleConfirmConversion = async () => {
    if (!validateForm()) return

    setFormState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      // API call simulation
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCrypto: formState.fromCrypto,
          toCrypto: formState.toCrypto,
          fromAmount: formState.fromAmount,
          toAmount: formState.toAmount,
        }),
      }).catch(() => ({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Conversion initiated successfully',
        }),
      }))

      if (response.ok) {
        const data = await response.json()
        setFormState((prev) => ({
          ...prev,
          success: data.message || 'Conversion confirmed successfully!',
          loading: false,
          fromAmount: '',
          toAmount: '',
        }))

        setTimeout(() => {
          setFormState((prev) => ({ ...prev, success: null }))
        }, 3000)
      } else {
        throw new Error('Conversion failed')
      }
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      }))
    }
  }

  const { fromCrypto, toCrypto, fromAmount, toAmount, loading, error, success } = formState
  const exchangeRate = getExchangeRate(fromCrypto, toCrypto)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header with Back Button */}
      <div className="border-b border-slate-700/50 sticky top-0 z-40 bg-gradient-to-b from-slate-950 to-slate-950/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/assets"
              className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-white"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-white font-bold text-lg">Convert Crypto</h1>
              <p className="text-slate-400 text-sm">Exchange between cryptocurrencies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 space-y-6">
          {/* From Section */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">From</label>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-4">
              {/* Crypto Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 font-bold">
                    {cryptoList.find(c => c.symbol === formState.fromCrypto)?.icon}
                  </div>
                  <div>
                    <p className="text-white font-medium">{formState.fromCrypto}</p>
                    <p className="text-slate-400 text-xs">{cryptoList.find(c => c.symbol === formState.fromCrypto)?.name}</p>
                  </div>
                </div>
                <select
                  value={formState.fromCrypto}
                  onChange={(e) => setFormState((prev) => ({ ...prev, fromCrypto: e.target.value, fromAmount: '', toAmount: '' }))}
                  className="bg-transparent text-white border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                >
                  {cryptoList.map((crypto) => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.symbol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div className="space-y-1">
                <input
                  type="number"
                  value={formState.fromAmount}
                  onChange={handleFromChange}
                  placeholder="0.00"
                  className="w-full bg-slate-900/50 text-white text-2xl font-semibold placeholder-slate-600 focus:outline-none"
                />
                <p className="text-slate-400 text-xs">Balance: {cryptoList.find(crypto => crypto.symbol === fromCrypto)?.balance} {fromCrypto}</p>
              </div>
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

          {/* To Section */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">To</label>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-4">
              {/* Crypto Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold">
                    {cryptoList.find(c => c.symbol === formState.toCrypto)?.icon}
                  </div>
                  <div>
                    <p className="text-white font-medium">{formState.toCrypto}</p>
                    <p className="text-slate-400 text-xs">{cryptoList.find(c => c.symbol === formState.toCrypto)?.name}</p>
                  </div>
                </div>
                <select
                  value={formState.toCrypto}
                  onChange={(e) => setFormState((prev) => ({ ...prev, toCrypto: e.target.value, fromAmount: '', toAmount: '' }))}
                  className="bg-transparent text-white border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                >
                  {cryptoList.map((crypto) => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.symbol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Output */}
              <div className="space-y-1">
                <p className="w-full text-white text-2xl font-semibold">{formState.toAmount || '0.00'}</p>
                <p className="text-slate-400 text-xs">1 {formState.fromCrypto} ≈ {getExchangeRate(formState.fromCrypto, formState.toCrypto)} {formState.toCrypto}</p>
              </div>
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-slate-300 text-sm">Exchange Rate</p>
            <p className="text-white font-semibold">1 {formState.fromCrypto} = {getExchangeRate(formState.fromCrypto, formState.toCrypto)} {formState.toCrypto}</p>
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
              <p>• Conversions use real-time market rates</p>
              <p>• Small conversion fee may apply (0.1%)</p>
              <p>• Minimum conversion amount: $1.00 USD</p>
            </div>
          </div>

          {/* Confirm Button */}
          <button 
            onClick={handleConfirmConversion}
            disabled={formState.loading}
            className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-lg transition"
          >
            {formState.loading ? 'Processing...' : 'Confirm Conversion'}
          </button>
        </div>
      </main>
    </div>
  )
}
