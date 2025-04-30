// popup.js

let isAuthenticated = false;

document.getElementById('startButton').addEventListener('click', () => {
  chrome.tabs.create({
    url: 'https://jobmate-beta.vercel.app/login?extension=true'
  });
});

async function checkAuthStatus() {
  try {
    // First check local storage
    const result = await chrome.storage.local.get(['isAuthenticated']);
    isAuthenticated = result.isAuthenticated || false;
    
    console.log('Auth status from storage:', isAuthenticated);
    
    // If authenticated from storage, just update UI
    if (isAuthenticated) {
      updateButtonVisibility();
      return;
    }
    
    // Otherwise, check with background script
    chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, (response) => {
      if (response && response.isAuthenticated) {
        isAuthenticated = true;
        chrome.storage.local.set({ isAuthenticated: true });
        updateButtonVisibility();
      } else {
        isAuthenticated = false;
        updateButtonVisibility();
      }
    });
  } catch (error) {
    console.error('Auth check failed:', error);
    isAuthenticated = false;
    await chrome.storage.local.set({ isAuthenticated: false });
    updateButtonVisibility();
  }
}

function updateButtonVisibility() {
  const startButton = document.getElementById('startButton');
  const autoFillButton = document.getElementById('autoFillButton');
  const logoutButton = document.getElementById('logoutButton');
  
  console.log('Updating button visibility. isAuthenticated:', isAuthenticated);
  
  if (isAuthenticated) {
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
  if (message.type === 'AUTH_STATUS_CHANGED') {
    console.log('Received auth status change message');
    checkAuthStatus();
  }
});

// In the autoFillButton click handler:

document.getElementById('autoFillButton').addEventListener('click', async () => {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // First, inject the content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // Then proceed with the message sending
    const response = await fetch('https://jobmate-beta.vercel.app/api/profile', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.error('Profile fetch failed:', await response.text());
      throw new Error('Failed to fetch profile data');
    }

    const profileData = await response.json();
    console.log('Profile data fetched:', profileData);

    // Send profile data to content script
    chrome.tabs.sendMessage(tab.id, { 
      action: 'auto_fill',
      profileData 
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError.message);
        alert('❌ Failed to auto-fill. Please make sure you are on an application page.');
      } else if (response?.success) {
        alert('✅ Successfully filled application fields!');
      } else {
        alert('✅ Auto-fill attempted. Some fields may not have been filled.');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    
    // Check if we're still authenticated
    const result = await chrome.storage.local.get(['isAuthenticated']);
    if (!result.isAuthenticated) {
      alert('❌ Please sign in to JobMate first');
    } else {
      alert('❌ Failed to auto-fill. Please try signing in again.');
      // Reset auth state
      await chrome.storage.local.set({ isAuthenticated: false });
      updateButtonVisibility();
    }
  }
});

// Add logout handling
document.getElementById('logoutButton').addEventListener('click', async () => {
  try {
    // Call logout endpoint
    await fetch('https://jobmate-beta.vercel.app/api/auth/logout', {
      credentials: 'include',
      method: 'POST'
    });
    
    // Clear local storage
    await chrome.storage.local.set({ isAuthenticated: false });
    isAuthenticated = false;
    updateButtonVisibility();
  } catch (error) {
    console.error('Logout failed:', error);
  }
});
