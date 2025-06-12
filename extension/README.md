# JobMate Chrome Extension

The JobMate Chrome Extension allows you to scrape job details and auto-fill application forms directly from your browser.

## Features

- 🔍 **Job Scraping**: Extract job details from LinkedIn, Indeed, Glassdoor, and more
- ⚡ **Auto-Fill**: Fill application forms using your JobMate profile
- 🔗 **Seamless Integration**: Works with the main JobMate web application

## Installation & Testing

### Method 1: Load Unpacked Extension (For Testing)

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/` in your Chrome browser
   - Or click the three dots menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to the `extension` folder in your JobMate project
   - Select the folder and click "Select Folder"

4. **Verify Installation**
   - You should see the JobMate extension appear in your extensions list
   - The JobMate icon should appear in your browser toolbar

### Method 2: Pack Extension (For Distribution)

1. **Pack the Extension**
   - In Chrome extensions page, click "Pack extension"
   - Select the `extension` folder as the Extension root directory
   - Click "Pack Extension"

2. **Install Packed Extension**
   - A `.crx` file will be created
   - Drag and drop the `.crx` file into Chrome to install

## How to Test the Extension

### 1. Sign In to JobMate
- First, make sure you're signed in to JobMate at `https://jobmate-beta.vercel.app`
- Complete your profile in the Profile section

### 2. Test Job Scraping
1. Navigate to a job posting on:
   - LinkedIn: `https://linkedin.com/jobs/view/[job-id]`
   - Indeed: `https://indeed.com/viewjob?jk=[job-id]`
   - Glassdoor: `https://glassdoor.com/job-listing/[job-title]`

2. Click the JobMate extension icon in your toolbar
3. The extension should detect the job page and show scraping options
4. Click "Scrape Job" to extract job details

### 3. Test Auto-Fill
1. Navigate to a job application form
2. Click the JobMate extension icon
3. Click "Auto-Fill Application" 
4. The extension will fill form fields using your saved profile data

### 4. Test Authentication
1. If not signed in, the extension will show a "Sign In" button
2. Clicking it will open JobMate in a new tab for authentication
3. After signing in, return to the extension to use features

## Supported Job Sites

- **LinkedIn Jobs** - Full support for job scraping and auto-fill
- **Indeed** - Job scraping and basic auto-fill
- **Glassdoor** - Job scraping and basic auto-fill
- **Generic Sites** - Basic auto-fill functionality

## Troubleshooting

### Extension Not Loading
- Make sure Developer mode is enabled
- Check that all files are present in the extension folder
- Look for errors in the Chrome extensions page

### Auto-Fill Not Working
- Ensure you're signed in to JobMate
- Complete your profile information
- Some sites may have anti-bot protection

### Job Scraping Fails
- Some job sites require authentication
- Dynamic content may not be accessible
- Try refreshing the page and trying again

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup UI
├── popup.js              # Popup functionality
├── content.js            # Content script for page interaction
├── content-auth.js       # Authentication content script
├── background.js         # Background service worker
└── icons/               # Extension icons
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## Development

### Making Changes
1. Edit the extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the JobMate extension
4. Test your changes

### Debugging
- Right-click the extension icon → "Inspect popup" to debug popup
- Use Chrome DevTools Console to see content script logs
- Check the Extensions page for error messages

## Security & Privacy

- The extension only accesses job-related pages
- Authentication is handled securely through JobMate
- No sensitive data is stored locally in the extension
- All data is synced with your JobMate account

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Ensure you're using a supported Chrome version (88+)
3. Try disabling other extensions that might conflict
4. Contact support through the JobMate web application