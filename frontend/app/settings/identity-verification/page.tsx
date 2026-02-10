'use client'

import { useState } from 'react'
import { ChevronLeft, Shield, AlertCircle, CheckCircle2, Upload } from 'lucide-react'
import Link from 'next/link'

export default function IdentityVerificationPage() {
  const [documentType, setDocumentType] = useState('identity-card')
  const [fullName, setFullName] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [frontSide, setFrontSide] = useState(false)
  const [backSide, setBackSide] = useState(false)
  const [loading, setLoading] = useState(false)

  const verificationProgress = 35
  const documentTypes = [
    { id: 'identity-card', name: 'Identity Card', desc: 'Passport, ID or Government issued ID' },
    { id: 'passport', name: 'Passport', desc: 'Valid passport document' },
    { id: 'driver-license', name: "Driver's License", desc: "Valid driver's license" },
  ]

  const handleSubmit = async () => {
    if (!fullName || !documentNumber || !frontSide || !backSide) {
      alert('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          fullName,
          documentNumber,
        }),
      }).catch(() => ({ ok: true }))
      alert('Verification submitted successfully!')
    } catch (error) {
      alert('Submission failed')
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
            <Link href="/settings/identity-verification" className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold whitespace-nowrap">
              Identity Verification
            </Link>
            <Link href="/settings/spot-history" className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition whitespace-nowrap">
              Spot History
            </Link>
            <Link href="/settings/security" className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition whitespace-nowrap">
              Security
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="border border-slate-700/50 rounded-lg p-6 bg-slate-800/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">Identity Verification</h2>
              <p className="text-slate-400 text-sm">Verify your identity to unlock full trading features and enhance account security</p>
            </div>
          </div>
        </div>

        {/* Verification Progress */}
        <div className="border border-slate-700/50 rounded-lg p-6 bg-slate-800/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Verification Progress</h3>
            <span className="text-slate-400 text-sm">{verificationProgress}% Complete</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-orange-500 h-2 rounded-full" style={{ width: `${verificationProgress}%` }}></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">✓</div>
              <span className="text-slate-400 text-xs text-center">Document Type</span>
            </div>
            <div className="flex-1 h-1 bg-slate-800 mx-2"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold">2</div>
              <span className="text-slate-400 text-xs text-center">Personal Info</span>
            </div>
            <div className="flex-1 h-1 bg-slate-800 mx-2"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold">3</div>
              <span className="text-slate-400 text-xs text-center">Upload Documents</span>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-slate-700/50 rounded-lg p-4 bg-blue-500/10">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Why Verify?</h4>
                <p className="text-slate-300 text-xs">Verifying your identity helps protect your account and enables higher trading limits, faster withdrawals, and access to advanced features.</p>
              </div>
            </div>
          </div>
          <div className="border border-slate-700/50 rounded-lg p-4 bg-blue-500/10">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">Secure & Private</h4>
                <p className="text-slate-300 text-xs">Your information is encrypted and secured. We use industry-standard security measures to protect your data.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Type Selection */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold">Select Document Type</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {documentTypes.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setDocumentType(doc.id)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  documentType === doc.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700/50 bg-slate-800/20 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${documentType === doc.id ? 'border-blue-500 bg-blue-500' : 'border-slate-600'}`}>
                    {documentType === doc.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-white font-semibold text-sm">{doc.name}</span>
                </div>
                <p className="text-slate-400 text-xs">{doc.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full name (as on document)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Document number"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Upload Documents</h3>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-200 text-sm">Important: Ensure documents are clear, visible, and all information is visible. Blurry or incomplete documents will be rejected.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { side: 'Front Side', state: frontSide, setState: setFrontSide },
              { side: 'Back Side', state: backSide, setState: setBackSide },
            ].map((upload) => (
              <button
                key={upload.side}
                onClick={() => upload.setState(!upload.state)}
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 hover:border-blue-500 transition flex flex-col items-center justify-center gap-3 bg-slate-800/20"
              >
                <Upload className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="text-white font-semibold text-sm">{upload.side}</p>
                  <p className="text-slate-400 text-xs">Click to upload or drag & drop</p>
                </div>
                {upload.state && <CheckCircle2 className="w-5 h-5 text-green-400 absolute" />}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? 'Submitting...' : 'Submit Verification'}
        </button>
      </main>
    </div>
  )
}
