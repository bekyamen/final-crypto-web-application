'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  fundsPassword: string
}

export function useAuth() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(status === 'loading')
  const [error, setError] = useState<string | null>(null)

  // Sync session
  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role as 'USER' | 'ADMIN',
      })
      setToken(session.accessToken || null)
    } else {
      setUser(null)
      setToken(null)
    }
    setIsLoading(false)
  }, [session])

  // Register + auto-login via NextAuth
  const register = async (data: RegisterData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authApi.register(data)
      const { user, token } = response.data

      // Auto-login
      const loginRes = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (!loginRes?.error) {
        router.push('/demo')
        return { success: true }
      } else {
        setError('Registration succeeded but login failed, please login manually')
        return { success: false, error: 'Login failed after registration' }
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setIsLoading(false)
    if (!res?.error) {
      router.push('/demo')
      return { success: true }
    } else {
      setError('Invalid email or password')
      return { success: false, error: 'Invalid credentials' }
    }
  }

  const logout = () => {
    signOut({ redirect: true, callbackUrl: '/login' })
  }

  return {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}
