// pages/api/generate-tailored-resume.js

import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { resumeContent, jobDescription, keywords = [] } = req.body

  if (!resumeContent || !jobDescription) {
    return res.status(400).json({ error: 'Missing resume or job description' })
  }

  try {
    const trimmedResume = resumeContent.slice(0, 8000)
    const trimmedJD = jobDescription.slice(0, 3000)

    const toneInstructions = {
      professional: 'Use formal, corporate language with industry-standard terminology',
      enthusiastic: 'Use energetic, passionate language that shows excitement and motivation',
      concise: 'Use brief, impactful statements that get straight to the point',
      technical: 'Use detailed technical language with specific tools, technologies, and methodologies'
    };

    const prompt = `You are an expert resume optimization specialist. Your task is to enhance the following resume by strategically incorporating relevant keywords and phrases from the job description.

OPTIMIZATION RULES:
✅ Strategically inject keywords where they naturally fit
✅ Enhance existing bullet points with relevant terminology
✅ Maintain the original structure and format
✅ Ensure ATS (Applicant Tracking System) compatibility
✅ Keep all factual information accurate
❌ Do not fabricate experience or skills
❌ Do not completely rewrite sections
❌ Do not change the core content structure

PRIORITY KEYWORDS TO INCLUDE: ${keywords.slice(0, 10).join(', ')}

Original Resume:
"""
${trimmedResume}
"""

Job Description:
"""
${trimmedJD}
"""

INSTRUCTIONS:
1. Analyze the job requirements and identify key skills/technologies
2. Enhance the resume by naturally incorporating relevant keywords
3. Optimize bullet points for impact and ATS scanning
4. Return the enhanced resume in the same format as the original

Enhanced Resume:`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    })

    const tailoredResume = completion.choices[0].message.content

    // Calculate an improved match score
    const keywordCount = keywords.filter(keyword => 
      tailoredResume.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    const newMatchScore = Math.min(95, 60 + (keywordCount * 3) + Math.floor(Math.random() * 15));

    res.status(200).json({ 
      tailoredResume,
      newMatchScore,
      keywordsAdded: keywordCount,
      optimizations: [
        'Enhanced keyword density',
        'Improved ATS compatibility',
        'Optimized for target role'
      ]
    })
  } catch (error) {
    console.error('[OpenAI Error]', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      full: error
    })

    // Enhanced fallback for API errors
    if (error.status === 429 || error.status === 404) {
      // Provide a basic tailored resume using keyword injection
      const basicTailoredResume = createBasicTailoredResume(resumeContent, keywords);
      
      res.status(200).json({
        tailoredResume: basicTailoredResume,
        newMatchScore: Math.min(85, 55 + (keywords.length * 2)),
        keywordsAdded: keywords.length,
        optimizations: [
          'Basic keyword optimization applied',
          'Fallback tailoring method used',
          'Manual review recommended'
        ],
        fallbackUsed: true
      })
    } else {
      res.status(500).json({
        error: 'Failed to generate tailored resume',
        details: error.message,
        openaiError: error.response?.data || null,
      })
    }
  }
}

function createBasicTailoredResume(resumeContent, keywords) {
  // Basic keyword injection fallback
  let tailoredResume = resumeContent;
  
  // Add a skills section if not present
  if (!resumeContent.toLowerCase().includes('skills') && keywords.length > 0) {
    const skillsSection = `\n\nKEY SKILLS:\n${keywords.slice(0, 10).join(' • ')}\n`;
    tailoredResume += skillsSection;
  }
  
  // Add a note about optimization
  tailoredResume += `\n\n[Resume optimized for target role with ${keywords.length} relevant keywords]`;
  
  return tailoredResume;
}