'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    restaurantName: '',
    whatsappNumber: '',
    waPhoneNumberId: '',
    waAccessToken: '',
    adminEmail: '',
    adminPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Registration failed')
      setLoading(false)
      return
    }

    const signInRes = await signIn('credentials', {
      email: form.adminEmail,
      password: form.adminPassword,
      redirect: false,
    })

    setLoading(false)

    if (signInRes?.error) {
      setError('Account created but sign-in failed. Please log in manually.')
      router.push('/login')
    } else {
      router.push('/setup')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-8">
        <div className="mb-6 text-center">
          <div className="text-3xl mb-2">🤖</div>
          <h1 className="text-xl font-bold text-gray-900">Register your Restaurant</h1>
          <p className="text-sm text-gray-500 mt-1">Set up your WhatsApp AI assistant in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Restaurant</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
              <input value={form.restaurantName} onChange={field('restaurantName')} required
                placeholder="Spice Garden" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input value={form.whatsappNumber} onChange={field('whatsappNumber')} required
                placeholder="919876543210" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">Country code + number, no + or spaces</p>
            </div>
          </div>

          {/* Meta Credentials */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Meta / WhatsApp API</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              Find these at developers.facebook.com → your app → WhatsApp → API Setup
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
              <input value={form.waPhoneNumberId} onChange={field('waPhoneNumberId')} required
                placeholder="1096739166862421" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
              <input value={form.waAccessToken} onChange={field('waAccessToken')} required
                placeholder="EAALpq..." className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">Temporary token — expires every 24h. You can update it from Settings later.</p>
            </div>
          </div>

          {/* Admin Account */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Account</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.adminEmail} onChange={field('adminEmail')} required
                placeholder="admin@yourrestaurant.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={form.adminPassword} onChange={field('adminPassword')} required
                minLength={8} placeholder="At least 8 characters" className={inputCls} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition">
            {loading ? 'Creating account…' : 'Create Account & Continue →'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
