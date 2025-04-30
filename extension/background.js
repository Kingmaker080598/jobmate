// background.js

// Store auth state
let isAuthenticated = false;
let authToken = null;

// Check for stored auth state on startup
chrome.storage.local.get(['isAuthenticated', 'authToken'], (result) => {
  isAuthenticated = result.isAuthenticated || false;
  authToken = result.authToken || null;
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_AUTH') {
    sendResponse({ 
      isAuthenticated: isAuthenticated,
      authToken: authToken
    });
  }
});

// Listen for tab updates to detect login success
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('jobmate-beta.vercel.app')) {
    // Inject a content script to check for login success
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: checkForLoginSuccess
    });
  }
});

// Function to check for login success
function checkForLoginSuccess() {
  // Listen for the login success message
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'JOBMATE_LOGIN_SUCCESS') {
      // Send the token to the background script
      chrome.runtime.sendMessage({
        type: 'LOGIN_SUCCESS',
        token: event.data.token
      });
    }
  });
  
  // Check if token is already in localStorage
  const token = localStorage.getItem('jobmate_extension_token');
  if (token) {
    chrome.runtime.sendMessage({
      type: 'LOGIN_SUCCESS',
      token: token
    });
  }
}

// Listen for login success message from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LOGIN_SUCCESS') {
    // Store auth state
    isAuthenticated = true;
    authToken = message.token;
    
    // Save to storage
    chrome.storage.local.set({
      isAuthenticated: true,
      authToken: message.token
    });
    
    // Notify popup about auth status change
    chrome.runtime.sendMessage({
      type: 'AUTH_STATUS_CHANGED',
      isAuthenticated: true,
      authToken: message.token
    });
  }
});
