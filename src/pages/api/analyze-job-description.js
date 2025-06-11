import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobDescription, toneStyle = 'professional' } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  try {
    const prompt = `Analyze this job description and provide:
1. Extract 20 most important keywords/skills
2. Calculate a match score (0-100) for a generic resume
3. Provide 5 specific suggestions for resume improvement
4. Consider the tone style: ${toneStyle}

Job Description:
"""
${jobDescription.slice(0, 4000)}
"""

Return a JSON response with:
{
  "keywords": ["keyword1", "keyword2", ...],
  "matchScore": 65,
  "suggestions": ["suggestion1", "suggestion2", ...],
  "requiredSkills": ["skill1", "skill2", ...],
  "preferredQualifications": ["qual1", "qual2", ...],
  "companyInfo": "brief company description",
  "roleLevel": "entry/mid/senior/executive"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    });

    const response = completion.choices[0].message.content;
    
    try {
      const analysisData = JSON.parse(response);
      res.status(200).json(analysisData);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      const keywords = extractKeywordsFromText(jobDescription);
      const suggestions = generateBasicSuggestions(toneStyle);
      
      res.status(200).json({
        keywords,
        matchScore: 45,
        suggestions,
        requiredSkills: keywords.slice(0, 10),
        preferredQualifications: [],
        companyInfo: "Company information not available",
        roleLevel: "mid"
      });
    }
  } catch (error) {
    console.error('Job analysis error:', error);
    
    // Fallback analysis
    const keywords = extractKeywordsFromText(jobDescription);
    const suggestions = generateBasicSuggestions(toneStyle);
    
    res.status(200).json({
      keywords,
      matchScore: 40,
      suggestions,
      requiredSkills: keywords.slice(0, 8),
      preferredQualifications: [],
      companyInfo: "Analysis unavailable",
      roleLevel: "mid"
    });
  }
}

function extractKeywordsFromText(text) {
  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 
    'Git', 'Agile', 'Scrum', 'REST API', 'MongoDB', 'PostgreSQL', 'Redis',
    'Kubernetes', 'CI/CD', 'Machine Learning', 'Data Analysis', 'Leadership',
    'Project Management', 'Communication', 'Problem Solving', 'Teamwork'
  ];
  
  const foundKeywords = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  // Add some generic keywords based on common patterns
  const additionalKeywords = [];
  if (text.toLowerCase().includes('experience')) additionalKeywords.push('Experience');
  if (text.toLowerCase().includes('bachelor')) additionalKeywords.push('Bachelor\'s Degree');
  if (text.toLowerCase().includes('remote')) additionalKeywords.push('Remote Work');
  if (text.toLowerCase().includes('startup')) additionalKeywords.push('Startup Environment');
  
  return [...foundKeywords, ...additionalKeywords].slice(0, 20);
}

function generateBasicSuggestions(toneStyle) {
  const baseSuggestions = [
    'Include relevant technical skills mentioned in the job description',
    'Quantify your achievements with specific numbers and metrics',
    'Tailor your experience section to match the role requirements',
    'Add keywords that appear frequently in the job posting',
    'Highlight leadership and collaboration experiences'
  ];
  
  const toneSuggestions = {
    professional: ['Use formal language and industry terminology'],
    enthusiastic: ['Show passion and energy in your descriptions'],
    concise: ['Keep bullet points brief and impactful'],
    technical: ['Include detailed technical specifications and tools']
  };
  
  return [...baseSuggestions, ...(toneSuggestions[toneStyle] || [])];
}