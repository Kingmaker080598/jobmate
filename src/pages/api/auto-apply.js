import puppeteer from 'puppeteer';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { job, profile } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    let success = false;
    let errorMessage = '';

    try {
      if (job.source === 'linkedin') {
        success = await applyToLinkedIn(page, job, profile);
      } else if (job.source === 'indeed') {
        success = await applyToIndeed(page, job, profile);
      } else if (job.source === 'glassdoor') {
        success = await applyToGlassdoor(page, job, profile);
      } else {
        success = await applyToGenericSite(page, job, profile);
      }
    } catch (error) {
      console.error('Auto-apply error:', error);
      errorMessage = error.message;
    }

    await browser.close();

    // Record the application attempt
    await supabase.from('auto_apply_applications').insert({
      user_id: profile.user_id,
      job_id: job.id,
      job_title: job.title,
      company: job.company,
      location: job.location,
      status: success ? 'applied' : 'failed',
      error_message: errorMessage,
      applied_at: new Date().toISOString()
    });

    res.status(200).json({ success, message: success ? 'Application submitted' : 'Application failed' });
  } catch (error) {
    console.error('Auto-apply handler error:', error);
    res.status(500).json({ error: 'Auto-apply failed' });
  }
}

async function applyToLinkedIn(page, job, profile) {
  try {
    await page.goto(job.external_url, { waitUntil: 'networkidle2' });
    
    // Look for "Easy Apply" button
    const easyApplyButton = await page.$('.jobs-apply-button--top-card button');
    if (!easyApplyButton) {
      throw new Error('Easy Apply button not found');
    }

    await easyApplyButton.click();
    await page.waitForTimeout(2000);

    // Fill out application form
    await fillLinkedInForm(page, profile);

    // Submit application
    const submitButton = await page.$('button[aria-label="Submit application"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(3000);
      return true;
    }

    return false;
  } catch (error) {
    console.error('LinkedIn apply error:', error);
    throw error;
  }
}

async function applyToIndeed(page, job, profile) {
  try {
    await page.goto(job.external_url, { waitUntil: 'networkidle2' });
    
    // Look for apply button
    const applyButton = await page.$('.jobsearch-IndeedApplyButton-newDesign');
    if (!applyButton) {
      throw new Error('Apply button not found');
    }

    await applyButton.click();
    await page.waitForTimeout(2000);

    // Fill out Indeed application form
    await fillIndeedForm(page, profile);

    // Submit application
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(3000);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Indeed apply error:', error);
    throw error;
  }
}

async function applyToGlassdoor(page, job, profile) {
  try {
    await page.goto(job.external_url, { waitUntil: 'networkidle2' });
    
    // Look for apply button
    const applyButton = await page.$('.apply-btn');
    if (!applyButton) {
      throw new Error('Apply button not found');
    }

    await applyButton.click();
    await page.waitForTimeout(2000);

    // Fill out Glassdoor application form
    await fillGlassdoorForm(page, profile);

    return true;
  } catch (error) {
    console.error('Glassdoor apply error:', error);
    throw error;
  }
}

async function applyToGenericSite(page, job, profile) {
  try {
    await page.goto(job.external_url, { waitUntil: 'networkidle2' });
    
    // Look for common apply button selectors
    const applySelectors = [
      'button[class*="apply"]',
      'a[class*="apply"]',
      'button:contains("Apply")',
      'a:contains("Apply")',
      '.apply-button',
      '.job-apply',
      '#apply-button'
    ];

    let applyButton = null;
    for (const selector of applySelectors) {
      applyButton = await page.$(selector);
      if (applyButton) break;
    }

    if (!applyButton) {
      throw new Error('Apply button not found');
    }

    await applyButton.click();
    await page.waitForTimeout(2000);

    // Fill out generic form
    await fillGenericForm(page, profile);

    return true;
  } catch (error) {
    console.error('Generic site apply error:', error);
    throw error;
  }
}

async function fillLinkedInForm(page, profile) {
  // Fill common LinkedIn form fields
  const fieldMappings = {
    'input[name="firstName"]': profile.first_name,
    'input[name="lastName"]': profile.last_name,
    'input[name="email"]': profile.email,
    'input[name="phone"]': profile.phone,
    'textarea[name="coverLetter"]': generateCoverLetter(profile)
  };

  for (const [selector, value] of Object.entries(fieldMappings)) {
    if (value) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.type(selector, value);
      } catch (error) {
        // Field might not exist, continue
      }
    }
  }
}

async function fillIndeedForm(page, profile) {
  // Fill common Indeed form fields
  const fieldMappings = {
    'input[name="applicant.name"]': `${profile.first_name} ${profile.last_name}`,
    'input[name="applicant.email"]': profile.email,
    'input[name="applicant.phoneNumber"]': profile.phone,
    'textarea[name="applicant.coverLetter"]': generateCoverLetter(profile)
  };

  for (const [selector, value] of Object.entries(fieldMappings)) {
    if (value) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.type(selector, value);
      } catch (error) {
        // Field might not exist, continue
      }
    }
  }
}

async function fillGlassdoorForm(page, profile) {
  // Fill common Glassdoor form fields
  const fieldMappings = {
    'input[name="firstName"]': profile.first_name,
    'input[name="lastName"]': profile.last_name,
    'input[name="email"]': profile.email,
    'input[name="phone"]': profile.phone
  };

  for (const [selector, value] of Object.entries(fieldMappings)) {
    if (value) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.type(selector, value);
      } catch (error) {
        // Field might not exist, continue
      }
    }
  }
}

async function fillGenericForm(page, profile) {
  // Try to fill common form fields
  const commonSelectors = [
    { selector: 'input[name*="first"], input[id*="first"], input[placeholder*="First"]', value: profile.first_name },
    { selector: 'input[name*="last"], input[id*="last"], input[placeholder*="Last"]', value: profile.last_name },
    { selector: 'input[name*="email"], input[id*="email"], input[type="email"]', value: profile.email },
    { selector: 'input[name*="phone"], input[id*="phone"], input[type="tel"]', value: profile.phone },
    { selector: 'textarea[name*="cover"], textarea[id*="cover"]', value: generateCoverLetter(profile) }
  ];

  for (const { selector, value } of commonSelectors) {
    if (value) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.type(value);
        }
      } catch (error) {
        // Continue if field doesn't exist
      }
    }
  }
}

function generateCoverLetter(profile) {
  return `Dear Hiring Manager,

I am writing to express my interest in this position. With my background and experience, I believe I would be a valuable addition to your team.

${profile.years_of_experience ? `I have ${profile.years_of_experience} years of experience in my field.` : ''}

I am excited about the opportunity to contribute to your organization and would welcome the chance to discuss how my skills and experience align with your needs.

Thank you for your consideration.

Best regards,
${profile.first_name} ${profile.last_name}`;
}