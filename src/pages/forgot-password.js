
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'
import { Lock } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')


  const handleReset = async () => {
    setMessage('')
    setError('')
    if (!email) {
      return setError('Please enter your email')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('✅ Password reset link sent. Please check your email.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-900 via-purple-800 to-indigo-700 px-4">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 text-white">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-indigo-600 p-3 rounded-full shadow-lg">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-white/80 text-sm">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p className="text-red-300 text-sm mt-4">{error}</p>}
        {message && <p className="text-green-300 text-sm mt-4">{message}</p>}

        <button
          onClick={handleReset}
          className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold py-2 rounded-lg shadow-md transition"
        >
          Send Reset Link
        </button>

        <p className="text-sm text-center mt-6 text-white/70">
        <Link href="/login" className="text-indigo-300 hover:underline">
          ← Back to login
        </Link>
        </p>
      </div>
    </div>
  )
}
