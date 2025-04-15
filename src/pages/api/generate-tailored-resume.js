// pages/api/generate-tailored-resume.js

import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { resumeContent, jobDescription } = req.body

  if (!resumeContent || !jobDescription) {
    return res.status(400).json({ error: 'Missing resume or job description' })
  }

  try {
    const trimmedResume = resumeContent.slice(0, 8000)
      const trimmedJD = jobDescription.slice(0, 3000)

      const prompt = `You are a resume enhancement expert.

      Your job is to enhance the following resume by injecting relevant keywords and phrases from the job description — ONLY where appropriate.

      🔒 Do NOT rewrite the resume entirely.
      ✅ Simply add keywords into existing bullet points or lines where they make sense.
      ⚠️ Do not output a docx, zip, or formatted file — return plain text only.

      Resume:
      """
      ${trimmedResume}
      """

      Job Description:
      """
      ${trimmedJD}
      """

      Output the updated resume in plain text format only.`


    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    })

    const tailoredResume = completion.choices[0].message.content
    res.status(200).json({ tailoredResume })
  } catch (error) {
    console.error('[OpenAI Error]', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      full: error
    })
      res.status(500).json({
        error: 'Failed to generate tailored resume',
        details: error.message,
        openaiError: error.response?.data || null,
      })
    }
  }
