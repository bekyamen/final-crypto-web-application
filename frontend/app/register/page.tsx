'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { User, Mail, Phone, Lock, Key } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const { register, isLoading, error: authError } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    fundsPassword: '',
  })

  // Password validation
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = []
    if (pwd.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter')
    if (!/[0-9]/.test(pwd)) errors.push('One number')
    if (!/[!@#$%^&*]/.test(pwd)) errors.push('One special character (!@#$%^&*)')
    return errors
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'password') {
      setPasswordErrors(validatePassword(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // --- Validation ---
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First and last name are required')
      return
    }

    if (passwordErrors.length > 0) {
      setError('Password does not meet requirements')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password !== formData.fundsPassword) {
      setError('Funds password must match login password')
      return
    }

    // --- Register ---
    const result = await register(formData)
    if (!result.success) {
      setError(result.error || 'Registration failed')
    }
    // Success -> auto-login and redirect handled by useAuth
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-2xl bg-slate-800/50 border border-slate-700 rounded-lg p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-slate-400">Join our crypto trading platform</p>
        </div>

        {/* Error Alert */}
        {(error || authError) && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
            {error || authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
                <User size={16} /> First Name
              </label>
              <Input
                name="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
                <User size={16} /> Last Name
              </label>
              <Input
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
              <Mail size={16} /> Email
            </label>
            <Input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
              <Phone size={16} /> Phone Number
            </label>
            <Input
              name="phoneNumber"
              type="tel"
              placeholder="+1 123 456 7890"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
              <Lock size={16} /> Login Password
            </label>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setShowPasswordRequirements(true)}
              onBlur={() => setShowPasswordRequirements(false)}
              disabled={isLoading}
              required
            />
            {showPasswordRequirements && formData.password && (
              <div className="mt-2 p-3 bg-slate-900/50 rounded border border-slate-700">
                <p className="text-xs text-slate-400 mb-2">Password must have:</p>
                {passwordErrors.length > 0 ? (
                  <ul className="text-xs text-red-400 space-y-1">
                    {passwordErrors.map((err, i) => (
                      <li key={i}>✗ {err}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-green-400">✓ Password meets all requirements</p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
              <Lock size={16} /> Confirm Password
            </label>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          {/* Funds Password */}
          <div>
            <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2">
              <Key size={16} /> Funds Password
            </label>
            <Input
              name="fundsPassword"
              type="password"
              placeholder="Set funds password"
              value={formData.fundsPassword}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-slate-400 mt-1">Used to confirm fund transfers</p>
          </div>

          {/* Submit */}
          <Button type="submit" disabled={isLoading || passwordErrors.length > 0} className="w-full bg-gradient-to-r from-blue-500 to-orange-500">
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
