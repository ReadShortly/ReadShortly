// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "openPopup") {
    // Open the popup
    chrome.action.openPopup();
  }
  return true;
});

// Set default values on install
chrome.runtime.onInstalled.addListener(function() {
  // Default API key
  chrome.storage.sync.get('geminiApiKey', function(data) {
    if (!data.geminiApiKey) {
      chrome.storage.sync.set({
        geminiApiKey: 'AIzaSyBwN261s89sjbxgS7GCd5BrHG7NsdmC4aU'
      });
    }
  });
  
  // Default settings
  chrome.storage.sync.get('summarySettings', function(data) {
    if (!data.summarySettings) {
      chrome.storage.sync.set({
        summarySettings: {
          darkMode: false,
          summaryStyle: 'concise',
          summaryLength: 3,
          targetLanguage: 'none',
          autoSave: true
        }
      });
    }
  });
  
  // Initialize empty history
  chrome.storage.sync.get('summaryHistory', function(data) {
    if (!data.summaryHistory) {
      chrome.storage.sync.set({
        summaryHistory: []
      });
    }
  });
});

// Add context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarizeSelection",
    title: "Summarize with Read Shortly",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarizeSelection" && info.selectionText) {
    // Store the selected text temporarily
    chrome.storage.local.set({
      'tempSelectedText': info.selectionText
    }, function() {
      // Open the popup
      chrome.action.openPopup();
    });
  }
});

// Command shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "summarize_page") {
    chrome.action.openPopup();
  }
}); 