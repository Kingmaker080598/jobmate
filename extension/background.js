console.log('JobMate Extension: Background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('JobMate Extension: Installed/Updated', details.reason);
  
  if (details.reason === 'install') {
    // Set up initial configuration
    chrome.storage.local.set({
      jobmate_extension_version: '1.0.0',
      jobmate_settings: {
        autoFillEnabled: true,
        showNotifications: true
      }
    });
    
    console.log('JobMate Extension: Initial setup complete');
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('JobMate Extension: Background received message:', message);
  
  switch (message.type) {
    case 'JOBMATE_LOGIN_SUCCESS':
      handleLoginSuccess(message.token);
      break;
      
    case 'GET_AUTH_STATUS':
      getAuthStatus().then(sendResponse);
      return true; // Keep message channel open for async response
      
    case 'PERFORM_AUTO_FILL':
      performAutoFillOnActiveTab(message.profile);
      break;
      
    default:
      console.log('JobMate Extension: Unknown message type:', message.type);
  }
  
  return true;
});

// Handle login success
async function handleLoginSuccess(token) {
  try {
    console.log('JobMate Extension: Handling login success in background');
    
    // Store token
    await chrome.storage.local.set({ 
      jobmate_extension_token: token,
      jobmate_last_login: Date.now()
    });
    
    console.log('JobMate Extension: Token stored successfully');
    
    // Notify all tabs about successful login
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'JOBMATE_AUTH_UPDATE',
        authenticated: true
      }).catch(() => {
        // Ignore errors for tabs that don't have content script
      });
    });
    
  } catch (error) {
    console.error('JobMate Extension: Error handling login success:', error);
  }
}

// Get authentication status
async function getAuthStatus() {
  try {
    const result = await chrome.storage.local.get(['jobmate_extension_token']);
    const token = result.jobmate_extension_token;
    
    if (!token) {
      return { authenticated: false };
    }
    
    // Verify token is still valid (basic check)
    try {
      const tokenData = JSON.parse(atob(token));
      const isExpired = tokenData.exp && tokenData.exp < Date.now();
      
      if (isExpired) {
        // Clean up expired token
        await chrome.storage.local.remove(['jobmate_extension_token']);
        return { authenticated: false };
      }
      
      return { 
        authenticated: true, 
        userId: tokenData.userId,
        email: tokenData.email 
      };
    } catch (parseError) {
      console.error('JobMate Extension: Error parsing token:', parseError);
      return { authenticated: false };
    }
    
  } catch (error) {
    console.error('JobMate Extension: Error getting auth status:', error);
    return { authenticated: false };
  }
}

// Perform auto-fill on active tab
async function performAutoFillOnActiveTab(profile) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('JobMate Extension: No active tab found');
      return;
    }
    
    console.log('JobMate Extension: Performing auto-fill on tab:', tab.url);
    
    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, {
      type: 'PERFORM_AUTO_FILL',
      profile: profile
    });
    
  } catch (error) {
    console.error('JobMate Extension: Error performing auto-fill:', error);
  }
}

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Only inject on relevant pages (job sites, application forms)
    const relevantSites = [
      'linkedin.com',
      'indeed.com',
      'glassdoor.com',
      'workday.com',
      'greenhouse.io',
      'lever.co',
      'jobvite.com',
      'smartrecruiters.com'
    ];
    
    const isRelevantSite = relevantSites.some(site => tab.url.includes(site));
    
    if (isRelevantSite) {
      console.log('JobMate Extension: Relevant job site detected:', tab.url);
      
      // Inject content script if not already present
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(error => {
        // Ignore errors - content script might already be injected
        console.log('JobMate Extension: Content script injection skipped:', error.message);
      });
    }
  }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    console.log('JobMate Extension: Storage changed:', Object.keys(changes));
    
    if (changes.jobmate_extension_token) {
      console.log('JobMate Extension: Token updated');
      
      // Notify all tabs about auth status change
      chrome.tabs.query({}).then(tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'JOBMATE_AUTH_UPDATE',
            authenticated: !!changes.jobmate_extension_token.newValue
          }).catch(() => {
            // Ignore errors for tabs that don't have content script
          });
        });
      });
    }
  }
});

// Periodic token validation (every 30 minutes)
setInterval(async () => {
  try {
    const authStatus = await getAuthStatus();
    if (!authStatus.authenticated) {
      console.log('JobMate Extension: Token validation failed, cleaning up');
      await chrome.storage.local.remove(['jobmate_extension_token']);
    }
  } catch (error) {
    console.error('JobMate Extension: Error during token validation:', error);
  }
}, 30 * 60 * 1000); // 30 minutes

console.log('JobMate Extension: Background script initialized');