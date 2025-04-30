// Listen for the login success message from the page
window.addEventListener('message', (event) => {
  // Only accept messages from our application
  if (event.origin !== 'https://jobmate-beta.vercel.app') return;
  
  if (event.data && event.data.type === 'JOBMATE_LOGIN_SUCCESS') {
    console.log('Received login success message with token');
    
    // Send the token to the background script
    chrome.runtime.sendMessage({
      type: 'LOGIN_SUCCESS',
      token: event.data.token
    });
  }
});

// Also check if token is already in localStorage
const token = localStorage.getItem('jobmate_extension_token');
if (token) {
  console.log('Found token in localStorage');
  
  chrome.runtime.sendMessage({
    type: 'LOGIN_SUCCESS',
    token: token
  });
}