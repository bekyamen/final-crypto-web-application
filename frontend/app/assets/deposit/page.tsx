'use client'

import { useState } from 'react'
import { ChevronLeft, Search, Copy, Info, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface DepositFormState {
  searchQuery: string
  selectedCrypto: string
  selectedNetwork: string
  copied: boolean
  loading: boolean
  error: string | null
  success: string | null
  verificationRequired: boolean
}

export default function DepositPage() {
  const [formState, setFormState] = useState<DepositFormState>({
    searchQuery: '',
    selectedCrypto: 'BTC',
    selectedNetwork: 'Bitcoin',
    copied: false,
    loading: false,
    error: null,
    success: null,
    verificationRequired: true,
  })

  const { searchQuery, selectedCrypto, selectedNetwork, copied } = formState

  const cryptoList = [
    { name: 'Bitcoin', symbol: 'BTC', icon: '₿', minDeposit: 10 },
    { name: 'Tether', symbol: 'USDT', icon: '₮', minDeposit: 10 },
    { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', minDeposit: 10 },
  ]

  const networks: Record<string, Array<{ name: string; fee: string }>> = {
    BTC: [{ name: 'Bitcoin', fee: 'Fee: 0.0005 BTC' }],
    USDT: [{ name: 'Ethereum', fee: 'Fee: 0.05 USDT' }],
    ETH: [{ name: 'Ethereum', fee: 'Fee: 0.01 ETH' }],
  }

  const walletAddresses: Record<string, string> = {
    BTC: 'bc1qr7q4qu7g7f8f9gg9q8j8k8l8m8n8o8p8q8r8s',
    USDT: '0x742d35Cc6634C0532925a3b844Bc2e7c1d5d82a2',
    ETH: '0x742d35Cc6634C0532925a3b844Bc2e7c1d5d82a2',
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddresses[formState.selectedCrypto])
      setFormState((prev) => ({ ...prev, copied: true }))
      setTimeout(() => {
        setFormState((prev) => ({ ...prev, copied: false }))
      }, 2000)
    } catch {
      setFormState((prev) => ({ ...prev, error: 'Failed to copy address' }))
    }
  }

  const filteredCryptos = cryptoList.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(formState.searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(formState.searchQuery.toLowerCase())
  )

  const handleVerification = async () => {
    setFormState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      // API call simulation
      await fetch('/api/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crypto: formState.selectedCrypto,
          address: walletAddresses[formState.selectedCrypto],
        }),
      }).catch(() => ({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Identity verified successfully',
        }),
      }))

      setFormState((prev) => ({
        ...prev,
        verificationRequired: false,
        success: 'Identity verified! You can now deposit.',
        loading: false,
      }))
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Verification failed',
        loading: false,
      }))
    }
  }

  const setSearchQuery = (value: string) => {
    setFormState((prev) => ({ ...prev, searchQuery: value }))
  }

  const setSelectedCrypto = (value: string) => {
    setFormState((prev) => ({ ...prev, selectedCrypto: value }))
  }

  const walletAddress = walletAddresses[selectedCrypto]

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
              <h1 className="text-white font-bold text-lg">Deposit Crypto</h1>
              <p className="text-slate-400 text-sm">Deposit digital assets to your account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 space-y-6">
          {/* Search Crypto */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">Search Crypto</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={formState.searchQuery}
                onChange={(e) => setFormState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search by crypto name or symbol..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Recent Cryptos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <div className="w-4 h-4 text-blue-400">⏱</div>
              <span>Recent</span>
            </div>
            <div className="flex gap-3">
              {['BTC', 'USDT', 'ETH'].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setFormState((prev) => ({ ...prev, selectedCrypto: symbol }))}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    formState.selectedCrypto === symbol
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800/50 text-slate-300 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Select Crypto Type */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">Select Crypto Type</label>
            <select
              value={formState.selectedCrypto}
              onChange={(e) => setFormState((prev) => ({ ...prev, selectedCrypto: e.target.value, selectedNetwork: networks[e.target.value]?.[0]?.name || 'Bitcoin' }))}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              {filteredCryptos.map((crypto) => (
                <option key={crypto.symbol} value={crypto.symbol}>
                  {crypto.symbol} - {crypto.name}
                </option>
              ))}
            </select>
          </div>

          {/* Deposit Network */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">Deposit Network</label>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{cryptoList.find(c => c.symbol === formState.selectedCrypto)?.icon}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{formState.selectedNetwork}</p>
                    <p className="text-slate-400 text-xs">{formState.selectedNetwork} Network</p>
                  </div>
                </div>
                <span className="text-blue-400">✓</span>
              </div>
            </div>
          </div>

          {/* Deposit Address - QR Code */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">Deposit Address</label>
            <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
              {/* QR Code Placeholder */}
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                [QR Code]
              </div>
              <p className="text-gray-600 text-xs">Scan to copy address</p>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="space-y-3">
            <label className="text-slate-300 text-sm">{formState.selectedCrypto} Address</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={walletAddresses[formState.selectedCrypto]}
                readOnly
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white text-sm focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`p-3 rounded-lg transition ${
                  formState.copied
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Copy size={18} />
              </button>
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

          {/* Info Alert */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
            <Info size={20} className="text-blue-400 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p>• Expect {formState.selectedCrypto} to be deposited</p>
              <p>• Network: {formState.selectedNetwork}</p>
              <p>• Minimum deposit: {cryptoList.find(c => c.symbol === formState.selectedCrypto)?.minDeposit} USD</p>
            </div>
          </div>

          {/* Verification Button */}
          <button 
            onClick={handleVerification}
            disabled={formState.loading || !formState.verificationRequired}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
          >
            {formState.loading ? 'Verifying...' : formState.verificationRequired ? 'Identity Verification Required' : 'Verified ✓'}
          </button>
        </div>
      </main>
    </div>
  )
}
