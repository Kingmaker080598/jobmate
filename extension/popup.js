document.getElementById('startButton').onclick = function() {
  chrome.tabs.create({
    url: 'https://jobmate-beta.vercel.app/login'
  });
};