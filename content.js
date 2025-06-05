// This script runs on the web page
// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getText") {
    // Try to get selected text first
    let selectedText = window.getSelection().toString();
    
    // If no text is selected, try to extract text from Facebook posts or article
    let pageText = '';
    
    // Check if on Facebook
    if (window.location.hostname.includes('facebook.com')) {
      const posts = document.querySelectorAll('[data-ad-comet-preview="message"], .userContent, [role="article"]');
      posts.forEach(post => {
        pageText += post.textContent + '\n\n';
      });
    } else {
      // Try to extract article content
      const articleElements = document.querySelectorAll('article, .article-content, .post-content, main');
      if (articleElements.length > 0) {
        articleElements.forEach(el => {
          pageText += el.textContent + '\n\n';
        });
      } else {
        // Fallback to body content
        pageText = document.body.innerText;
      }
    }
    
    sendResponse({
      selectedText: selectedText,
      pageText: pageText
    });
  }
  return true; // Keep the communication channel open for async response
});

// Add a floating button to the page
function addFloatingButton() {
  // Add Merriweather Sans font
  if (!document.getElementById('csbd-fonts')) {
    const fontLink = document.createElement('link');
    fontLink.id = 'csbd-fonts';
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@500&display=swap';
    document.head.appendChild(fontLink);
  }
  
  const button = document.createElement('div');
  button.id = 'csbd-summary-button';
  button.textContent = '📝';
  button.title = 'Summarize with Read Shortly';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #1877f2;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 9999;
    transition: all 0.3s;
    font-family: 'Merriweather Sans', sans-serif;
  `;
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.textContent = 'Read Shortly';
  tooltip.style.cssText = `
    position: absolute;
    right: 60px;
    background: #333;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
    white-space: nowrap;
    font-family: 'Merriweather Sans', sans-serif;
  `;
  button.appendChild(tooltip);
  
  button.addEventListener('mouseover', () => {
    button.style.transform = 'scale(1.1)';
    tooltip.style.opacity = '1';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.transform = 'scale(1)';
    tooltip.style.opacity = '0';
  });
  
  button.addEventListener('click', () => {
    chrome.runtime.sendMessage({action: "openPopup"});
  });
  
  document.body.appendChild(button);
}

// Add the button when the page is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addFloatingButton);
} else {
  addFloatingButton();
} 