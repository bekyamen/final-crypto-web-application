'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { ChevronDown, LogOut } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">₿</span>
            </div>
            <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              Bit Trading
            </span>
          </Link>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/market-report" className="text-slate-300 hover:text-white transition">
              Markets
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-slate-300 hover:text-white transition">
                Trade <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                <Link href="/demo" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 first:rounded-t-lg">
                  Crypto Tranding
                </Link>
                <Link href="/demo" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50">
                  Forex  Tranding
                </Link>
                <Link href="/demo" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 last:rounded-b-lg">
                  Gold Tranding
                </Link>
                 <Link href="#" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 last:rounded-b-lg">
                  
                </Link>
              </div>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-1 text-slate-300 hover:text-white transition">
                Finance<ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                <Link href="/assets/deposit" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 first:rounded-t-lg">
                  Deposit
                </Link>
                <Link href="/assets/withdraw" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50">
                 Withdraw
                </Link>
                <Link href="/assets" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 last:rounded-b-lg">
                  Assets
                </Link>
                 <Link href="#" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 last:rounded-b-lg">
                  
                </Link>
              </div>
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Sign Out</span>
              </button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-transparent">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
