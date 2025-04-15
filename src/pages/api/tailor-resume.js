import { supabase } from '@/lib/supabaseClient'
import { openai } from '@/lib/openai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, jobDescription } = req.body

  if (!userId || !jobDescription) {
    return res.status(400).json({ error: 'Missing userId or job description' })
  }

  // Step 1: Get master resume from storage (assuming .docx was uploaded)
  const { data: resumeUrlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(`${userId}/master-resume.docx`)

  const resumeUrl = resumeUrlData.publicUrl

  const resumeResponse = await fetch(resumeUrl)
  const baseResume = await resumeResponse.text()

  // Step 2: Construct the GPT prompt
  const prompt = `
You are an AI resume assistant. Given the following job description and master resume,
generate an ATS-friendly tailored resume for the job.

Focus on aligning skills, rewriting the experience, and highlighting relevant projects.

Job Description:
${jobDescription}

Master Resume:
${baseResume}

Tailored Resume:
`

  try {
    // Step 3: Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const tailoredResume = completion.choices[0].message.content

    // Step 4: Save to Supabase `resume_history` table
    const jobTitle = jobDescription.split('\n')[0].slice(0, 80) || 'Untitled Resume'

    await supabase.from('resume_history').insert([
      {
        user_id: userId,
        job_title: jobTitle,
        resume_content: tailoredResume,
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days later
      },
    ])

    // Step 5: Return resume to frontend
    return res.status(200).json({ resume: tailoredResume })
  } catch (err) {
    console.error('OpenAI error:', err)
    return res.status(500).json({ error: 'Failed to generate resume' })
  }
}
