// content-auth.js - Enhanced authentication detection

console.log('JobMate auth content script loaded on:', window.location.href);

// Function to extract token from localStorage
function extractTokenFromStorage() {
  try {
    // Check for various possible token storage keys
    const possibleKeys = [
      'jobmate_extension_token',
      'supabase.auth.token',
      'sb-auth-token',
      'auth_token',
      'access_token'
    ];
    
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        console.log('Found token in localStorage with key:', key);
        return token;
      }
    }
    
    // Check sessionStorage as well
    for (const key of possibleKeys) {
      const token = sessionStorage.getItem(key);
      if (token) {
        console.log('Found token in sessionStorage with key:', key);
        return token;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting token from storage:', error);
    return null;
  }
}

// Function to generate token from current session
async function generateTokenFromSession() {
  try {
    console.log('Attempting to generate token from current session...');
    
    // Try to get token from the extension token API
    const response = await fetch('/api/extension-token', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        console.log('Successfully generated token from session');
        // Store the token for future use
        localStorage.setItem('jobmate_extension_token', data.token);
        return data.token;
      }
    } else {
      console.log('Token generation failed:', response.status);
    }
  } catch (error) {
    console.log('Error generating token from session:', error);
  }
  
  return null;
}

// Function to check if user is authenticated
function checkAuthenticationStatus() {
  // Check for signs of authentication in the page
  const authIndicators = [
    () => document.querySelector('[data-testid="user-menu"]'),
    () => document.querySelector('.nav-user'),
    () => document.querySelector('[class*="user"]'),
    () => document.querySelector('[class*="profile"]'),
    () => document.querySelector('button[class*="logout"]'),
    () => document.querySelector('a[href*="logout"]'),
    () => document.querySelector('a[href*="profile"]'),
    () => document.querySelector('[class*="dashboard"]'),
    () => window.location.pathname.includes('/home'),
    () => window.location.pathname.includes('/dashboard'),
    () => window.location.pathname.includes('/profile')
  ];
  
  return authIndicators.some(check => {
    try {
      return check();
    } catch (error) {
      return false;
    }
  });
}

// Main authentication detection logic
async function detectAndReportAuth() {
  console.log('Detecting authentication status...');
  
  // First, try to extract existing token
  let token = extractTokenFromStorage();
  
  // If no token found but user appears authenticated, generate one
  if (!token && checkAuthenticationStatus()) {
    console.log('User appears authenticated but no token found, generating token...');
    token = await generateTokenFromSession();
  }
  
  // If we have a token, report login success
  if (token) {
    console.log('Reporting login success to background script');
    
    try {
      chrome.runtime.sendMessage({
        type: 'LOGIN_SUCCESS',
        token: token
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending login success message:', chrome.runtime.lastError);
        } else {
          console.log('Login success message sent successfully');
        }
      });
    } catch (error) {
      console.error('Error sending message to background script:', error);
    }
  } else {
    console.log('No authentication token found');
  }
}

// Listen for the login success message from the page
window.addEventListener('message', (event) => {
  // Only accept messages from our application
  if (event.origin !== 'https://jobmate-beta.vercel.app') return;
  
  if (event.data && event.data.type === 'JOBMATE_LOGIN_SUCCESS') {
    console.log('Received login success message from page with token');
    
    // Store the token
    localStorage.setItem('jobmate_extension_token', event.data.token);
    
    // Send the token to the background script
    chrome.runtime.sendMessage({
      type: 'LOGIN_SUCCESS',
      token: event.data.token
    });
  }
});

// Run detection when script loads
detectAndReportAuth();

// Also run detection after a short delay to catch dynamic content
setTimeout(detectAndReportAuth, 2000);

// Run detection when page content changes
const observer = new MutationObserver((mutations) => {
  // Check if any significant changes occurred that might indicate login
  const significantChange = mutations.some(mutation => {
    return mutation.addedNodes.length > 0 || 
           (mutation.target && mutation.target.classList && 
            (mutation.target.classList.contains('user') || 
             mutation.target.classList.contains('nav') ||
             mutation.target.classList.contains('header')));
  });
  
  if (significantChange) {
    console.log('Significant page change detected, re-checking auth...');
    setTimeout(detectAndReportAuth, 1000);
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'data-testid']
});

// Clean up observer when page unloads
window.addEventListener('beforeunload', () => {
  observer.disconnect();
});