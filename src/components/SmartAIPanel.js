// components/SmartAIPanel.js (Updated to show section status)

import { useState } from 'react'
import { Sparkles, Save } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/contexts/UserContext'
import { jsPDF } from 'jspdf'

export default function SmartAIPanel({ resumeContent, jobDescription }) {
  const { user } = useUser()
  const [tailoredResume, setTailoredResume] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [progress, setProgress] = useState([])

  const handleGenerate = async () => {
    if (!resumeContent || !jobDescription) return

    setLoading(true)
    setError('')
    setTailoredResume('')
    setProgress([])

    try {
      const res = await fetch('/api/generate-tailored-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, jobDescription })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate tailored resume')

      setTailoredResume(data.tailoredResume)
      setProgress(data.sectionStatus || [])
    } catch (err) {
      console.error('❌ Resume Generation Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadText = () => {
    const blob = new Blob([tailoredResume], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tailored-resume.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    const lines = doc.splitTextToSize(tailoredResume, 180)
    doc.text(lines, 10, 10)
    doc.save('tailored-resume.pdf')
  }

  const handleSaveToHistory = async () => {
    if (!user?.id || !tailoredResume) return
    setSaving(true)
    setSavedMessage('')

    const { error } = await supabase.from('resume_history').insert([
      {
        user_id: user.id,
        job_title: 'AI Tailored Resume',
        resume_url: '',
        file_name: 'tailored-resume.txt',
        file_type: 'text/plain',
        content: tailoredResume,
        tailored: true
      }
    ])

    if (error) {
      console.error('Failed to save to history:', error.message)
      setSavedMessage('❌ Failed to save resume history.')
    } else {
      setSavedMessage('✅ Saved to resume history!')
    }
    setSaving(false)
  }

  return (
    <div id="smart-ai-panel" className="mt-10 p-6 bg-white/10 border border-white/20 rounded-xl text-white space-y-4">
      <div className="flex items-center gap-2 text-indigo-300 font-semibold">
        <Sparkles className="w-5 h-5" /> AI Tailored Resume
      </div>

      {!tailoredResume && (
        <>
          <button
            onClick={handleGenerate}
            disabled={loading || !resumeContent || !jobDescription}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Tailored Resume'}
          </button>
          {error && <p className="text-red-300 text-sm">❌ {error}</p>}
          {loading && progress.length > 0 && (
            <div className="mt-4 space-y-1 text-sm text-yellow-300">
              <p>🛠️ Working on sections:</p>
              {progress.map((step, i) => (
                <p key={i}>🔹 {step}</p>
              ))}
            </div>
          )}
        </>
      )}

      {tailoredResume && (
        <>
          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-white/90 border-t border-white/10 pt-3">
            {tailoredResume}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={downloadText}
              className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-medium"
            >
              Download as TXT
            </button>

            <button
              onClick={downloadPDF}
              className="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded text-sm font-medium"
            >
              Download as PDF
            </button>

            <button
              onClick={handleSaveToHistory}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save to Resume History'}
            </button>
            {savedMessage && <p className="text-sm text-white/70">{savedMessage}</p>}
          </div>
        </>
      )}
    </div>
  )
}
