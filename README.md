# Read Shortly by CSBD

A Chrome extension that helps you quickly summarize long Facebook posts and articles using Google's Gemini AI.

## Features

- Summarize long Facebook posts or articles with one click
- Directly paste text into the extension to summarize without having to be on the source page
- Select specific text to summarize or let the extension detect the main content
- Floating button for easy access on any page
- Customize with your own Gemini API key
- Clean, modern UI with Merriweather Sans font
- No data is saved in our database - all processing happens via the Gemini API
- Toggle between English and translated summaries

## Installation

### From source code:

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" at the top-right
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed in your browser

## Usage

### Summarizing content from a webpage:
1. Navigate to a Facebook post or article you want to summarize
2. Click the "Read Shortly" extension icon in your browser toolbar
3. Select the "Page Content" tab
4. Click "Summarize This Page" and wait for the summary to appear
5. Alternatively, select specific text on the page before clicking "Summarize This Page"

### Summarizing text directly:
1. Click the "Read Shortly" extension icon
2. Select the "Your Text" tab
3. Paste the text you want to summarize
4. Click "Summarize Text" button
5. View the generated summary

## Configuration

### API Key Setup
There are three ways to set up your API key:

1. **In the extension UI**:
   - Click the extension icon
   - Click the "Settings" button
   - Enter your Gemini API key in the field
   - Click "Apply Settings"

2. **In the config.js file**:
   - Open `config.js` in the extension directory
   - Replace the default API key with your own
   - Save the file

3. **In the extension options**:
   - Right-click the extension icon and select "Options"
   - Enter your Gemini API key
   - Click "Save"

### Other Settings
- Summary style (concise, detailed, bullet points, etc.)
- Summary length
- Translation language
- Theme (light/dark mode)

## Technical Details

This extension uses:
- Google's Gemini 2.0 Flash API for text summarization
- Content scripts to extract text from web pages
- Chrome's extension storage for saving settings
- Merriweather Sans font for a clean reading experience
- Config.js file for API key management

## Privacy

This extension sends text content to Google's Gemini API for processing. No personal data or text content is collected or stored in any database beyond what is necessary for the summarization function. All text processing happens directly through the Google Gemini API.

## License

MIT License 