document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');
  const darkModeBtn = document.getElementById('darkModeBtn');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const summaryStyle = document.getElementById('summaryStyle');
  const lengthSlider = document.getElementById('lengthSlider');
  const lengthValue = document.getElementById('lengthValue');
  const targetLanguage = document.getElementById('targetLanguage');
  const autoSaveToggle = document.getElementById('autoSaveToggle');
  
  // Default settings
  let settings = {
    darkMode: false,
    summaryStyle: 'concise',
    summaryLength: 3,
    targetLanguage: 'none',
    autoSave: true
  };
  
  // Load saved settings and API key
  loadSettings();
  
  // Event listeners
  darkModeBtn.addEventListener('click', toggleDarkMode);
  darkModeToggle.addEventListener('change', function() {
    if (this.checked) {
      document.body.classList.add('dark-mode');
      darkModeBtn.textContent = '☀️';
    } else {
      document.body.classList.remove('dark-mode');
      darkModeBtn.textContent = '🌙';
    }
  });
  
  lengthSlider.addEventListener('input', function() {
    lengthValue.textContent = this.value;
  });
  
  // Save API key and settings
  saveButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter a valid API key', 'error');
      return;
    }
    
    // Save API key
    chrome.storage.sync.set({
      geminiApiKey: apiKey
    });
    
    // Save settings
    settings = {
      darkMode: darkModeToggle.checked,
      summaryStyle: summaryStyle.value,
      summaryLength: parseInt(lengthSlider.value),
      targetLanguage: targetLanguage.value,
      autoSave: autoSaveToggle.checked
    };
    
    chrome.storage.sync.set({
      summarySettings: settings
    });
    
    // Test the API key
    testApiKey(apiKey);
  });
  
  // Function to load saved settings
  function loadSettings() {
    chrome.storage.sync.get(['geminiApiKey', 'summarySettings'], function(data) {
      // Load API key
      if (data.geminiApiKey) {
        apiKeyInput.value = data.geminiApiKey;
      }
      
      // Load other settings
      if (data.summarySettings) {
        settings = data.summarySettings;
        
        // Apply settings to UI
        darkModeToggle.checked = settings.darkMode;
        summaryStyle.value = settings.summaryStyle;
        lengthSlider.value = settings.summaryLength;
        lengthValue.textContent = settings.summaryLength;
        targetLanguage.value = settings.targetLanguage;
        autoSaveToggle.checked = settings.autoSave;
        
        // Apply dark mode if enabled
        if (settings.darkMode) {
          document.body.classList.add('dark-mode');
          darkModeBtn.textContent = '☀️';
        }
      }
    });
  }
  
  // Function to toggle dark mode
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.checked = isDarkMode;
    darkModeBtn.textContent = isDarkMode ? '☀️' : '🌙';
  }
  
  // Function to test the API key
  async function testApiKey(apiKey) {
    try {
      showStatus('Testing API key...', 'info');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Test connection"
            }]
          }]
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        showStatus(`Error: ${data.error.message}`, 'error');
      } else {
        showStatus('All settings saved successfully!', 'success');
      }
    } catch (error) {
      showStatus(`Error: ${error.message}`, 'error');
    }
  }
  
  // Function to show status
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    if (type !== 'info') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }
}); 