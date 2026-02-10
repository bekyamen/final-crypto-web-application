'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "Why Can't I Join Token Splash?",
    answer:
      'Token Splash may not be available in your region or you may not meet the eligibility requirements.'
  },
  {
    question: 'My assets under UTA cannot be used, traded, or transferred',
    answer:
      'UTA (Unrestricted Trading Account) assets have specific restrictions. Please contact support for more information.'
  },
  {
    question: 'Everything You Need to Know for Safe P2P Trading',
    answer:
      'P2P trading requires careful verification of counterparties and secure transaction methods. Always use escrow services.'
  }
]

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [tawkLoaded, setTawkLoaded] = useState(false)

  // Load Tawk.to script
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Tawk_API) {
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://embed.tawk.to/YOUR_TAWKTO_ID/default' // <-- Replace with your Tawk.to ID
      script.charset = 'UTF-8'
      script.setAttribute('crossorigin', '*')
      script.onload = () => setTawkLoaded(true) // mark as loaded
      document.body.appendChild(script)
    } else {
      setTawkLoaded(true)
    }
  }, [])

  // Open Tawk.to chat safely
  const openChat = () => {
    if ((window as any).Tawk_API && tawkLoaded) {
      (window as any).Tawk_API.maximize() // opens the live chat window
    } else {
      alert('Chat is still loading, please wait a few seconds.')
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open support chat"
          className="fixed bottom-6 left-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-30 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Support Assistant</h3>
                <p className="text-xs opacity-90">24/7 Online</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* FAQs */}
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-md overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition"
                  >
                    <span className="text-xs font-semibold text-slate-900 text-left">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        expandedFAQ === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedFAQ === index && (
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-200">
                      <p className="text-xs text-slate-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Start Live Chat Button */}
            <button
              onClick={openChat}
              className="mt-4 w-full py-2 rounded bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold transition"
            >
              Start Live Chat
            </button>
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-slate-50 text-center">
            <p className="text-xs text-slate-500">We’re here to help you 24/7</p>
          </div>
        </div>
      )}
    </>
  )
}

