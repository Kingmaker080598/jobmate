import { handleError, ERROR_CODES } from '../../lib/errorHandler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobDescription, toneStyle = 'professional' } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  try {
    // Use advanced local analysis instead of OpenAI
    console.info('JobMate: Using advanced local job analysis system');
    
    const analysisData = createAdvancedJobAnalysis(jobDescription, toneStyle);
    
    console.info('JobMate Analysis Success:', {
      operation: 'job_analysis',
      keywordsFound: analysisData.keywords.length,
      matchScore: analysisData.matchScore,
      analysisMethod: 'advanced_local'
    });

    res.status(200).json(analysisData);
  } catch (error) {
    console.error('Local analysis error:', error);
    
    const jobMateError = handleError(error, { 
      operation: 'job_analysis',
      jobDescriptionLength: jobDescription?.length,
      toneStyle 
    });

    // Even if local analysis fails, provide basic fallback
    const fallbackData = createBasicFallbackAnalysis(jobDescription, toneStyle);
    
    fallbackData.fallbackUsed = true;
    fallbackData.fallbackReason = 'Using basic analysis system';
    
    res.status(200).json(fallbackData);
  }
}

function createAdvancedJobAnalysis(jobDescription, toneStyle) {
  const text = jobDescription.toLowerCase();
  
  // Advanced keyword extraction with weighted scoring
  const keywordCategories = {
    technical: {
      weight: 3,
      terms: [
        'javascript', 'python', 'react', 'node.js', 'sql', 'aws', 'docker', 
        'kubernetes', 'git', 'api', 'mongodb', 'postgresql', 'redis', 'typescript',
        'angular', 'vue', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
        'machine learning', 'ai', 'artificial intelligence', 'data science', 
        'analytics', 'tableau', 'powerbi', 'spark', 'hadoop', 'tensorflow',
        'pytorch', 'scikit-learn', 'pandas', 'numpy', 'flask', 'django',
        'spring', 'express', 'fastapi', 'graphql', 'rest api', 'microservices',
        'devops', 'ci/cd', 'jenkins', 'github actions', 'terraform', 'ansible'
      ]
    },
    soft: {
      weight: 2,
      terms: [
        'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
        'creative', 'adaptable', 'organized', 'detail-oriented', 'collaborative',
        'innovative', 'strategic', 'customer-focused', 'results-driven',
        'time management', 'project management', 'critical thinking',
        'interpersonal', 'presentation', 'negotiation', 'mentoring'
      ]
    },
    business: {
      weight: 2.5,
      terms: [
        'agile', 'scrum', 'project management', 'stakeholder management',
        'business analysis', 'requirements gathering', 'process improvement',
        'strategy', 'planning', 'budgeting', 'forecasting', 'reporting',
        'kpi', 'roi', 'metrics', 'dashboard', 'lean', 'six sigma',
        'change management', 'risk management', 'compliance'
      ]
    },
    industry: {
      weight: 2,
      terms: [
        'fintech', 'healthcare', 'e-commerce', 'saas', 'startup', 'enterprise',
        'consulting', 'marketing', 'sales', 'operations', 'hr', 'finance',
        'cybersecurity', 'blockchain', 'iot', 'cloud computing', 'mobile',
        'web development', 'full stack', 'frontend', 'backend', 'ui/ux'
      ]
    },
    education: {
      weight: 1.5,
      terms: [
        'bachelor', 'master', 'phd', 'degree', 'certification', 'diploma',
        'computer science', 'engineering', 'mathematics', 'statistics',
        'business administration', 'mba', 'aws certified', 'google cloud',
        'microsoft certified', 'cisco', 'oracle', 'salesforce'
      ]
    }
  };

  const foundKeywords = [];
  let totalScore = 0;

  // Extract keywords with weighted scoring
  Object.entries(keywordCategories).forEach(([category, { weight, terms }]) => {
    terms.forEach(term => {
      if (text.includes(term.toLowerCase())) {
        foundKeywords.push({
          keyword: term.charAt(0).toUpperCase() + term.slice(1),
          category,
          weight,
          score: weight * (term.split(' ').length) // Multi-word terms get bonus
        });
        totalScore += weight;
      }
    });
  });

  // Sort by score and remove duplicates
  const uniqueKeywords = foundKeywords
    .sort((a, b) => b.score - a.score)
    .filter((item, index, arr) => 
      arr.findIndex(i => i.keyword.toLowerCase() === item.keyword.toLowerCase()) === index
    )
    .slice(0, 25)
    .map(item => item.keyword);

  // Advanced match score calculation
  const baseScore = Math.min(85, 25 + (uniqueKeywords.length * 2.5));
  const complexityBonus = calculateComplexityBonus(text);
  const industryBonus = calculateIndustryBonus(text);
  const experienceBonus = calculateExperienceBonus(text);
  
  const matchScore = Math.max(30, Math.min(95, 
    baseScore + complexityBonus + industryBonus + experienceBonus
  ));

  // Generate intelligent suggestions based on analysis
  const suggestions = generateIntelligentSuggestions(text, toneStyle, uniqueKeywords);

  // Extract requirements and qualifications
  const requirements = extractRequirements(text);
  const qualifications = extractQualifications(text);

  // Determine role level and company info
  const roleLevel = determineRoleLevel(text);
  const companyInfo = extractCompanyInfo(text);

  // Calculate confidence based on analysis depth
  const confidence = Math.min(95, 75 + (uniqueKeywords.length * 1.5) + complexityBonus);

  return {
    keywords: uniqueKeywords,
    matchScore,
    suggestions,
    requiredSkills: uniqueKeywords.slice(0, 12),
    preferredQualifications: qualifications,
    requirements,
    companyInfo,
    roleLevel,
    analysisQuality: 'advanced_local',
    confidence,
    analysisDetails: {
      totalKeywordsFound: foundKeywords.length,
      categoriesMatched: Object.keys(keywordCategories).filter(cat => 
        foundKeywords.some(k => k.category === cat)
      ),
      complexityScore: complexityBonus,
      industryMatch: industryBonus > 0,
      experienceLevel: roleLevel
    }
  };
}

function calculateComplexityBonus(text) {
  let bonus = 0;
  
  // Technical complexity indicators
  if (text.includes('architecture') || text.includes('design patterns')) bonus += 5;
  if (text.includes('scalability') || text.includes('performance')) bonus += 5;
  if (text.includes('security') || text.includes('compliance')) bonus += 5;
  if (text.includes('automation') || text.includes('optimization')) bonus += 5;
  if (text.includes('integration') || text.includes('api')) bonus += 3;
  if (text.includes('testing') || text.includes('quality assurance')) bonus += 3;
  
  return Math.min(15, bonus);
}

function calculateIndustryBonus(text) {
  const industries = [
    'fintech', 'healthcare', 'e-commerce', 'saas', 'ai', 'machine learning',
    'blockchain', 'cybersecurity', 'cloud', 'mobile', 'iot'
  ];
  
  return industries.some(industry => text.includes(industry)) ? 5 : 0;
}

function calculateExperienceBonus(text) {
  if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 8;
  if (text.includes('mid-level') || text.includes('intermediate')) return 5;
  if (text.includes('junior') || text.includes('entry')) return 3;
  return 0;
}

function generateIntelligentSuggestions(text, toneStyle, keywords) {
  const suggestions = [];
  
  // Base suggestions
  suggestions.push('Incorporate the identified technical skills and keywords naturally throughout your resume');
  suggestions.push('Quantify your achievements with specific metrics and impact numbers');
  suggestions.push('Tailor your experience descriptions to match the job requirements');
  
  // Tone-specific suggestions
  const toneSuggestions = {
    professional: [
      'Use formal business language and industry-standard terminology',
      'Emphasize your professional accomplishments and career progression',
      'Structure your resume with clear sections and consistent formatting'
    ],
    enthusiastic: [
      'Use dynamic action verbs that demonstrate passion and initiative',
      'Highlight projects and achievements that show your drive and energy',
      'Include volunteer work or side projects that demonstrate commitment'
    ],
    concise: [
      'Keep bullet points brief and impactful (1-2 lines maximum)',
      'Focus only on the most relevant and impressive achievements',
      'Use bullet points instead of paragraphs for easy scanning'
    ],
    technical: [
      'Include specific technologies, tools, and methodologies you\'ve used',
      'Provide technical details about projects and implementations',
      'Mention certifications, technical training, and continuous learning'
    ]
  };
  
  suggestions.push(...(toneSuggestions[toneStyle] || toneSuggestions.professional));
  
  // Keyword-specific suggestions
  if (keywords.some(k => k.toLowerCase().includes('leadership'))) {
    suggestions.push('Highlight your leadership experience with team sizes and project outcomes');
  }
  if (keywords.some(k => k.toLowerCase().includes('agile'))) {
    suggestions.push('Emphasize your experience with Agile methodologies and cross-functional collaboration');
  }
  if (keywords.some(k => k.toLowerCase().includes('cloud'))) {
    suggestions.push('Showcase your cloud platform experience and any relevant certifications');
  }
  if (keywords.some(k => k.toLowerCase().includes('data'))) {
    suggestions.push('Include specific examples of data analysis, visualization, or data-driven decisions');
  }
  
  // Industry-specific suggestions
  if (text.includes('startup')) {
    suggestions.push('Emphasize your adaptability, versatility, and ability to wear multiple hats');
  }
  if (text.includes('enterprise')) {
    suggestions.push('Highlight experience with large-scale systems and enterprise processes');
  }
  
  return suggestions.slice(0, 8);
}

function extractRequirements(text) {
  const requirements = [];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('require') || lowerLine.includes('must have') || 
        lowerLine.includes('essential') || lowerLine.includes('mandatory')) {
      const cleaned = line.replace(/[•\-\*]/g, '').trim();
      if (cleaned.length > 10 && cleaned.length < 150) {
        requirements.push(cleaned);
      }
    }
  });
  
  // Add common requirements based on content
  if (text.includes('bachelor')) requirements.push('Bachelor\'s degree in relevant field');
  if (text.includes('years') && text.includes('experience')) {
    const match = text.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/);
    if (match) {
      requirements.push(`${match[1]}+ years of professional experience`);
    }
  }
  
  return requirements.slice(0, 6);
}

function extractQualifications(text) {
  const qualifications = [];
  
  if (text.includes('bachelor')) qualifications.push('Bachelor\'s degree required');
  if (text.includes('master')) qualifications.push('Master\'s degree preferred');
  if (text.includes('certification')) qualifications.push('Professional certifications valued');
  if (text.includes('remote')) qualifications.push('Remote work experience preferred');
  if (text.includes('startup')) qualifications.push('Startup environment experience');
  if (text.includes('enterprise')) qualifications.push('Enterprise-level experience');
  
  return qualifications.slice(0, 5);
}

function determineRoleLevel(text) {
  if (text.includes('senior') || text.includes('lead') || text.includes('principal') || 
      text.includes('architect') || text.includes('staff')) {
    return 'senior';
  } else if (text.includes('junior') || text.includes('entry') || text.includes('associate') ||
             text.includes('intern') || text.includes('graduate')) {
    return 'entry';
  } else if (text.includes('manager') || text.includes('director') || text.includes('vp') ||
             text.includes('head of') || text.includes('chief')) {
    return 'executive';
  }
  return 'mid';
}

function extractCompanyInfo(text) {
  if (text.includes('startup') || text.includes('early stage')) {
    return 'Fast-growing startup environment with opportunities for innovation and impact';
  } else if (text.includes('enterprise') || text.includes('fortune') || text.includes('global')) {
    return 'Established enterprise company with structured processes and global reach';
  } else if (text.includes('consulting') || text.includes('agency')) {
    return 'Professional services firm serving diverse clients across industries';
  } else if (text.includes('tech') || text.includes('software') || text.includes('saas')) {
    return 'Technology company focused on software development and innovation';
  } else if (text.includes('fintech') || text.includes('financial')) {
    return 'Financial technology company transforming the finance industry';
  } else if (text.includes('healthcare') || text.includes('medical')) {
    return 'Healthcare organization improving patient outcomes through technology';
  }
  return 'Professional organization seeking qualified candidates for growth';
}

function createBasicFallbackAnalysis(jobDescription, toneStyle) {
  const text = jobDescription.toLowerCase();
  const words = text.split(/\s+/);
  
  // Basic keyword extraction
  const commonKeywords = [
    'experience', 'skills', 'team', 'project', 'development', 'management',
    'communication', 'problem solving', 'leadership', 'collaboration'
  ];
  
  const foundKeywords = commonKeywords.filter(keyword => 
    text.includes(keyword)
  ).map(keyword => keyword.charAt(0).toUpperCase() + keyword.slice(1));
  
  return {
    keywords: foundKeywords,
    matchScore: 45,
    suggestions: [
      'Review the job description carefully and align your experience',
      'Highlight relevant skills and accomplishments',
      'Use keywords from the job posting in your resume',
      'Quantify your achievements where possible'
    ],
    requiredSkills: foundKeywords.slice(0, 5),
    preferredQualifications: ['Relevant experience', 'Strong communication skills'],
    requirements: ['Review job description for specific requirements'],
    companyInfo: 'Professional organization',
    roleLevel: 'mid',
    analysisQuality: 'basic_fallback',
    confidence: 60
  };
}