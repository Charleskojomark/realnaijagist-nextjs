'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setMsg('Thank you for contacting RealNaijaGist. Our editorial team will review your message.')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
        setMsg('Failed to submit message. Please try again or email us directly.')
      }
    } catch {
      setStatus('error')
      setMsg('Network error. Please email realnaijagist123@gmail.com.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-8">
      <header className="border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Get in Touch</span>
        <h1 className="text-3xl font-black text-white mt-1">Contact Our Editorial Desk</h1>
        <p className="text-slate-400 text-sm mt-2">
          Submit breaking news tips, press releases, copyright inquiries, or advertising proposals.
        </p>
      </header>

      {status === 'success' ? (
        <div className="bg-emerald-950/60 border border-emerald-500 text-emerald-300 p-6 rounded-xl text-sm">
          {msg}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
            <input
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message / News Tip</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-xs">{msg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending Message...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  )
}