document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const summarizeBtn = document.getElementById('summarizeBtn');
  const summarizeTextBtn = document.getElementById('summarizeTextBtn');
  const userTextArea = document.getElementById('userText');
  const summaryDiv = document.getElementById('summary');
  const loader = document.getElementById('loader');
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.content');
  const historyList = document.getElementById('history-list');
  const historyEmpty = document.getElementById('history-empty');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const copyBtn = document.getElementById('copyBtn');
  const darkModeBtn = document.getElementById('darkModeBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settings-panel');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const summaryStyle = document.getElementById('summaryStyle');
  const lengthSlider = document.getElementById('lengthSlider');
  const lengthValue = document.getElementById('lengthValue');
  const targetLanguage = document.getElementById('targetLanguage');
  const autoSaveToggle = document.getElementById('autoSaveToggle');
  const tabSlider = document.querySelector('.tab-slider');
  const languageToggleBtn = document.getElementById('languageToggleBtn');
  
  // API key management
  let apiKey = '';
  
  // Get API key from config.js or storage
  function initializeApiKey() {
    // First try to get from storage (user's custom key)
    chrome.storage.sync.get('geminiApiKey', function(data) {
      if (data.geminiApiKey && data.geminiApiKey !== 'undefined' && data.geminiApiKey.length > 0) {
        apiKey = data.geminiApiKey;
      } else {
        // Fall back to config file
        apiKey = CONFIG.GEMINI_API_KEY;
        
        // Save the default key to storage for future reference
        chrome.storage.sync.set({ 'geminiApiKey': apiKey });
      }
      
      // Update UI if API key input exists
      const apiKeyInput = document.getElementById('apiKeyInput');
      if (apiKeyInput) {
        apiKeyInput.value = apiKey;
      }
    });
  }
  
  // Initialize API key
  initializeApiKey();
  
  // Default settings
  let settings = {
    darkMode: false,
    summaryStyle: 'concise',
    summaryLength: 3,
    targetLanguage: 'none',
    autoSave: true
  };
  
  // Variables to store both English and translated summaries
  let englishSummary = '';
  let translatedSummary = '';
  let currentLanguageView = 'english'; // 'english' or 'translated'
  
  // Initialize settings
  loadSettings();
  applySettings();
  
  // Preload appropriate fonts based on user language preference
  preloadLanguageFonts();
  
  // Initialize analytics
  const analyticsData = {
    summariesGenerated: 0,
    charactersProcessed: 0,
    lastUsed: new Date().toISOString()
  };
  
  loadAnalytics();
  
  // Add API key field to settings panel
  addApiKeyToSettings();
  
  // Function to add API key input to settings panel
  function addApiKeyToSettings() {
    // Check if the API key field already exists
    if (document.getElementById('apiKeyInput')) {
      return;
    }
    
    // Create API key input field and add it to settings panel
    const apiKeyGroup = document.createElement('div');
    apiKeyGroup.className = 'form-group';
    apiKeyGroup.innerHTML = `
      <label for="apiKeyInput">Gemini API Key</label>
      <input type="text" id="apiKeyInput" placeholder="Enter your Gemini API key" value="${apiKey || ''}">
      <div class="translation-note">
        Get your API key at <a href="#" id="getApiKeyLink">https://aistudio.google.com/app/apikey</a>
      </div>
    `;
    
    // Insert at the top of settings panel
    settingsPanel.insertBefore(apiKeyGroup, settingsPanel.firstChild);
    
    // Add event listener for API key link
    const getApiKeyLink = document.getElementById('getApiKeyLink');
    if (getApiKeyLink) {
      getApiKeyLink.addEventListener('click', function(e) {
        e.preventDefault();
        chrome.tabs.create({ url: 'https://aistudio.google.com/app/apikey' });
      });
    }
  }
  
  // Event listeners for settings
  lengthSlider.addEventListener('input', function() {
    lengthValue.textContent = this.value;
  });
  
  darkModeBtn.addEventListener('click', toggleDarkMode);
  
  settingsBtn.addEventListener('click', function() {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  });
  
  saveSettingsBtn.addEventListener('click', function() {
    saveSettings();
    // Preload fonts for the newly selected language
    preloadLanguageFonts();
  });
  
  targetLanguage.addEventListener('change', function() {
    // When language changes, preload fonts for that language
    preloadLanguageFonts(this.value);
  });
  
  // Load history on start
  loadHistory();
  
  // Tab switching with slider
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Move the slider
      moveSlider(index);
      
      // Show corresponding content
      const tabName = this.getAttribute('data-tab');
      document.getElementById(tabName + '-content').classList.add('active');
      
      // Clear summary when switching tabs
      if (tabName !== 'page' || !summaryDiv.textContent) {
        summaryDiv.textContent = '';
        copyBtn.style.display = 'none';
        
        // Remove any existing badge
        const existingBadge = document.querySelector('.summary-type');
        if (existingBadge) {
          existingBadge.remove();
        }
      }
      
      // Load history when switching to history tab
      if (tabName === 'history') {
        loadHistory();
      }
    });
  });
  
  // Initially position the slider under the active tab
  const initialActiveIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));
  if (initialActiveIndex >= 0) {
    moveSlider(initialActiveIndex);
  }
  
  // Move tab slider function
  function moveSlider(index) {
    const tabWidth = 100 / tabs.length;
    tabSlider.style.width = `calc(${tabWidth}% - 3px)`;
    tabSlider.style.left = `calc(${index * tabWidth}% + 4px)`;
  }
  
  // Copy button functionality
  copyBtn.addEventListener('click', function() {
    // Get the current displayed text based on the language view
    const textToCopy = currentLanguageView === 'english' ? englishSummary : translatedSummary;
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg> Copied!`;
        
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
        
        // Show toast notification
        showToast("Summary copied to clipboard!");
      });
    }
  });
  
  // Show toast notification
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--primary-color);
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 13px;
      z-index: 1000;
      box-shadow: var(--shadow);
      opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, -10px)';
    }, 10);
    
    // Animate out
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 10px)';
      
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2000);
  }
  
  // Clear history functionality
  clearHistoryBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all summary history?')) {
      chrome.storage.sync.set({ 'summaryHistory': [] }, function() {
        loadHistory();
        showToast("History cleared!");
      });
    }
  });
  
  // Check if there's any text selected by context menu
  chrome.storage.local.get('tempSelectedText', function(data) {
    if (data.tempSelectedText) {
      userTextArea.value = data.tempSelectedText;
      
      // Switch to the input tab
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      const inputTab = document.querySelector('.tab[data-tab="input"]');
      inputTab.classList.add('active');
      document.getElementById('input-content').classList.add('active');
      
      // Move slider
      const tabIndex = Array.from(tabs).findIndex(tab => tab.dataset.tab === 'input');
      moveSlider(tabIndex);
      
      // Clear the temporary storage
      chrome.storage.local.remove('tempSelectedText');
    }
  });
  
  // Handle page content summarization
  summarizeBtn.addEventListener('click', function() {
    summarizeFromPage(apiKey);
  });
  
  // Handle direct text input summarization
  summarizeTextBtn.addEventListener('click', function() {
    summarizeFromInput(apiKey);
  });
  
  // Function to save settings
  function saveSettings() {
    // Get API key from input
    const apiKeyInput = document.getElementById('apiKeyInput');
    if (apiKeyInput && apiKeyInput.value.trim() !== '') {
      apiKey = apiKeyInput.value.trim();
      chrome.storage.sync.set({ 'geminiApiKey': apiKey });
    }
    
    settings = {
      darkMode: document.body.classList.contains('dark-mode'),
      summaryStyle: summaryStyle.value,
      summaryLength: parseInt(lengthSlider.value),
      targetLanguage: targetLanguage.value,
      autoSave: autoSaveToggle.checked
    };
    
    chrome.storage.sync.set({ 'summarySettings': settings }, function() {
      settingsPanel.style.display = 'none';
      showToast("Settings saved successfully!");
    });
  }
  
  // Function to load settings
  function loadSettings() {
    chrome.storage.sync.get('summarySettings', function(data) {
      if (data.summarySettings) {
        settings = data.summarySettings;
      }
      
      // Apply settings to UI elements
      summaryStyle.value = settings.summaryStyle;
      lengthSlider.value = settings.summaryLength;
      lengthValue.textContent = settings.summaryLength;
      targetLanguage.value = settings.targetLanguage;
      autoSaveToggle.checked = settings.autoSave;
      
      if (settings.darkMode) {
        document.body.classList.add('dark-mode');
        darkModeBtn.textContent = 'Theme: Light';
      }
    });
  }
  
  // Function to apply settings (without saving)
  function applySettings() {
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
      darkModeBtn.textContent = 'Theme: Light';
    } else {
      document.body.classList.remove('dark-mode');
      darkModeBtn.textContent = 'Theme: Dark';
    }
  }
  
  // Toggle dark mode
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      darkModeBtn.textContent = 'Theme: Light';
    } else {
      darkModeBtn.textContent = 'Theme: Dark';
    }
  }
  
  // Function to load analytics data
  function loadAnalytics() {
    chrome.storage.sync.get('analyticsData', function(data) {
      if (data.analyticsData) {
        analyticsData.summariesGenerated = data.analyticsData.summariesGenerated || 0;
        analyticsData.charactersProcessed = data.analyticsData.charactersProcessed || 0;
      }
      
      // Update last used timestamp
      analyticsData.lastUsed = new Date().toISOString();
      saveAnalytics();
    });
  }
  
  // Function to save analytics data
  function saveAnalytics() {
    chrome.storage.sync.set({ 'analyticsData': analyticsData });
  }
  
  // Function to update analytics
  function updateAnalytics(textLength) {
    analyticsData.summariesGenerated++;
    analyticsData.charactersProcessed += textLength;
    analyticsData.lastUsed = new Date().toISOString();
    saveAnalytics();
  }
  
  // Function to load history
  function loadHistory() {
    chrome.storage.sync.get('summaryHistory', function(data) {
      historyList.innerHTML = '';
      
      if (!data.summaryHistory || data.summaryHistory.length === 0) {
        // Show empty state
        historyEmpty.style.display = 'block';
        return;
      }
      
      // Hide empty state
      historyEmpty.style.display = 'none';
      
      // Sort by date (newest first)
      const sortedHistory = data.summaryHistory.sort((a, b) => b.timestamp - a.timestamp);
      
      sortedHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // Title (truncate long source text)
        const title = document.createElement('div');
        title.className = 'history-title';
        title.textContent = truncateText(item.sourceText, 100);
        historyItem.appendChild(title);
        
        // Date
        const date = document.createElement('div');
        date.className = 'history-date';
        date.textContent = formatDate(item.timestamp);
        historyItem.appendChild(date);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'history-actions';
        
        // View button
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-sm';
        viewBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg> View';
        
        viewBtn.addEventListener('click', function() {
          // Get current language settings
          chrome.storage.sync.get('summarySettings', function(data) {
            const settings = data.summarySettings || { targetLanguage: 'none' };
            
            // Remove any existing language classes from summary container
            const summaryContainer = document.querySelector('.summary-container');
            summaryContainer.className = 'summary-container';
            
            // Set the English summary from history
            englishSummary = item.summary;
            
            // Set translated summary if available in history item, otherwise it will be empty
            translatedSummary = item.translatedSummary || '';
            
            // Start with English view
            currentLanguageView = 'english';
            summaryDiv.textContent = englishSummary;
            
            // Show copy button
            copyBtn.style.display = 'block';
            
            // Switch to page tab
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            document.querySelector('.tab[data-tab="page"]').classList.add('active');
            document.getElementById('page-content').classList.add('active');
            
            // Move slider to first tab
            moveSlider(0);
            
            // Add summary type badge with language toggle if applicable
            displaySummaryType(item.summaryStyle);
          });
        });
        actions.appendChild(viewBtn);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline';
        deleteBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
        deleteBtn.title = 'Delete';
        
        deleteBtn.addEventListener('click', function() {
          // Remove this item from history
          sortedHistory.splice(index, 1);
          chrome.storage.sync.set({ 'summaryHistory': sortedHistory }, function() {
            loadHistory();
            showToast("Summary deleted");
          });
        });
        actions.appendChild(deleteBtn);
        
        historyItem.appendChild(actions);
        historyList.appendChild(historyItem);
      });
    });
  }
  
  // Format date for history display
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  // Function to display summary type badge with language toggle
  function displaySummaryType(style) {
    // Remove any existing badge
    const existingBadge = document.querySelector('.summary-type');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Get language settings
    chrome.storage.sync.get('summarySettings', function(data) {
      const settings = data.summarySettings || { targetLanguage: 'none' };
      
      // Create a new badge
      const badge = document.createElement('div');
      badge.className = 'summary-type';
      
      let styleName = '';
      switch(style) {
        case 'concise': styleName = 'Concise Summary'; break;
        case 'detailed': styleName = 'Detailed Summary'; break;
        case 'bullet': styleName = 'Bullet Points'; break;
        case 'threeLines': styleName = 'Three Line Summary'; break;
        case 'simple': styleName = 'Simple Language'; break;
        case 'eli5': styleName = 'Explain Like I\'m 5'; break;
        default: styleName = 'Summary';
      }
      
      badge.textContent = styleName;
      
      // Add the badge to the summary container
      summaryDiv.insertAdjacentElement('beforebegin', badge);
      
      // Show language toggle button if a target language is selected
      if (settings.targetLanguage && settings.targetLanguage !== 'none' && translatedSummary) {
        const langName = getLanguageName(settings.targetLanguage);
        
        // Create language toggle button if it doesn't exist
        if (!document.getElementById('languageToggleBtn')) {
          const toggleBtn = document.createElement('button');
          toggleBtn.id = 'languageToggleBtn';
          toggleBtn.className = 'btn btn-sm language-toggle';
          toggleBtn.innerHTML = `<span class="toggle-text">English</span>`;
          toggleBtn.title = `Switch to ${langName}`;
          
          // Add click event to toggle between languages
          toggleBtn.addEventListener('click', toggleLanguage);
          
          // Add to summary container after the badge
          badge.insertAdjacentElement('afterend', toggleBtn);
        } else {
          // Update existing button
          const toggleBtn = document.getElementById('languageToggleBtn');
          toggleBtn.style.display = 'block';
          toggleBtn.querySelector('.toggle-text').textContent = 'English';
          toggleBtn.title = `Switch to ${langName}`;
        }
        
        // Add language class for styling if viewing translated version
        if (currentLanguageView === 'translated') {
          document.querySelector('.summary-container').classList.add(`lang-${settings.targetLanguage}`);
        } else {
          document.querySelector('.summary-container').classList.remove(`lang-${settings.targetLanguage}`);
        }
      } else {
        // Hide toggle button if no translation
        const toggleBtn = document.getElementById('languageToggleBtn');
        if (toggleBtn) {
          toggleBtn.style.display = 'none';
        }
        
        // Remove any language classes from summary container
        const summaryContainer = document.querySelector('.summary-container');
        summaryContainer.className = 'summary-container';
      }
    });
  }
  
  // Function to toggle between English and translated summaries
  function toggleLanguage() {
    chrome.storage.sync.get('summarySettings', function(data) {
      const settings = data.summarySettings || { targetLanguage: 'none' };
      const langName = getLanguageName(settings.targetLanguage);
      const toggleBtn = document.getElementById('languageToggleBtn');
      const summaryContainer = document.querySelector('.summary-container');
      
      if (currentLanguageView === 'english') {
        // Switch to translated view
        currentLanguageView = 'translated';
        summaryDiv.textContent = translatedSummary;
        toggleBtn.querySelector('.toggle-text').textContent = langName;
        toggleBtn.title = 'Switch to English';
        summaryContainer.classList.add(`lang-${settings.targetLanguage}`);
      } else {
        // Switch to English view
        currentLanguageView = 'english';
        summaryDiv.textContent = englishSummary;
        toggleBtn.querySelector('.toggle-text').textContent = 'English';
        toggleBtn.title = `Switch to ${langName}`;
        summaryContainer.classList.remove(`lang-${settings.targetLanguage}`);
      }
    });
  }
  
  // Save summary to history
  function saveToHistory(sourceText, summary, summaryStyle) {
    if (!settings.autoSave) return;
    
    chrome.storage.sync.get('summaryHistory', function(data) {
      let history = data.summaryHistory || [];
      
      // Limit to 20 entries
      if (history.length >= 20) {
        history.pop(); // Remove the oldest entry
      }
      
      // Get current language setting
      const currentLanguage = settings.targetLanguage;
      
      // Add new entry, including both English and translated versions
      history.unshift({
        sourceText: sourceText,
        summary: englishSummary,
        translatedSummary: translatedSummary,
        summaryStyle: summaryStyle,
        timestamp: Date.now(),
        language: currentLanguage
      });
      
      chrome.storage.sync.set({ 'summaryHistory': history });
    });
  }
  
  // Helper function to truncate text
  function truncateText(text, maxLength) {
    if (!text) return "Unknown content";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
  
  // Summarize from page content
  function summarizeFromPage(apiKey) {
    // Show loader
    loader.style.display = 'block';
    summaryDiv.textContent = '';
    copyBtn.style.display = 'none';
    
    // Remove any existing badge
    const existingBadge = document.querySelector('.summary-type');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Reset language toggle
    const toggleBtn = document.getElementById('languageToggleBtn');
    if (toggleBtn) {
      toggleBtn.style.display = 'none';
    }
    
    // Reset summaries and view state
    englishSummary = '';
    translatedSummary = '';
    currentLanguageView = 'english';
    
    // Get current tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: getPageContent
      }, async function(results) {
        if (chrome.runtime.lastError || !results || !results[0]) {
          summaryDiv.textContent = 'Error: Could not access page content.';
          loader.style.display = 'none';
          return;
        }
        
        const selectedText = results[0].result.selectedText;
        const pageText = results[0].result.pageText;
        const pageTitle = results[0].result.pageTitle;
        
        // Use selected text if available, otherwise use the extracted page text
        const textToSummarize = selectedText || pageText;
        const sourceIdentifier = pageTitle || 'Page Content';
        
        if (!textToSummarize || textToSummarize.trim().length < 100) {
          summaryDiv.textContent = 'Error: Not enough text to summarize. Please select more text or try a different page.';
          loader.style.display = 'none';
          return;
        }
        
        try {
          const summary = await getSummary(textToSummarize, apiKey);
          
          // Store both versions
          englishSummary = summary.english;
          translatedSummary = summary.translated;
          currentLanguageView = 'english';
          
          // Display English summary first
          summaryDiv.textContent = englishSummary;
          copyBtn.style.display = 'block';
          
          // Display summary type badge with language toggle if applicable
          displaySummaryType(settings.summaryStyle);
          
          // Update analytics
          updateAnalytics(textToSummarize.length);
          
          // Save to history (English version)
          saveToHistory(sourceIdentifier + ': ' + textToSummarize.substring(0, 100), englishSummary, settings.summaryStyle);
          
          // Show toast
          showToast("Summary generated!");
        } catch (error) {
          summaryDiv.textContent = 'Error: ' + error.message;
        }
        
        loader.style.display = 'none';
      });
    });
  }
  
  // Summarize from text input
  function summarizeFromInput(apiKey) {
    const textToSummarize = userTextArea.value.trim();
    
    if (!textToSummarize || textToSummarize.length < 100) {
      summaryDiv.textContent = 'Error: Please enter at least 100 characters to summarize.';
      return;
    }
    
    // Show loader
    loader.style.display = 'block';
    summaryDiv.textContent = '';
    copyBtn.style.display = 'none';
    
    // Remove any existing badge
    const existingBadge = document.querySelector('.summary-type');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Reset language toggle
    const toggleBtn = document.getElementById('languageToggleBtn');
    if (toggleBtn) {
      toggleBtn.style.display = 'none';
    }
    
    // Reset summaries and view state
    englishSummary = '';
    translatedSummary = '';
    currentLanguageView = 'english';
    
    // Process the user-provided text
    getSummary(textToSummarize, apiKey)
      .then(summary => {
        // Store both versions
        englishSummary = summary.english;
        translatedSummary = summary.translated;
        currentLanguageView = 'english';
        
        // Display English summary first
        summaryDiv.textContent = englishSummary;
        copyBtn.style.display = 'block';
        
        // Display summary type badge with language toggle if applicable
        displaySummaryType(settings.summaryStyle);
        
        // Update analytics
        updateAnalytics(textToSummarize.length);
        
        // Save to history (English version)
        saveToHistory('User Input: ' + textToSummarize.substring(0, 100), englishSummary, settings.summaryStyle);
        
        // Show toast
        showToast("Summary generated!");
      })
      .catch(error => {
        summaryDiv.textContent = 'Error: ' + error.message;
      })
      .finally(() => {
        loader.style.display = 'none';
      });
  }
});

// Function to extract text from the page
function getPageContent() {
  // Try to get selected text first
  let selectedText = window.getSelection().toString();
  
  // Get page title
  let pageTitle = document.title;
  
  // If no selection, try to find main content on Facebook
  let pageText = '';
  
  // Check if we're on Facebook
  if (window.location.hostname.includes('facebook.com')) {
    // Look for Facebook posts content
    const possiblePostSelectors = [
      '[data-ad-comet-preview="message"]', // Facebook post message
      '.userContent', // Older Facebook post content
      '.x1iorvi4', // Another possible Facebook class
      'div[data-ad-preview="message"]',
      '[role="article"]'
    ];
    
    for (const selector of possiblePostSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => {
          pageText += el.textContent + '\n\n';
        });
        break;
      }
    }
  }
  
  // If not on Facebook or no post found, try to get article content
  if (!pageText) {
    // Try to find article content
    const articleSelectors = [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main'
    ];
    
    for (const selector of articleSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => {
          pageText += el.textContent + '\n\n';
        });
        break;
      }
    }
  }
  
  // If still nothing, get body content as fallback
  if (!pageText) {
    pageText = document.body.innerText;
  }
  
  return { selectedText, pageText, pageTitle };
}

// Function to get summary from Gemini API
async function getSummary(text, apiKey) {
  // Get settings
  const settingsData = await new Promise((resolve) => {
    chrome.storage.sync.get('summarySettings', resolve);
  });
  
  const settings = settingsData.summarySettings || {
    summaryStyle: 'concise',
    summaryLength: 3,
    targetLanguage: 'none'
  };
  
  // Build prompt based on settings
  let prompt = '';
  let format = '';
  
  switch (settings.summaryStyle) {
    case 'concise':
      prompt = `Summarize the following text in a clear, concise way (about ${settings.summaryLength} short paragraphs). Format as paragraphs with line breaks between paragraphs:`;
      format = 'paragraph';
      break;
    case 'detailed':
      prompt = `Provide a detailed summary of the following text (about ${settings.summaryLength + 2} paragraphs with key points). Use headings for major sections and format as paragraphs:`;
      format = 'paragraph';
      break;
    case 'bullet':
      prompt = `Summarize the following text as a list of ${settings.summaryLength * 3} bullet points covering the main ideas. Use → as bullet markers and ensure each point starts on a new line:`;
      format = 'bullets';
      break;
    case 'threeLines':
      prompt = `Summarize the following text in EXACTLY 3 separate sentences, focusing on the most important information. Each sentence should be on its own line:`;
      format = 'lines';
      break;
    case 'simple':
      prompt = `Summarize the following text using simple, easy-to-understand language (about ${settings.summaryLength} paragraphs). Use short sentences and common words:`;
      format = 'paragraph';
      break;
    case 'eli5':
      prompt = `Explain the following text as if to a 5-year-old child (about ${settings.summaryLength} paragraphs). Use very simple language and short sentences:`;
      format = 'paragraph';
      break;
    default:
      prompt = `Summarize the following text in a clear, concise way (about ${settings.summaryLength} short paragraphs):`;
      format = 'paragraph';
  }
  
  // Generate English summary first
  const englishPrompt = `${prompt} ${text.substring(0, 10000)}`;
  
  try {
    // Get English summary
    const englishResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: englishPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024
        }
      })
    });
    
    const englishData = await englishResponse.json();
    
    if (englishData.error) {
      throw new Error(englishData.error.message || 'API error occurred');
    }
    
    if (!englishData.candidates || !englishData.candidates[0] || !englishData.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }
    
    let englishText = englishData.candidates[0].content.parts[0].text;
    englishText = formatSummary(englishText, format, settings.targetLanguage);
    
    // Only get translated version if a target language is selected
    let translatedText = '';
    if (settings.targetLanguage && settings.targetLanguage !== 'none') {
      const langName = getLanguageName(settings.targetLanguage);
      let translationPrompt = `Translate the following English text to ${langName}:`;
      
      // Special handling for different languages
      if (settings.targetLanguage === 'bn') {
        translationPrompt += " Make sure to use proper Unicode Bengali characters (বাংলা). Don't use transliteration. Use Bangla numerals when appropriate.";
      } else if (settings.targetLanguage === 'ar') {
        translationPrompt += " Make sure to use proper Arabic characters and right-to-left text formatting.";
      } else if (settings.targetLanguage === 'hi') {
        translationPrompt += " Make sure to use proper Hindi characters (हिन्दी) and Devanagari script.";
      } else if (settings.targetLanguage === 'zh') {
        translationPrompt += " Use Simplified Chinese characters.";
      }
      
      const translationResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${translationPrompt} ${englishText}`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024
          }
        })
      });
      
      const translationData = await translationResponse.json();
      
      if (!translationData.error && 
          translationData.candidates && 
          translationData.candidates[0] && 
          translationData.candidates[0].content) {
        translatedText = translationData.candidates[0].content.parts[0].text;
        translatedText = formatSummary(translatedText, format, settings.targetLanguage);
      } else {
        // If translation fails, use English as fallback
        translatedText = englishText;
        console.error('Translation failed, using English as fallback');
      }
    }
    
    return {
      english: englishText,
      translated: translatedText,
      targetLanguage: settings.targetLanguage
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate summary. Check your API key and try again.');
  }
}

// Function to format summary based on the requested style
function formatSummary(text, format, language = 'none') {
  switch (format) {
    case 'bullets':
      // Replace any bullet characters with arrow symbols
      text = text.replace(/^[•\-\*]\s*/gm, '→ ');
      
      // If the text doesn't have bullet points, add them
      if (!text.match(/^[→\-\*]/m)) {
        text = text.split(/\n+/).filter(line => line.trim().length > 0)
          .map(line => `→ ${line}`).join('\n');
      }
      break;
      
    case 'lines':
      // Ensure exactly 3 lines
      const sentences = text.split(/(?<=[.!?])\s+/);
      if (sentences.length > 3) {
        text = sentences.slice(0, 3).join('\n');
      } else if (sentences.length < 3) {
        // If we have too few sentences, try to split by periods
        text = text.split(/\.\s*/).slice(0, 3).map(s => s.trim() + '.').join('\n');
      } else {
        text = sentences.join('\n');
      }
      break;
      
    case 'paragraph':
      // Ensure paragraphs have proper spacing
      text = text.replace(/\n{3,}/g, '\n\n');
      break;
  }
  
  return text;
}

// Helper function to get full language name from code
function getLanguageName(langCode) {
  const languages = {
    'en': 'English',
    'bn': 'Bengali (বাংলা)',
    'es': 'Spanish (Español)',
    'fr': 'French (Français)',
    'de': 'German (Deutsch)',
    'zh': 'Chinese (中文)',
    'hi': 'Hindi (हिन्दी)',
    'ar': 'Arabic (العربية)',
    'ru': 'Russian (Русский)'
  };
  
  return languages[langCode] || langCode;
}

// Function to preload language-specific fonts
function preloadLanguageFonts(specificLanguage = null) {
  chrome.storage.sync.get('summarySettings', function(data) {
    // Get the language either from the parameter or from settings
    const langCode = specificLanguage || 
                    (data.summarySettings ? data.summarySettings.targetLanguage : 'none');
    
    if (langCode === 'none') return;
    
    // Create a preload link for the specific language font if needed
    let fontUrl = '';
    
    switch(langCode) {
      case 'bn':
        fontUrl = 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;700&family=Noto+Sans+Bengali:wght@400;500;700&display=swap';
        break;
      case 'ar':
        fontUrl = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700&display=swap';
        break;
      case 'hi':
        fontUrl = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;700&display=swap';
        break;
      case 'zh':
        fontUrl = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap';
        break;
      case 'ru':
        fontUrl = 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&display=swap';
        break;
    }
    
    if (fontUrl) {
      // Check if we already have this preload link
      const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fontUrl;
        link.as = 'style';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        
        // Also add the actual stylesheet to ensure fonts are loaded
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = fontUrl;
        document.head.appendChild(styleLink);
      }
    }
  });
} 