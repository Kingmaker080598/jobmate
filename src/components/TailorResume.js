import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TailorResume({ userId }) {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleTailorResume = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Get the most recent resume file from Supabase Storage
      const { data: files, error: fileError } = await supabase
        .storage
        .from('resumes')
        .list('', {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (fileError || !files || files.length === 0) {
        throw new Error('No resume file found in storage.')
      }

      const latestFile = files[0].name
      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(latestFile)
      const resumeUrl = urlData?.publicUrl

      if (!resumeUrl) {
        throw new Error('Failed to get public URL for resume.')
      }

      // Call API route to tailor resume
      const response = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, resumeUrl, jobDescription }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to tailor resume.')

      setSuccess(true)
      setJobDescription('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-3 text-white">Tailor Resume with AI</h2>
      <textarea
        className="w-full bg-white/10 text-white p-3 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="Paste a job description here..."
        rows={6}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-400 text-sm mt-2">✅ Resume tailored and saved successfully!</p>}
      <button
        onClick={handleTailorResume}
        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50"
        disabled={loading || !jobDescription.trim()}
      >
        {loading ? 'Tailoring...' : 'Tailor Resume'}
      </button>
    </div>
  )
}
