// content.js - Injected content script for scraping job descriptions from various job platforms

// Add initialization logging
console.log('🚀 JobMate: Content script initializing...');

// Ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 JobMate: DOM fully loaded');
});

function scrapeJobDescription() {
  try {
    console.log('🔍 JobMate: Starting job description scraping...');

    // Wait for content to be loaded
    if (!document.body) {
      console.log('❌ JobMate: Document body not ready');
      return null;
    }

    // 1. LinkedIn-specific selectors (updated)
    const linkedInSelectors = [
      '.jobs-description__content',
      '.jobs-unified-top-card__description',
      '.description__text',
      '[data-job-description]',
      '#job-details',
      '.jobs-description' // Added common LinkedIn selector
    ];
    
    for (const selector of linkedInSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`✅ JobMate: Found LinkedIn job description using selector: ${selector}`);
        return element.innerText.trim();
      }
    }

    // 2. Indeed-specific selectors (updated)
    const indeedSelectors = [
      '#jobDescriptionText',
      '.jobsearch-jobDescriptionText',
      '[data-testid="jobDescriptionText"]'
    ];

    for (const selector of indeedSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log('✅ JobMate: Found Indeed job description');
        return element.innerText.trim();
      }
    }

    // 3. Generic heading-based search with improved content detection
    const possibleHeadings = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, strong, b, .job-description, [class*="description"]')
    );

    for (let heading of possibleHeadings) {
      const text = heading.innerText.toLowerCase();
      if (
        text.includes('description') || 
        text.includes('job details') || 
        text.includes('about this job') ||
        text.includes('about the role')
      ) {
        // Look for content in parent container or siblings
        const parent = heading.parentElement;
        const content = parent.innerText.trim();
        
        if (content.length > 100) {
          console.log('✅ JobMate: Found job description via heading');
          return content;
        }

        // Check siblings
        let next = heading.nextElementSibling;
        while (next) {
          const siblingContent = next.innerText.trim();
          if (siblingContent.length > 100) {
            console.log('✅ JobMate: Found job description in sibling');
            return siblingContent;
          }
          next = next.nextElementSibling;
        }
      }
    }

    // 4. Deep scan with improved content validation
    const blocks = document.querySelectorAll('div, section, article, [class*="job"], [class*="description"]');
    for (let block of blocks) {
      const blockText = block.innerText.toLowerCase();
      if (
        (blockText.includes('responsibilities') ||
        blockText.includes('qualifications') ||
        blockText.includes('requirements') ||
        blockText.includes('we are looking for')) &&
        block.innerText.trim().length > 200 // Increased minimum length
      ) {
        console.log('✅ JobMate: Found job description via deep scan');
        return block.innerText.trim();
      }
    }

    console.log('❌ JobMate: No job description found');
    return null;
  } catch (error) {
    console.error('❌ JobMate scraping error:', error);
    return null;
  }
}

// Listen for message from popup to trigger scraping
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape_job') {
    console.log('📥 JobMate: Received scrape request');
    const description = scrapeJobDescription();
    if (description) {
      console.log('✅ JobMate: Successfully scraped job description');
      sendResponse({ success: true, description });
    } else {
      console.log('❌ JobMate: Failed to find job description');
      sendResponse({ success: false, message: 'No job description found. Please make sure you are on a job posting page.' });
    }
  } else if (request.action === 'auto_fill' && request.profileData) {
    console.log('📥 JobMate: Received auto-fill request');
    const success = autoFillForm(request.profileData);
    sendResponse({ success });
  }
  return true; // Keep message channel open
});

// Function to auto-fill form fields
async function autoFillForm(profileData) {
  try {
    console.log('🤖 JobMate: Starting auto-fill...');
    
    // Enhanced field detection patterns
    const fieldMappings = {
      // Name fields
      'first[_-]?name|fname|first|given[_-]?name': profileData.first_name,
      'last[_-]?name|lname|last|family[_-]?name|surname': profileData.last_name,
      'full[_-]?name|name': `${profileData.first_name} ${profileData.last_name}`,
      
      // Contact fields
      'email|e[-]?mail|username': profileData.email,
      'phone|mobile|cell|contact[_-]?number': profileData.phone,
      
      // Location fields
      'location|address|city|state|zip|postal': profileData.location,
      
      // Professional fields
      'linkedin|linked[-]?in|li[-]?profile': profileData.linkedin_url,
      'portfolio|website|personal[-]?site': profileData.portfolio_url,
      'github|git[-]?hub': profileData.github_url,
      
      // Experience fields
      'years[_-]?of[_-]?experience|experience|yoe': profileData.years_of_experience,
      'education|degree|qualification': profileData.education,
      
      // Additional fields
      'preferred[_-]?pronouns|pronouns': profileData.pronouns,
      'gender|sex': profileData.gender,
      'ethnicity|race': profileData.race_ethnicity,
      'disability': profileData.disability_status,
      'veteran[_-]?status|military': profileData.veteran_status,
      
      // Work authorization
      'work[_-]?authorization|work[_-]?permit': profileData.work_auth_status,
      'visa[_-]?sponsorship|require[_-]?sponsorship': profileData.needs_sponsorship ? 'Yes' : 'No',
      'legally[_-]?authorized': profileData.work_auth_status === 'authorized' ? 'Yes' : 'No',
      
      // Preferences
      'relocation|willing[_-]?to[_-]?relocate': profileData.willing_to_relocate ? 'Yes' : 'No',
      'remote|work[_-]?remotely': profileData.prefers_remote ? 'Yes' : 'No',
      'salary|compensation|pay[_-]?expectation': profileData.expected_salary
    };

    // Find and fill input fields using multiple strategies
    for (const [pattern, value] of Object.entries(fieldMappings)) {
      if (!value) continue;

      // Strategy 1: Direct attribute matching
      const regex = new RegExp(pattern, 'i');
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      
      for (const input of inputs) {
        const matchesPattern = (
          regex.test(input.id) || 
          regex.test(input.name) || 
          regex.test(input.placeholder) ||
          regex.test(input.getAttribute('aria-label')) ||
          regex.test(input.getAttribute('data-field')) ||
          regex.test(input.getAttribute('data-test')) ||
          regex.test(input.getAttribute('automation-id'))
        );

        if (matchesPattern) {
          await fillField(input, value);
        }
      }

      // Strategy 2: Label-based matching
      const labels = Array.from(document.querySelectorAll('label'));
      for (const label of labels) {
        if (regex.test(label.textContent)) {
          const input = document.querySelector(`#${label.getAttribute('for')}`) ||
                       label.querySelector('input, select, textarea');
          if (input) {
            await fillField(input, value);
          }
        }
      }
    }
    
    console.log('✅ JobMate: Auto-fill complete!');
    return true;
  } catch (error) {
    console.error('❌ JobMate: Auto-fill error:', error);
    return false;
  }
}

// Helper function to fill fields with proper event triggering
async function fillField(input, value) {
  try {
    if (input.type === 'radio' || input.type === 'checkbox') {
      const options = document.querySelectorAll(`input[name="${input.name}"]`);
      for (const option of options) {
        if (option.value.toLowerCase() === String(value).toLowerCase()) {
          option.checked = true;
          option.dispatchEvent(new Event('change', { bubbles: true }));
          option.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    } else if (input.tagName === 'SELECT') {
      const options = Array.from(input.options);
      const matchingOption = options.find(opt => 
        opt.text.toLowerCase().includes(String(value).toLowerCase())
      );
      if (matchingOption) {
        input.value = matchingOption.value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  } catch (error) {
    console.error('Failed to fill field:', error);
  }
}
