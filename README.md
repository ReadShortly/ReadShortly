
# 📘 Read Shortly – Summarize Smarter, Read Faster  
*A Chrome Extension by CSBD*

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with Gemini AI](https://img.shields.io/badge/Gemini%20API-Powered-blue)](https://ai.google.dev/gemini)

**Read Shortly** helps you instantly summarize long Facebook posts and articles using **Google's Gemini AI**. Whether you're scanning news, browsing social media, or working through research articles, Read Shortly gives you smart, concise summaries with one click.

---

## 🚀 Features

- ✅ **One-click summarization** of Facebook posts and online articles
- 📋 **Paste your own text** to summarize offline or copied content
- 🧠 **Smart content detection** – auto-detects main page content or allows manual text selection
- 📌 **Floating action button (FAB)** on any webpage for quick access
- 🛡️ **Use your own Gemini API key** for private and secure requests
- 🌍 **Translate summaries** into your preferred language
- 🎨 **Modern UI/UX** with Merriweather Sans and Dark Mode support
- 🧾 **Customizable summary styles**: concise, detailed, or bullet points
- ❌ **No data stored** – summaries are processed client-side through Gemini API only

---

## 🖼️ Demo

> *(Coming soon)*  
> Add a GIF or screenshot here to showcase the extension in action!

---

## 🛠 Installation

### 🔧 From Source:

1. **Clone or download this repo:**
   ```bash
   git clone https://github.com/ReadShortly/Read-Shortly.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `Read-Shortly` folder

✅ Done! The extension should now appear in your Chrome toolbar.

---

## 💡 How to Use

### 🔍 To summarize page content:

1. Visit any **Facebook post**, **news article**, or **blog**
2. Click the **Read Shortly** icon from the toolbar
3. Go to the **Page Content** tab
4. Click **Summarize This Page**
5. Optionally, highlight a portion of the text before clicking to summarize a specific section

### ✂️ To summarize your own text:

1. Click the **Read Shortly** icon
2. Select the **Your Text** tab
3. Paste or type the content you want to summarize
4. Click **Summarize Text**

---

## ⚙️ Configuration

### 🔑 Gemini API Key

You can configure your API key in **three ways**:

#### 1. 🔧 In the extension UI:
- Open the extension → Click **Settings**
- Paste your **Gemini API key**
- Click **Apply Settings**

#### 2. 🧑‍💻 In `config.js`:
- Open `config.js`
- Replace:
  ```js
  const API_KEY = 'YOUR_GEMINI_API_KEY';
  ```
- Save the file

#### 3. ⚙️ In Chrome extension options:
- Right-click the extension icon → Click **Options**
- Enter your API key → Click **Save**

### 📁 Other Settings
- Summary style: *Concise*, *Detailed*, *Bullet Points*
- Summary length: *Short*, *Medium*, *Long*
- Translation language (optional)
- Theme: *Light/Dark Mode*

---

## 🧑‍💻 Built With

- 🧠 [Google Gemini 2.0 Flash API](https://ai.google.dev/gemini)
- 📜 Vanilla JavaScript + Chrome Extension APIs
- 🎨 Merriweather Sans via Google Fonts
- 💾 LocalStorage for secure, private settings
- 🧩 Content Scripts + Messaging APIs for DOM interaction

---

## 🔐 Privacy & Data Handling

- 🔒 **No text, user data, or summaries are stored** on any server.
- 📡 Summarization requests are sent directly to Gemini's API.
- 🔐 Your API key and settings are stored **locally in your browser**.
- 🧭 No analytics, cookies, or tracking scripts are used.

> **Your data never leaves your browser except to Gemini API.**

---

## 📚 Roadmap & Upcoming Features

- 🔜 **Auto-language detection**
- 🗂️ **Summary history and bookmarks**
- 🖨️ **Export to PDF / Markdown**
- 🔊 **Text-to-speech (TTS) summaries**
- 🔗 **Gemini Pro model support**

---

## 🤝 Contributing

We welcome contributions and suggestions!

1. Fork this repo
2. Create a new branch: `feature/your-feature-name`
3. Commit your changes
4. Open a Pull Request

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🗣️ Contact & Credits

- 🧑‍💻 Developed by CSBD
- 🌐 [Visit Repository](https://github.com/ReadShortly/Read-Shortly)

---

**Enjoy Reading — Shortly.**
