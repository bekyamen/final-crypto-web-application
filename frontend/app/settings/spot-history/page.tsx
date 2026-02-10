'use client'

import { useState } from 'react'
import { ChevronLeft, TrendingDown, TrendingUp, ArrowDownLeft, ArrowUpRight, ArrowDownRight, ArrowUpLeft } from 'lucide-react'
import Link from 'next/link'

export default function SpotHistoryPage() {
  const [activeFilter, setActiveFilter] = useState('withdrawals')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const filters = [
    { id: 'withdrawals', label: 'Withdrawals', icon: TrendingDown, color: 'bg-orange-500' },
    { id: 'trades', label: 'Trades', icon: ArrowUpRight, color: 'bg-slate-600' },
    { id: 'deposits', label: 'Deposits', icon: TrendingUp, color: 'bg-slate-600' },
    { id: 'buy', label: 'Buy', icon: ArrowDownLeft, color: 'bg-slate-600' },
    { id: 'sell', label: 'Sell', icon: ArrowUpLeft, color: 'bg-slate-600' },
  ]

  type Transaction = {
    amount: string
    address: string
    network: string
    status: 'completed' | 'pending' | 'failed' | string
    date: string
  }

  const transactions: Transaction[] = [] // Empty state for demo

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700/50 sticky top-0 z-40 bg-gradient-to-b from-slate-950 to-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/settings" className="p-2 hover:bg-slate-800 rounded-lg transition">
              <ChevronLeft className="w-5 h-5 text-slate-400 hover:text-white" />
            </Link>
            <h1 className="text-white font-bold text-lg">Settings</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <Link href="/settings" className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition whitespace-nowrap">
              Dashboard
            </Link>
            <Link href="/settings/identity-verification" className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition whitespace-nowrap">
              Identity Verification
            </Link>
            <Link href="/settings/spot-history" className="px-4 py-2 rounded-lg bg-pink-500 text-white font-semibold whitespace-nowrap">
              Spot History
            </Link>
            <Link href="/settings/security" className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition whitespace-nowrap">
              Security
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="border border-slate-700/50 rounded-lg p-6 bg-slate-800/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">Spot History</h2>
              <p className="text-slate-400 text-sm">View and manage your transaction history</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon
            const isActive = activeFilter === filter.id
            return (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id)
                  setCurrentPage(1)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  isActive
                    ? `${filter.color} text-white`
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {filter.label}
              </button>
            )
          })}
        </div>

        {/* Table Section */}
        <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-800/20">
          {/* Table Controls */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
              >
                {[10, 20, 50].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-400 font-semibold text-sm">AMOUNT</th>
                  <th className="px-6 py-4 text-left text-slate-400 font-semibold text-sm">ADDRESS</th>
                  <th className="px-6 py-4 text-left text-slate-400 font-semibold text-sm">NETWORK</th>
                  <th className="px-6 py-4 text-left text-slate-400 font-semibold text-sm">STATUS</th>
                  <th className="px-6 py-4 text-left text-slate-400 font-semibold text-sm">DATE</th>
                  <th className="px-6 py-4 text-left text-slate-400 font-semibold text-sm">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No {activeFilter} history available
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => (
                    <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                      <td className="px-6 py-4 text-white">{tx.amount}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm font-mono">{tx.address}</td>
                      <td className="px-6 py-4 text-slate-300">{tx.network}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tx.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{tx.date}</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-400 hover:text-blue-300 font-semibold text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-slate-700/50">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-slate-400 text-sm">
              Page {currentPage} of {Math.max(1, Math.ceil(transactions.length / rowsPerPage))}
            </span>
            <button
              disabled={currentPage >= Math.ceil(transactions.length / rowsPerPage)}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
