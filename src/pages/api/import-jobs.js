import puppeteer from 'puppeteer';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { source, criteria, sources } = req.body;

  try {
    const stats = {
      linkedin: 0,
      indeed: 0,
      glassdoor: 0,
      total: 0
    };

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    if (source === 'all' || source === 'linkedin') {
      if (sources.linkedin) {
        const linkedinJobs = await scrapeLinkedIn(browser, criteria);
        await saveJobs(linkedinJobs, 'linkedin');
        stats.linkedin = linkedinJobs.length;
      }
    }

    if (source === 'all' || source === 'indeed') {
      if (sources.indeed) {
        const indeedJobs = await scrapeIndeed(browser, criteria);
        await saveJobs(indeedJobs, 'indeed');
        stats.indeed = indeedJobs.length;
      }
    }

    if (source === 'all' || source === 'glassdoor') {
      if (sources.glassdoor) {
        const glassdoorJobs = await scrapeGlassdoor(browser, criteria);
        await saveJobs(glassdoorJobs, 'glassdoor');
        stats.glassdoor = glassdoorJobs.length;
      }
    }

    await browser.close();

    stats.total = stats.linkedin + stats.indeed + stats.glassdoor;

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Job import error:', error);
    res.status(500).json({ error: 'Failed to import jobs' });
  }
}

async function scrapeLinkedIn(browser, criteria) {
  const page = await browser.newPage();
  const jobs = [];

  try {
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Build LinkedIn search URL
    const searchParams = new URLSearchParams({
      keywords: criteria.keywords || '',
      location: criteria.location || '',
      f_TPR: criteria.datePosted || 'r86400', // 24 hours
      f_JT: criteria.jobType === 'Full-time' ? 'F' : '',
    });

    const url = `https://www.linkedin.com/jobs/search?${searchParams.toString()}`;
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    // Extract job listings
    const jobElements = await page.$$('.job-search-card');

    for (let i = 0; i < Math.min(jobElements.length, 20); i++) {
      try {
        const jobElement = jobElements[i];
        
        const title = await jobElement.$eval('.base-search-card__title', el => el.textContent.trim()).catch(() => '');
        const company = await jobElement.$eval('.base-search-card__subtitle', el => el.textContent.trim()).catch(() => '');
        const location = await jobElement.$eval('.job-search-card__location', el => el.textContent.trim()).catch(() => '');
        const link = await jobElement.$eval('a', el => el.href).catch(() => '');

        if (title && company) {
          jobs.push({
            title,
            company,
            location,
            external_url: link,
            source: 'linkedin',
            description: 'Job description will be fetched separately',
            job_type: criteria.jobType || 'Full-time',
            experience_level: criteria.experience || 'Mid',
            skills: [],
            requirements: [],
            benefits: []
          });
        }
      } catch (error) {
        console.error('Error extracting job:', error);
      }
    }
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
  } finally {
    await page.close();
  }

  return jobs;
}

async function scrapeIndeed(browser, criteria) {
  const page = await browser.newPage();
  const jobs = [];

  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    const searchParams = new URLSearchParams({
      q: criteria.keywords || '',
      l: criteria.location || '',
      fromage: criteria.datePosted === '24h' ? '1' : '7'
    });

    const url = `https://www.indeed.com/jobs?${searchParams.toString()}`;
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    const jobElements = await page.$$('[data-jk]');

    for (let i = 0; i < Math.min(jobElements.length, 20); i++) {
      try {
        const jobElement = jobElements[i];
        
        const title = await jobElement.$eval('h2 a span', el => el.textContent.trim()).catch(() => '');
        const company = await jobElement.$eval('.companyName', el => el.textContent.trim()).catch(() => '');
        const location = await jobElement.$eval('.companyLocation', el => el.textContent.trim()).catch(() => '');
        const salary = await jobElement.$eval('.salary-snippet', el => el.textContent.trim()).catch(() => '');
        const link = await jobElement.$eval('h2 a', el => `https://www.indeed.com${el.getAttribute('href')}`).catch(() => '');

        if (title && company) {
          jobs.push({
            title,
            company,
            location,
            salary_text: salary,
            external_url: link,
            source: 'indeed',
            description: 'Job description will be fetched separately',
            job_type: criteria.jobType || 'Full-time',
            experience_level: criteria.experience || 'Mid',
            skills: [],
            requirements: [],
            benefits: []
          });
        }
      } catch (error) {
        console.error('Error extracting Indeed job:', error);
      }
    }
  } catch (error) {
    console.error('Indeed scraping error:', error);
  } finally {
    await page.close();
  }

  return jobs;
}

async function scrapeGlassdoor(browser, criteria) {
  const page = await browser.newPage();
  const jobs = [];

  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    const searchParams = new URLSearchParams({
      sc: '0kf',
      kw: criteria.keywords || '',
      locT: 'C',
      locId: criteria.location || ''
    });

    const url = `https://www.glassdoor.com/Job/jobs.htm?${searchParams.toString()}`;
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);

    const jobElements = await page.$$('[data-test="job-listing"]');

    for (let i = 0; i < Math.min(jobElements.length, 15); i++) {
      try {
        const jobElement = jobElements[i];
        
        const title = await jobElement.$eval('[data-test="job-title"]', el => el.textContent.trim()).catch(() => '');
        const company = await jobElement.$eval('[data-test="employer-name"]', el => el.textContent.trim()).catch(() => '');
        const location = await jobElement.$eval('[data-test="job-location"]', el => el.textContent.trim()).catch(() => '');
        const salary = await jobElement.$eval('[data-test="detailSalary"]', el => el.textContent.trim()).catch(() => '');

        if (title && company) {
          jobs.push({
            title,
            company,
            location,
            salary_text: salary,
            source: 'glassdoor',
            description: 'Job description will be fetched separately',
            job_type: criteria.jobType || 'Full-time',
            experience_level: criteria.experience || 'Mid',
            skills: [],
            requirements: [],
            benefits: []
          });
        }
      } catch (error) {
        console.error('Error extracting Glassdoor job:', error);
      }
    }
  } catch (error) {
    console.error('Glassdoor scraping error:', error);
  } finally {
    await page.close();
  }

  return jobs;
}

async function saveJobs(jobs, source) {
  for (const job of jobs) {
    try {
      // Check if job already exists
      const { data: existing } = await supabase
        .from('jobs')
        .select('id')
        .eq('title', job.title)
        .eq('company', job.company)
        .eq('source', source)
        .single();

      if (!existing) {
        await supabase.from('jobs').insert({
          ...job,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  }
}