// popup.js

let isAuthenticated = false;
let authToken = null;

document.getElementById('startButton').addEventListener('click', () => {
  chrome.tabs.create({
    url: 'https://jobmate-beta.vercel.app/login?extension=true'
  });
});

async function checkAuthStatus() {
  try {
    console.log('Checking authentication status...');
    
    // First check local storage
    const result = await chrome.storage.local.get(['isAuthenticated', 'authToken']);
    isAuthenticated = result.isAuthenticated || false;
    authToken = result.authToken || null;
    
    console.log('Auth status from storage:', isAuthenticated, 'Token present:', !!authToken);
    
    // If authenticated from storage, validate the token
    if (isAuthenticated && authToken) {
      try {
        console.log('Validating stored token...');
        
        // Test the token by making a profile request
        const response = await fetch(`https://jobmate-beta.vercel.app/api/profile?token=${encodeURIComponent(authToken)}`, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('Token validation response:', response.status);
        
        if (response.ok) {
          console.log('Token is valid');
          updateButtonVisibility();
          return;
        } else {
          console.log('Token is invalid, clearing auth state');
          // Token is invalid, clear auth state
          await chrome.storage.local.set({ 
            isAuthenticated: false,
            authToken: null
          });
          isAuthenticated = false;
          authToken = null;
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        // Clear invalid auth state
        await chrome.storage.local.set({ 
          isAuthenticated: false,
          authToken: null
        });
        isAuthenticated = false;
        authToken = null;
      }
    }
    
    // If not authenticated or token invalid, check with background script
    chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError);
        updateButtonVisibility();
        return;
      }
      
      if (response && response.isAuthenticated && response.authToken) {
        console.log('Background script has valid auth');
        isAuthenticated = true;
        authToken = response.authToken;
        chrome.storage.local.set({ 
          isAuthenticated: true,
          authToken: response.authToken
        });
        updateButtonVisibility();
      } else {
        console.log('No valid auth from background script');
        isAuthenticated = false;
        authToken = null;
        updateButtonVisibility();
      }
    });
  } catch (error) {
    console.error('Auth check failed:', error);
    isAuthenticated = false;
    authToken = null;
    await chrome.storage.local.set({ 
      isAuthenticated: false,
      authToken: null
    });
    updateButtonVisibility();
  }
}

function updateButtonVisibility() {
  const startButton = document.getElementById('startButton');
  const autoFillButton = document.getElementById('autoFillButton');
  const logoutButton = document.getElementById('logoutButton');
  
  console.log('Updating button visibility. isAuthenticated:', isAuthenticated);
  
  if (isAuthenticated && authToken) {
    startButton.style.display = 'none';
    autoFillButton.style.display = 'block';
    logoutButton.style.display = 'block';
  } else {
    startButton.style.display = 'block';
    autoFillButton.style.display = 'none';
    logoutButton.style.display = 'none';
  }
}

// Check auth status when popup opens
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup opened, checking auth status');
  checkAuthStatus();
});

// Listen for auth status changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Popup received message:', message.type);
  
  if (message.type === 'AUTH_STATUS_CHANGED') {
    console.log('Received auth status change message');
    checkAuthStatus();
  }
});

// Auto-fill button click handler
document.getElementById('autoFillButton').addEventListener('click', async () => {
  try {
    console.log('Auto-fill button clicked');
    
    // Check if we have a valid token
    if (!authToken) {
      console.error('No auth token available');
      alert('❌ Please sign in to JobMate first');
      return;
    }

    // Get current tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    console.log('Current tab:', tab.url);

    // First, inject the content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      console.log('Content script injected successfully');
    } catch (scriptError) {
      console.error('Script injection error:', scriptError);
      alert('❌ Failed to inject content script. Please refresh the page and try again.');
      return;
    }

    // Fetch profile data with proper error handling
    console.log('Fetching profile data...');
    const profileResponse = await fetch(`https://jobmate-beta.vercel.app/api/profile?token=${encodeURIComponent(authToken)}`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Profile response status:', profileResponse.status);
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile fetch failed:', profileResponse.status, errorText);
      
      if (profileResponse.status === 401) {
        // Token expired or invalid
        await chrome.storage.local.set({ 
          isAuthenticated: false,
          authToken: null
        });
        isAuthenticated = false;
        authToken = null;
        updateButtonVisibility();
        alert('❌ Your session has expired. Please sign in again.');
        return;
      }
      
      throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    console.log('Profile data fetched successfully:', Object.keys(profileData));

    // Validate profile data
    if (!profileData || (!profileData.first_name && !profileData.email)) {
      alert('❌ Please complete your profile in JobMate before using auto-fill.');
      return;
    }

    // Send profile data to content script with timeout
    console.log('Sending profile data to content script...');
    
    const messagePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Content script response timeout'));
      }, 10000); // 10 second timeout

      chrome.tabs.sendMessage(tab.id, { 
        action: 'auto_fill',
        profileData 
      }, (response) => {
        clearTimeout(timeout);
        
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });

    const response = await messagePromise;
    
    if (response?.success) {
      alert('✅ Successfully filled application fields!');
    } else {
      alert('✅ Auto-fill attempted. Some fields may not have been filled due to page structure.');
    }

  } catch (error) {
    console.error('Auto-fill error:', error);
    
    if (error.message.includes('timeout')) {
      alert('❌ Auto-fill timed out. Please make sure you are on an application page and try again.');
    } else if (error.message.includes('Could not establish connection')) {
      alert('❌ Failed to connect to page. Please refresh the page and try again.');
    } else if (error.message.includes('Failed to fetch')) {
      alert('❌ Connection error. Please check your internet connection and try again.');
    } else {
      alert('❌ Auto-fill failed. Please try refreshing the page and signing in again if needed.');
    }
  }
});

// Add logout handling
document.getElementById('logoutButton').addEventListener('click', async () => {
  try {
    console.log('Logout button clicked');
    
    // Clear local storage
    await chrome.storage.local.set({ 
      isAuthenticated: false,
      authToken: null
    });
    isAuthenticated = false;
    authToken = null;
    updateButtonVisibility();
    alert('✅ Successfully logged out');
  } catch (error) {
    console.error('Logout failed:', error);
  }
});