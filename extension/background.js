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
    return true; // Keep the message channel open for async response
  }
  
  if (message.type === 'LOGIN_SUCCESS') {
    console.log('Received login success with token');
    
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

// Listen for tab updates to detect login success
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('jobmate-beta.vercel.app')) {
    // Inject the content script to check for login success
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-auth.js']
    }).catch(err => console.error('Script injection error:', err));
  }
});
