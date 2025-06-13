console.log('JobMate Extension: Popup script loaded');

// Configuration
const JOBMATE_BASE_URL = 'https://jobmate-beta.vercel.app';
const LOCAL_BASE_URL = 'http://localhost:3000';

// State management
let currentUser = null;
let userProfile = null;
let isAuthenticated = false;

// DOM elements
const startButton = document.getElementById('startButton');
const autoFillButton = document.getElementById('autoFillButton');
const logoutButton = document.getElementById('logoutButton');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('JobMate Extension: DOM loaded, initializing...');
  await initializePopup();
});

async function initializePopup() {
  try {
    // Check authentication status
    await checkAuthStatus();
    
    // Update UI based on auth status
    updateUI();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('JobMate Extension: Popup initialized successfully');
  } catch (error) {
    console.error('JobMate Extension: Initialization error:', error);
    showError('Failed to initialize extension');
  }
}

async function checkAuthStatus() {
  try {
    console.log('JobMate Extension: Checking authentication status...');
    
    // Try to get stored token
    const result = await chrome.storage.local.get(['jobmate_extension_token']);
    const token = result.jobmate_extension_token;
    
    if (!token) {
      console.log('JobMate Extension: No token found');
      isAuthenticated = false;
      return;
    }
    
    console.log('JobMate Extension: Token found, verifying...');
    
    // Verify token and get user profile
    const profile = await fetchUserProfile(token);
    
    if (profile && profile.authenticated) {
      console.log('JobMate Extension: User authenticated:', profile.user_id);
      isAuthenticated = true;
      currentUser = { id: profile.user_id };
      userProfile = profile;
    } else {
      console.log('JobMate Extension: Token invalid or expired');
      isAuthenticated = false;
      // Clear invalid token
      await chrome.storage.local.remove(['jobmate_extension_token']);
    }
  } catch (error) {
    console.error('JobMate Extension: Auth check error:', error);
    isAuthenticated = false;
  }
}

async function fetchUserProfile(token) {
  try {
    console.log('JobMate Extension: Fetching user profile...');
    
    // Try production URL first, then local
    const urls = [
      `${JOBMATE_BASE_URL}/api/profile?token=${encodeURIComponent(token)}`,
      `${LOCAL_BASE_URL}/api/profile?token=${encodeURIComponent(token)}`
    ];
    
    for (const url of urls) {
      try {
        console.log('JobMate Extension: Trying URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('JobMate Extension: Profile response status:', response.status);
        
        if (response.ok) {
          const profile = await response.json();
          console.log('JobMate Extension: Profile fetched successfully');
          return profile;
        } else if (response.status === 401) {
          console.log('JobMate Extension: Token expired or invalid');
          return null;
        }
      } catch (fetchError) {
        console.log('JobMate Extension: Failed to fetch from:', url, fetchError.message);
        continue;
      }
    }
    
    throw new Error('Could not reach JobMate servers');
  } catch (error) {
    console.error('JobMate Extension: Profile fetch error:', error);
    throw error;
  }
}

function updateUI() {
  console.log('JobMate Extension: Updating UI, authenticated:', isAuthenticated);
  
  if (isAuthenticated && userProfile) {
    // Show authenticated state
    startButton.style.display = 'none';
    autoFillButton.style.display = 'block';
    logoutButton.style.display = 'block';
    
    // Update button text with user info
    if (userProfile.first_name) {
      autoFillButton.textContent = `Auto-Fill (${userProfile.first_name})`;
    }
  } else {
    // Show unauthenticated state
    startButton.style.display = 'block';
    autoFillButton.style.display = 'none';
    logoutButton.style.display = 'none';
  }
}

function setupEventListeners() {
  // Sign in button
  startButton.addEventListener('click', handleSignIn);
  
  // Auto-fill button
  autoFillButton.addEventListener('click', handleAutoFill);
  
  // Logout button
  logoutButton.addEventListener('click', handleLogout);
}

async function handleSignIn() {
  try {
    console.log('JobMate Extension: Starting sign-in process...');
    
    // Open JobMate login page
    const loginUrl = `${JOBMATE_BASE_URL}/login?extension=true`;
    
    await chrome.tabs.create({ 
      url: loginUrl,
      active: true 
    });
    
    // Listen for successful authentication
    setupAuthListener();
    
  } catch (error) {
    console.error('JobMate Extension: Sign-in error:', error);
    showError('Failed to open sign-in page');
  }
}

function setupAuthListener() {
  // Listen for messages from the web app
  const messageListener = (message, sender, sendResponse) => {
    if (message.type === 'JOBMATE_LOGIN_SUCCESS' && message.token) {
      console.log('JobMate Extension: Login success received');
      
      // Store the token
      chrome.storage.local.set({ 
        jobmate_extension_token: message.token 
      }).then(() => {
        console.log('JobMate Extension: Token stored successfully');
        
        // Refresh popup state
        checkAuthStatus().then(() => {
          updateUI();
          showSuccess('Successfully signed in to JobMate!');
        });
      });
      
      // Remove listener
      chrome.runtime.onMessage.removeListener(messageListener);
    }
  };
  
  chrome.runtime.onMessage.addListener(messageListener);
  
  // Also listen for storage changes (in case token is set from web app)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.jobmate_extension_token) {
      console.log('JobMate Extension: Token updated via storage');
      checkAuthStatus().then(() => {
        updateUI();
      });
    }
  });
}

async function handleAutoFill() {
  try {
    console.log('JobMate Extension: Starting auto-fill process...');
    
    if (!isAuthenticated || !userProfile) {
      showError('Please sign in first');
      return;
    }
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showError('No active tab found');
      return;
    }
    
    console.log('JobMate Extension: Auto-filling on:', tab.url);
    
    // Inject content script and perform auto-fill
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: performAutoFill,
      args: [userProfile]
    });
    
    showSuccess('Auto-fill completed!');
    
  } catch (error) {
    console.error('JobMate Extension: Auto-fill error:', error);
    showError('Auto-fill failed: ' + error.message);
  }
}

// This function runs in the context of the web page
function performAutoFill(profile) {
  console.log('JobMate Extension: Performing auto-fill with profile:', profile);
  
  try {
    let fieldsFound = 0;
    let fieldsFilled = 0;
    
    // Common field mappings
    const fieldMappings = [
      // Name fields
      { selectors: ['input[name*="first"], input[id*="first"], input[placeholder*="first" i]'], value: profile.first_name },
      { selectors: ['input[name*="last"], input[id*="last"], input[placeholder*="last" i]'], value: profile.last_name },
      { selectors: ['input[name*="name"], input[id*="name"], input[placeholder*="full name" i]'], value: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() },
      
      // Contact fields
      { selectors: ['input[type="email"], input[name*="email"], input[id*="email"]'], value: profile.email },
      { selectors: ['input[type="tel"], input[name*="phone"], input[id*="phone"]'], value: profile.phone },
      
      // Location fields
      { selectors: ['input[name*="location"], input[id*="location"], input[name*="city"], input[id*="city"]'], value: profile.location },
      { selectors: ['input[name*="address"], input[id*="address"]'], value: profile.location },
      
      // Professional fields
      { selectors: ['input[name*="linkedin"], input[id*="linkedin"]'], value: profile.linkedin_url },
      { selectors: ['input[name*="portfolio"], input[id*="portfolio"], input[name*="website"], input[id*="website"]'], value: profile.portfolio_url },
      { selectors: ['input[name*="experience"], input[id*="experience"], select[name*="experience"]'], value: profile.years_of_experience },
      { selectors: ['input[name*="salary"], input[id*="salary"]'], value: profile.expected_salary },
      
      // Work authorization
      { selectors: ['select[name*="authorization"], select[id*="authorization"], select[name*="visa"], select[id*="visa"]'], value: profile.work_auth_status },
      { selectors: ['select[name*="sponsorship"], select[id*="sponsorship"]'], value: profile.needs_sponsorship ? 'Yes' : 'No' },
      { selectors: ['select[name*="relocate"], select[id*="relocate"]'], value: profile.willing_to_relocate ? 'Yes' : 'No' },
      { selectors: ['select[name*="remote"], select[id*="remote"]'], value: profile.prefers_remote ? 'Yes' : 'No' },
      
      // Additional fields
      { selectors: ['textarea[name*="cover"], textarea[id*="cover"]'], value: profile.cover_letter_template },
      { selectors: ['input[name*="availability"], input[id*="availability"]'], value: profile.availability_date },
      { selectors: ['select[name*="gender"], select[id*="gender"]'], value: profile.gender },
      { selectors: ['select[name*="veteran"], select[id*="veteran"]'], value: profile.veteran_status },
      { selectors: ['select[name*="disability"], select[id*="disability"]'], value: profile.disability_status }
    ];
    
    // Process each field mapping
    fieldMappings.forEach(mapping => {
      if (!mapping.value) return;
      
      mapping.selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element && !element.value && element.offsetParent !== null) { // Only fill visible, empty fields
            fieldsFound++;
            
            try {
              if (element.tagName.toLowerCase() === 'select') {
                // Handle select elements
                const options = Array.from(element.options);
                const matchingOption = options.find(option => 
                  option.text.toLowerCase().includes(mapping.value.toLowerCase()) ||
                  option.value.toLowerCase().includes(mapping.value.toLowerCase())
                );
                
                if (matchingOption) {
                  element.value = matchingOption.value;
                  element.dispatchEvent(new Event('change', { bubbles: true }));
                  fieldsFilled++;
                }
              } else {
                // Handle input and textarea elements
                element.value = mapping.value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                fieldsFilled++;
              }
            } catch (fillError) {
              console.warn('JobMate Extension: Error filling field:', fillError);
            }
          }
        });
      });
    });
    
    console.log(`JobMate Extension: Auto-fill complete. Found ${fieldsFound} fields, filled ${fieldsFilled} fields`);
    
    // Show visual feedback
    if (fieldsFilled > 0) {
      showPageNotification(`✅ Auto-filled ${fieldsFilled} fields successfully!`);
    } else {
      showPageNotification('ℹ️ No fillable fields found on this page');
    }
    
  } catch (error) {
    console.error('JobMate Extension: Auto-fill execution error:', error);
    showPageNotification('❌ Auto-fill failed: ' + error.message);
  }
}

// Helper function to show notifications on the page
function showPageNotification(message) {
  // Remove existing notification
  const existing = document.getElementById('jobmate-notification');
  if (existing) {
    existing.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'jobmate-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

async function handleLogout() {
  try {
    console.log('JobMate Extension: Logging out...');
    
    // Clear stored token
    await chrome.storage.local.remove(['jobmate_extension_token']);
    
    // Reset state
    isAuthenticated = false;
    currentUser = null;
    userProfile = null;
    
    // Update UI
    updateUI();
    
    showSuccess('Successfully logged out');
    
  } catch (error) {
    console.error('JobMate Extension: Logout error:', error);
    showError('Logout failed');
  }
}

function showSuccess(message) {
  console.log('JobMate Extension: Success:', message);
  // You could add a visual success indicator here
}

function showError(message) {
  console.error('JobMate Extension: Error:', message);
  // You could add a visual error indicator here
}

// Listen for messages from content scripts or web app
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('JobMate Extension: Received message:', message);
  
  if (message.type === 'JOBMATE_LOGIN_SUCCESS') {
    handleAuthSuccess(message.token);
  }
  
  return true; // Keep message channel open for async response
});

async function handleAuthSuccess(token) {
  try {
    console.log('JobMate Extension: Handling auth success...');
    
    // Store token
    await chrome.storage.local.set({ jobmate_extension_token: token });
    
    // Update state
    await checkAuthStatus();
    updateUI();
    
    showSuccess('Authentication successful!');
  } catch (error) {
    console.error('JobMate Extension: Auth success handling error:', error);
  }
}