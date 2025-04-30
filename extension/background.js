// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('JobMate Autofill Extension installed!');
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.includes('jobmate-beta.vercel.app')) {
    console.log('Detected JobMate URL:', changeInfo.url);
    
    // Check if this is a successful login redirect
    if (changeInfo.url.includes('/dashboard') || 
        changeInfo.url.includes('/profile') || 
        changeInfo.url.includes('/home')) {
      console.log('Detected successful login!');
      
      // Store auth state
      await chrome.storage.local.set({ isAuthenticated: true });
      
      // Notify popup about auth status change
      chrome.runtime.sendMessage({ type: 'AUTH_STATUS_CHANGED', isAuthenticated: true });
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_AUTH') {
    chrome.storage.local.get(['isAuthenticated'], (result) => {
      sendResponse({ isAuthenticated: result.isAuthenticated || false });
    });
    return true; // Keep the message channel open for async response
  }
});
