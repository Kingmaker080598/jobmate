console.log('JobMate Extension: Content script loaded on', window.location.href);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('JobMate Extension: Content script received message:', message);
  
  if (message.type === 'PERFORM_AUTO_FILL' && message.profile) {
    performAutoFill(message.profile);
    sendResponse({ success: true });
  }
  
  return true;
});

// Listen for authentication success from JobMate web app
window.addEventListener('message', (event) => {
  // Only accept messages from JobMate domains
  const allowedOrigins = [
    'https://jobmate-beta.vercel.app',
    'http://localhost:3000'
  ];
  
  if (!allowedOrigins.includes(event.origin)) {
    return;
  }
  
  if (event.data.type === 'JOBMATE_LOGIN_SUCCESS' && event.data.token) {
    console.log('JobMate Extension: Login success detected in content script');
    
    // Forward to extension
    chrome.runtime.sendMessage({
      type: 'JOBMATE_LOGIN_SUCCESS',
      token: event.data.token
    });
    
    // Store token in extension storage
    chrome.storage.local.set({ 
      jobmate_extension_token: event.data.token 
    });
  }
});

// Auto-fill function that runs in page context
function performAutoFill(profile) {
  console.log('JobMate Extension: Starting auto-fill with profile:', profile);
  
  try {
    let fieldsFound = 0;
    let fieldsFilled = 0;
    
    // Enhanced field mappings with more comprehensive selectors
    const fieldMappings = [
      // Name fields
      {
        selectors: [
          'input[name*="first" i]', 'input[id*="first" i]', 'input[placeholder*="first" i]',
          'input[name*="fname" i]', 'input[id*="fname" i]'
        ],
        value: profile.first_name,
        type: 'text'
      },
      {
        selectors: [
          'input[name*="last" i]', 'input[id*="last" i]', 'input[placeholder*="last" i]',
          'input[name*="lname" i]', 'input[id*="lname" i]', 'input[name*="surname" i]'
        ],
        value: profile.last_name,
        type: 'text'
      },
      {
        selectors: [
          'input[name*="fullname" i]', 'input[id*="fullname" i]', 'input[placeholder*="full name" i]',
          'input[name="name"]', 'input[id="name"]'
        ],
        value: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        type: 'text'
      },
      
      // Contact fields
      {
        selectors: [
          'input[type="email"]', 'input[name*="email" i]', 'input[id*="email" i]',
          'input[placeholder*="email" i]'
        ],
        value: profile.email,
        type: 'email'
      },
      {
        selectors: [
          'input[type="tel"]', 'input[name*="phone" i]', 'input[id*="phone" i]',
          'input[placeholder*="phone" i]', 'input[name*="mobile" i]'
        ],
        value: profile.phone,
        type: 'tel'
      },
      
      // Location fields
      {
        selectors: [
          'input[name*="location" i]', 'input[id*="location" i]', 'input[name*="city" i]',
          'input[id*="city" i]', 'input[name*="address" i]', 'input[id*="address" i]'
        ],
        value: profile.location,
        type: 'text'
      },
      
      // Professional fields
      {
        selectors: [
          'input[name*="linkedin" i]', 'input[id*="linkedin" i]', 'input[placeholder*="linkedin" i]'
        ],
        value: profile.linkedin_url,
        type: 'url'
      },
      {
        selectors: [
          'input[name*="portfolio" i]', 'input[id*="portfolio" i]', 'input[name*="website" i]',
          'input[id*="website" i]', 'input[placeholder*="portfolio" i]'
        ],
        value: profile.portfolio_url,
        type: 'url'
      },
      {
        selectors: [
          'input[name*="github" i]', 'input[id*="github" i]', 'input[placeholder*="github" i]'
        ],
        value: profile.github_url,
        type: 'url'
      },
      {
        selectors: [
          'input[name*="experience" i]', 'input[id*="experience" i]', 'select[name*="experience" i]',
          'select[id*="experience" i]'
        ],
        value: profile.years_of_experience,
        type: 'text'
      },
      {
        selectors: [
          'input[name*="salary" i]', 'input[id*="salary" i]', 'input[placeholder*="salary" i]',
          'input[name*="compensation" i]'
        ],
        value: profile.expected_salary,
        type: 'text'
      },
      {
        selectors: [
          'input[name*="education" i]', 'input[id*="education" i]', 'textarea[name*="education" i]'
        ],
        value: profile.education,
        type: 'text'
      },
      
      // Work authorization and legal
      {
        selectors: [
          'select[name*="authorization" i]', 'select[id*="authorization" i]',
          'select[name*="visa" i]', 'select[id*="visa" i]', 'select[name*="work_auth" i]'
        ],
        value: profile.work_auth_status,
        type: 'select'
      },
      {
        selectors: [
          'select[name*="sponsorship" i]', 'select[id*="sponsorship" i]',
          'input[name*="sponsorship" i]', 'input[id*="sponsorship" i]'
        ],
        value: profile.needs_sponsorship ? 'Yes' : 'No',
        type: 'select'
      },
      {
        selectors: [
          'select[name*="relocate" i]', 'select[id*="relocate" i]',
          'input[name*="relocate" i]', 'input[id*="relocate" i]'
        ],
        value: profile.willing_to_relocate ? 'Yes' : 'No',
        type: 'select'
      },
      {
        selectors: [
          'select[name*="remote" i]', 'select[id*="remote" i]',
          'input[name*="remote" i]', 'input[id*="remote" i]'
        ],
        value: profile.prefers_remote ? 'Yes' : 'No',
        type: 'select'
      },
      {
        selectors: [
          'select[name*="gender" i]', 'select[id*="gender" i]'
        ],
        value: profile.gender,
        type: 'select'
      },
      {
        selectors: [
          'select[name*="veteran" i]', 'select[id*="veteran" i]'
        ],
        value: profile.veteran_status,
        type: 'select'
      },
      {
        selectors: [
          'select[name*="disability" i]', 'select[id*="disability" i]'
        ],
        value: profile.disability_status,
        type: 'select'
      },
      {
        selectors: [
          'select[name*="race" i]', 'select[id*="race" i]', 'select[name*="ethnicity" i]'
        ],
        value: profile.race_ethnicity,
        type: 'select'
      },
      
      // Additional fields
      {
        selectors: [
          'textarea[name*="cover" i]', 'textarea[id*="cover" i]',
          'textarea[placeholder*="cover letter" i]'
        ],
        value: profile.cover_letter_template,
        type: 'textarea'
      },
      {
        selectors: [
          'input[name*="availability" i]', 'input[id*="availability" i]',
          'input[type="date"]'
        ],
        value: profile.availability_date,
        type: 'date'
      },
      {
        selectors: [
          'input[name*="notice" i]', 'input[id*="notice" i]'
        ],
        value: profile.notice_period,
        type: 'text'
      },
      {
        selectors: [
          'textarea[name*="skills" i]', 'textarea[id*="skills" i]',
          'input[name*="skills" i]', 'input[id*="skills" i]'
        ],
        value: profile.skills,
        type: 'text'
      }
    ];
    
    // Process each field mapping
    fieldMappings.forEach(mapping => {
      if (!mapping.value || mapping.value === 'undefined' || mapping.value === 'null') return;
      
      mapping.selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (element && isElementVisible(element) && isElementEmpty(element)) {
              fieldsFound++;
              
              if (fillElement(element, mapping.value, mapping.type)) {
                fieldsFilled++;
                console.log(`JobMate Extension: Filled ${selector} with "${mapping.value}"`);
              }
            }
          });
        } catch (selectorError) {
          console.warn('JobMate Extension: Error with selector:', selector, selectorError);
        }
      });
    });
    
    console.log(`JobMate Extension: Auto-fill complete. Found ${fieldsFound} fields, filled ${fieldsFilled} fields`);
    
    // Show visual feedback
    if (fieldsFilled > 0) {
      showPageNotification(`✅ JobMate: Auto-filled ${fieldsFilled} fields successfully!`, 'success');
    } else if (fieldsFound === 0) {
      showPageNotification('ℹ️ JobMate: No compatible form fields found on this page', 'info');
    } else {
      showPageNotification('ℹ️ JobMate: Found fields but they were already filled', 'info');
    }
    
  } catch (error) {
    console.error('JobMate Extension: Auto-fill execution error:', error);
    showPageNotification('❌ JobMate: Auto-fill failed - ' + error.message, 'error');
  }
}

// Helper function to check if element is visible
function isElementVisible(element) {
  return element.offsetParent !== null && 
         element.offsetWidth > 0 && 
         element.offsetHeight > 0 &&
         window.getComputedStyle(element).visibility !== 'hidden' &&
         window.getComputedStyle(element).display !== 'none';
}

// Helper function to check if element is empty
function isElementEmpty(element) {
  if (element.tagName.toLowerCase() === 'select') {
    return !element.value || element.value === '' || element.selectedIndex <= 0;
  }
  return !element.value || element.value.trim() === '';
}

// Helper function to fill an element
function fillElement(element, value, type) {
  try {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'select') {
      return fillSelectElement(element, value);
    } else if (tagName === 'input' || tagName === 'textarea') {
      return fillInputElement(element, value, type);
    }
    
    return false;
  } catch (error) {
    console.warn('JobMate Extension: Error filling element:', error);
    return false;
  }
}

// Helper function to fill select elements
function fillSelectElement(selectElement, value) {
  const options = Array.from(selectElement.options);
  
  // Try exact match first
  let matchingOption = options.find(option => 
    option.value.toLowerCase() === value.toLowerCase() ||
    option.text.toLowerCase() === value.toLowerCase()
  );
  
  // Try partial match if exact match fails
  if (!matchingOption) {
    matchingOption = options.find(option => 
      option.text.toLowerCase().includes(value.toLowerCase()) ||
      option.value.toLowerCase().includes(value.toLowerCase()) ||
      value.toLowerCase().includes(option.text.toLowerCase())
    );
  }
  
  if (matchingOption) {
    selectElement.value = matchingOption.value;
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    selectElement.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  
  return false;
}

// Helper function to fill input/textarea elements
function fillInputElement(element, value, type) {
  // Set the value
  element.value = value;
  
  // Trigger events to ensure the form recognizes the change
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
  
  // For some frameworks, also trigger focus and keyup events
  element.dispatchEvent(new Event('focus', { bubbles: true }));
  element.dispatchEvent(new Event('keyup', { bubbles: true }));
  
  return true;
}

// Helper function to show notifications on the page
function showPageNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.getElementById('jobmate-notification');
  if (existing) {
    existing.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'jobmate-notification';
  
  // Set styles based on type
  const colors = {
    success: { bg: '#10b981', border: '#059669' },
    error: { bg: '#ef4444', border: '#dc2626' },
    info: { bg: '#3b82f6', border: '#2563eb' }
  };
  
  const color = colors[type] || colors.info;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${color.bg};
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    border-left: 4px solid ${color.border};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    animation: slideInRight 0.3s ease-out;
    cursor: pointer;
  `;
  
  // Add animation styles if not already present
  if (!document.getElementById('jobmate-styles')) {
    const style = document.createElement('style');
    style.id = 'jobmate-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Click to dismiss
  notification.addEventListener('click', () => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Detect job application forms and show helpful hints
function detectJobApplicationForm() {
  const formIndicators = [
    'input[name*="resume"]', 'input[name*="cv"]',
    'input[name*="first"]', 'input[name*="last"]',
    'input[type="email"]', 'input[name*="phone"]',
    'textarea[name*="cover"]', 'select[name*="experience"]'
  ];
  
  const foundIndicators = formIndicators.filter(selector => 
    document.querySelector(selector)
  ).length;
  
  if (foundIndicators >= 3) {
    console.log('JobMate Extension: Job application form detected');
    return true;
  }
  
  return false;
}

// Initialize content script
(function() {
  console.log('JobMate Extension: Content script initialized');
  
  // Detect if this is a job application form
  setTimeout(() => {
    if (detectJobApplicationForm()) {
      console.log('JobMate Extension: Job application form detected on page');
    }
  }, 1000);
})();