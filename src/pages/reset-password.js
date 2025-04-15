// pages/reset-password.js

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'
import { LockKeyhole } from 'lucide-react'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleResetPassword = async () => {
    setError('')
    setMessage('')

    if (!newPassword || !confirmPassword) {
      return setError('Please fill in both fields')
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match')
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
    } else {
      setMessage('✅ Password updated successfully! Redirecting to login...')
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-900 via-purple-800 to-indigo-700 px-4">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 text-white">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-indigo-600 p-3 rounded-full shadow-lg">
              <LockKeyhole className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-white/80 text-sm">
            Enter and confirm your new password to continue.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-300 text-sm mt-4">{error}</p>}
        {message && <p className="text-green-300 text-sm mt-4">{message}</p>}

        <button
          onClick={handleResetPassword}
          className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold py-2 rounded-lg shadow-md transition"
        >
          Reset Password
        </button>

        <p className="text-sm text-center mt-6 text-white/70">
          <a href="/login" className="text-indigo-300 hover:underline">
            ← Back to login
          </a>
        </p>
      </div>
    </div>
  )
}
