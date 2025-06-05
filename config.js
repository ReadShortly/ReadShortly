// Configuration file for Read Shortly
// You can add your API keys here for production use

const CONFIG = {
  // Gemini API key - Get yours at https://aistudio.google.com/app/apikey
  GEMINI_API_KEY: "AIzaSyBwN261s89sjbxgS7GCd5BrHG7NsdmC4aU", // Default key (limited usage)
  
  // Add other API keys here as needed
  // OPENAI_API_KEY: "your-openai-key",
};

// Don't modify below this line
if (typeof module !== 'undefined') {
  module.exports = CONFIG;
} 