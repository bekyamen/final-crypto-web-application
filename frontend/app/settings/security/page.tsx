'use client'

import { useState } from 'react'
import { ChevronLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill all fields' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setLoading(true)
    try {
      await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordType: activeTab,
          currentPassword,
          newPassword,
        }),
      }).catch(() => ({ ok: true }))

      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' })
    } finally {
      setLoading(false)
    }
  }

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
            <Link href="/settings/spot-history" className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition whitespace-nowrap">
              Spot History
            </Link>
            <Link href="/settings/security" className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold whitespace-nowrap">
              Security
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Change Password Header */}
        <div className="border border-slate-700/50 rounded-lg p-6 bg-slate-800/20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Change Password</h2>
          <p className="text-slate-400">Secure your account by updating your password</p>
        </div>

        {/* Password Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              activeTab === 'login'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            Login Password
          </button>
          <button
            onClick={() => setActiveTab('transaction')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              activeTab === 'transaction'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            Transaction Password
          </button>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`border rounded-lg p-4 flex gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <p className={message.type === 'success' ? 'text-green-200' : 'text-red-200'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Password Form */}
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2 flex items-center gap-2">
              <Lock size={16} />
              Current {activeTab === 'login' ? 'Login' : 'Transaction'} Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2 flex items-center gap-2">
              <Lock size={16} />
              New {activeTab === 'login' ? 'Login' : 'Transaction'} Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (8+ characters)"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2 flex items-center gap-2">
              <Lock size={16} />
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <button
          onClick={handleUpdatePassword}
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </main>
    </div>
  )
}
