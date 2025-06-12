import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log('Scraping job from URL:', url);

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Determine platform and extract accordingly
    const jobData = extractJobData($, url);

    if (!jobData.title && !jobData.company) {
      throw new Error('Could not extract job information from this URL. The page might require authentication or use dynamic content loading.');
    }

    console.log('Successfully extracted job data:', jobData);

    res.status(200).json({
      success: true,
      jobData: {
        ...jobData,
        url: url,
        extractedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape job data'
    });
  }
}

function extractJobData($, url) {
  const jobData = {
    title: '',
    company: '',
    location: '',
    description: '',
    salary: '',
    jobType: '',
    experience: '',
    skills: [],
    requirements: [],
    benefits: []
  };

  // Platform-specific extraction
  if (url.includes('linkedin.com')) {
    return extractLinkedInJob($, jobData);
  } else if (url.includes('indeed.com')) {
    return extractIndeedJob($, jobData);
  } else if (url.includes('glassdoor.com')) {
    return extractGlassdoorJob($, jobData);
  } else {
    return extractGenericJob($, jobData);
  }
}

function extractLinkedInJob($, jobData) {
  // LinkedIn job extraction
  jobData.title = $('h1.top-card-layout__title, .job-details-jobs-unified-top-card__job-title h1, .jobs-unified-top-card__job-title a').first().text().trim();
  
  jobData.company = $('.job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name').first().text().trim();
  
  jobData.location = $('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet').first().text().trim();
  
  // Description from multiple possible selectors
  const descriptionSelectors = [
    '.jobs-description__content .jobs-description-content__text',
    '.jobs-description-content__text',
    '.jobs-description__content',
    '.description__text',
    '#job-details'
  ];
  
  for (const selector of descriptionSelectors) {
    const desc = $(selector).text().trim();
    if (desc && desc.length > 100) {
      jobData.description = desc;
      break;
    }
  }

  // Extract job type and experience from description or other elements
  const fullText = jobData.description.toLowerCase();
  if (fullText.includes('full-time') || fullText.includes('full time')) {
    jobData.jobType = 'Full-time';
  } else if (fullText.includes('part-time') || fullText.includes('part time')) {
    jobData.jobType = 'Part-time';
  } else if (fullText.includes('contract')) {
    jobData.jobType = 'Contract';
  } else if (fullText.includes('remote')) {
    jobData.jobType = 'Remote';
  }

  // Extract experience level
  if (fullText.includes('senior') || fullText.includes('sr.')) {
    jobData.experience = 'Senior level';
  } else if (fullText.includes('junior') || fullText.includes('entry')) {
    jobData.experience = 'Entry level';
  } else if (fullText.includes('mid-level') || fullText.includes('intermediate')) {
    jobData.experience = 'Mid level';
  }

  // Extract skills
  jobData.skills = extractSkillsFromText(jobData.description);

  return jobData;
}

function extractIndeedJob($, jobData) {
  // Indeed job extraction
  jobData.title = $('h1[data-testid="jobTitle"], .jobsearch-JobInfoHeader-title span, h1.icl-u-xs-mb--xs').first().text().trim();
  
  jobData.company = $('[data-testid="inlineHeader-companyName"] a, .icl-u-lg-mr--sm .icl-u-xs-mt--xs, .jobsearch-InlineCompanyRating + div a').first().text().trim();
  
  jobData.location = $('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle div, .icl-u-xs-mt--xs:not(.icl-u-lg-mr--sm)').first().text().trim();
  
  // Description
  const descriptionSelectors = [
    '#jobDescriptionText',
    '.jobsearch-jobDescriptionText',
    '[data-testid="jobDescriptionText"]',
    '.jobsearch-JobComponent-description'
  ];
  
  for (const selector of descriptionSelectors) {
    const desc = $(selector).text().trim();
    if (desc && desc.length > 100) {
      jobData.description = desc;
      break;
    }
  }

  // Salary
  jobData.salary = $('[data-testid="job-salary"], .icl-u-xs-mr--xs .attribute_snippet').first().text().trim();

  // Extract additional info from description
  const fullText = jobData.description.toLowerCase();
  
  if (fullText.includes('full-time')) jobData.jobType = 'Full-time';
  else if (fullText.includes('part-time')) jobData.jobType = 'Part-time';
  else if (fullText.includes('contract')) jobData.jobType = 'Contract';

  if (fullText.includes('senior')) jobData.experience = 'Senior level';
  else if (fullText.includes('junior') || fullText.includes('entry')) jobData.experience = 'Entry level';

  jobData.skills = extractSkillsFromText(jobData.description);

  return jobData;
}

function extractGlassdoorJob($, jobData) {
  // Glassdoor job extraction
  jobData.title = $('[data-test="job-title"], .css-17x2pwl, .e1tk4kwz5').first().text().trim();
  
  jobData.company = $('[data-test="employer-name"], .css-16nw49e, .e1tk4kwz1').first().text().trim();
  
  jobData.location = $('[data-test="job-location"], .css-1buaf54, .e1tk4kwz2').first().text().trim();
  
  // Description
  const descriptionSelectors = [
    '[data-test="jobDescriptionContent"]',
    '.jobDescriptionContent',
    '.desc',
    '.jobDesc'
  ];
  
  for (const selector of descriptionSelectors) {
    const desc = $(selector).text().trim();
    if (desc && desc.length > 100) {
      jobData.description = desc;
      break;
    }
  }

  // Salary
  jobData.salary = $('[data-test="detailSalary"], .css-1oxck2i').first().text().trim();

  const fullText = jobData.description.toLowerCase();
  
  if (fullText.includes('full-time')) jobData.jobType = 'Full-time';
  if (fullText.includes('senior')) jobData.experience = 'Senior level';
  else if (fullText.includes('entry')) jobData.experience = 'Entry level';

  jobData.skills = extractSkillsFromText(jobData.description);

  return jobData;
}

function extractGenericJob($, jobData) {
  // Generic extraction for other sites
  
  // Try common title selectors
  const titleSelectors = ['h1', '.job-title', '.title', '[class*="title"]', '[class*="job"]'];
  for (const selector of titleSelectors) {
    const title = $(selector).first().text().trim();
    if (title && title.length > 5 && title.length < 200) {
      jobData.title = title;
      break;
    }
  }

  // Try common company selectors
  const companySelectors = ['.company', '.employer', '[class*="company"]', '[class*="employer"]'];
  for (const selector of companySelectors) {
    const company = $(selector).first().text().trim();
    if (company && company.length > 2 && company.length < 100) {
      jobData.company = company;
      break;
    }
  }

  // Try common location selectors
  const locationSelectors = ['.location', '[class*="location"]', '.address'];
  for (const selector of locationSelectors) {
    const location = $(selector).first().text().trim();
    if (location && location.length > 2 && location.length < 100) {
      jobData.location = location;
      break;
    }
  }

  // Try to find description
  const descriptionSelectors = [
    '.description', '.job-description', '.content', '.details', 
    '[class*="description"]', '[class*="content"]', 'main', '.main'
  ];
  
  for (const selector of descriptionSelectors) {
    const desc = $(selector).text().trim();
    if (desc && desc.length > 200) {
      jobData.description = desc;
      break;
    }
  }

  // If no description found, try to get all text content
  if (!jobData.description) {
    const bodyText = $('body').text().trim();
    if (bodyText.length > 500) {
      jobData.description = bodyText.substring(0, 2000) + '...';
    }
  }

  jobData.skills = extractSkillsFromText(jobData.description);

  return jobData;
}

function extractSkillsFromText(text) {
  if (!text) return [];

  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 
    'Kubernetes', 'Git', 'API', 'MongoDB', 'PostgreSQL', 'TypeScript',
    'Angular', 'Vue', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go',
    'Machine Learning', 'AI', 'Data Science', 'Analytics', 'Tableau',
    'Agile', 'Scrum', 'Project Management', 'Leadership', 'Communication',
    'Problem Solving', 'Team Work', 'Critical Thinking', 'HTML', 'CSS',
    'REST API', 'GraphQL', 'Microservices', 'DevOps', 'CI/CD', 'Jenkins',
    'Terraform', 'Ansible', 'Linux', 'Windows', 'MacOS', 'Excel',
    'PowerBI', 'Salesforce', 'Jira', 'Confluence', 'Slack', 'Figma'
  ];

  const foundSkills = [];
  const lowerText = text.toLowerCase();

  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills.slice(0, 10); // Limit to 10 skills
}