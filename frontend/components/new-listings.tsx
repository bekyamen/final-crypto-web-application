'use client'

import { useEffect, useState } from 'react'
import { getNewListings, type NewListing } from '@/lib/market-data'
import { Zap } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function NewListingsSection() {
  const [listings, setListings] = useState<NewListing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNewListings()
        setListings(data)
      } catch (error) {
        console.error('Failed to fetch new listings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="border border-slate-700 rounded-lg bg-slate-900/50 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">New Listings</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800/30 rounded p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
  <div
    key={listing.id}
    className="flex items-center justify-between p-4 bg-slate-800/30 rounded hover:bg-slate-800/50 transition"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden">
        <img
          src={listing.image || "/placeholder.svg"}
          alt={listing.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <div className="font-semibold text-white">{listing.symbol}</div>
        <div className="text-xs text-slate-400">
          ${listing.price?.toFixed(2) ?? "0.00"}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className={`font-semibold flex items-center justify-end gap-1 ${
        listing.change24h != null && listing.change24h >= 0 ? 'text-green-400' : 'text-red-400'
      }`}>
        {listing.change24h != null && listing.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {listing.change24h?.toFixed(2) ?? "0.00"}%
      </div>
    </div>
  </div>
))}

        </div>
      )}
    </div>
  )
}
