// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('JobMate Autofill Extension installed!');
});

// Store auth state and token
let isAuthenticated = false;
let authToken = null;

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.includes('jobmate-beta.vercel.app')) {
    console.log('Detected JobMate URL:', changeInfo.url);
    
    // Check if this is a successful login redirect
    if (changeInfo.url.includes('/dashboard') || 
        changeInfo.url.includes('/profile') || 
        changeInfo.url.includes('/home')) {
      console.log('Detected successful login!');
      
      // Execute script to get token from localStorage
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: () => localStorage.getItem('jobmate_extension_token')
        });
        
        const token = results[0].result;
        
        if (token) {
          console.log('Retrieved token from JobMate');
          isAuthenticated = true;
          authToken = token;
          
          // Store auth state and token
          await chrome.storage.local.set({ 
            isAuthenticated: true,
            authToken: token
          });
          
          // Notify popup about auth status change
          chrome.runtime.sendMessage({ 
            type: 'AUTH_STATUS_CHANGED', 
            isAuthenticated: true,
            authToken: token
          });
          
          // Close the login tab after successful login
          setTimeout(() => {
            chrome.tabs.remove(tabId);
          }, 2000);
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_AUTH') {
    chrome.storage.local.get(['isAuthenticated', 'authToken'], (result) => {
      sendResponse({ 
        isAuthenticated: result.isAuthenticated || false,
        authToken: result.authToken || null
      });
    });
    return true; // Keep the message channel open for async response
  }
});
