'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Send, AlertCircle } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

type Contact = {
  id: string
  platform: 'telegram' | 'whatsapp'
  value: string
}

export default function FloatingChat() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ---------------- Fetch contacts ----------------
  const fetchContacts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('No contacts found')
        throw new Error(`Failed to fetch contacts: ${res.status}`)
      }
      const data = await res.json()
      setContacts(data.data || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch contacts'
      console.error('[FloatingChat] Error fetching contacts:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  // ---------------- Get specific contact ----------------
  const getContactValue = (platform: 'telegram' | 'whatsapp') => {
    const c = contacts.find((c) => c.platform === platform)
    return c?.value || ''
  }

  // ---------------- Generate links ----------------
  const whatsappLink = (number: string) => {
    if (!number) return '#'
    const cleanNumber = number.replace(/\D/g, '')
    return `https://wa.me/${cleanNumber}`
  }

  const telegramLink = (username: string) => {
    if (!username) return '#'
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username
    return `https://t.me/${cleanUsername}`
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-700 border border-slate-600 text-slate-200 px-4 py-3 rounded-lg text-sm">
          Loading contacts...
        </div>
      )}

      {/* WhatsApp */}
      <Link
        href={whatsappLink(getContactValue('whatsapp'))}
        target="_blank"
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition hover:scale-110 ${
          getContactValue('whatsapp') ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-600 cursor-not-allowed'
        }`}
        onClick={(e) => !getContactValue('whatsapp') && e.preventDefault()}
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </Link>

      {/* Telegram */}
      <Link
        href={telegramLink(getContactValue('telegram'))}
        target="_blank"
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition hover:scale-110 ${
          getContactValue('telegram') ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-600 cursor-not-allowed'
        }`}
        onClick={(e) => !getContactValue('telegram') && e.preventDefault()}
      >
        <Send className="w-7 h-7 text-white" />
      </Link>
    </div>
  )
}
