// background.js

// Store auth state
let isAuthenticated = false;
let authToken = null;

// Check for stored auth state on startup
chrome.storage.local.get(['isAuthenticated', 'authToken'], (result) => {
  isAuthenticated = result.isAuthenticated || false;
  authToken = result.authToken || null;
  console.log('Background script initialized. Auth state:', isAuthenticated);
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);
  
  if (message.type === 'CHECK_AUTH') {
    sendResponse({ 
      isAuthenticated: isAuthenticated,
      authToken: authToken
    });
    return true;
  }
  
  if (message.type === 'LOGIN_SUCCESS') {
    console.log('Received login success with token length:', message.token?.length);
    
    // Store auth state
    isAuthenticated = true;
    authToken = message.token;
    
    // Save to storage
    chrome.storage.local.set({
      isAuthenticated: true,
      authToken: message.token
    }, () => {
      console.log('Auth state saved to storage');
    });
    
    // Notify popup about auth status change
    try {
      chrome.runtime.sendMessage({
        type: 'AUTH_STATUS_CHANGED',
        isAuthenticated: true,
        authToken: message.token
      });
    } catch (error) {
      console.log('Could not notify popup (popup may be closed):', error);
    }
    
    sendResponse({ success: true });
    return true;
  }
});

// Listen for tab updates to detect login success
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('jobmate-beta.vercel.app')) {
    console.log('JobMate tab updated, injecting auth content script');
    
    // Inject the content script to check for login success
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-auth.js']
    }).catch(err => {
      console.log('Auth script injection error (may be normal):', err.message);
    });
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('JobMate extension installed');
});