<p align="center">
  <h1 align="center">🚀 ResumeBuddy</h1>
  <p align="center"><strong>Beat the Bots. Land the Interview.</strong></p>
  <p align="center">A privacy-first ATS Resume Optimizer that rewrites your resume to score 80%+ on Applicant Tracking Systems — powered by Google Gemini AI.</p>
</p>

---
## 🌐 Try It Instantly

No installation required! You can use the full version of ResumeBuddy directly in your browser:

### 👉 **[https://resumebuddy-eta.vercel.app/](https://resumebuddy-eta.vercel.app/)**

> **Note:** The live version works exactly like the local version. It is **Client-Side Only**, meaning your data stays in your browser and never touches our servers. You just need your own free API key.

---
## ✨ What Does ResumeBuddy Do?

Most companies use software called an **ATS (Applicant Tracking System)** to screen resumes before a human ever sees them. If your resume doesn't match the job description closely enough, it gets rejected automatically — even if you're perfectly qualified.

**ResumeBuddy fixes that.** You paste a job description, and it:

- 🎯 **Rewrites your resume** with the exact keywords the ATS is looking for
- 📊 **Scores your resume** (0-100) across Keyword Match, Formatting, and Job Alignment
- ✉️ **Generates a tailored cover letter** that complements your optimized resume
- 📄 **Creates a clean ATS template** you can download as a PDF
- 🔒 **Keeps everything private** — your data never leaves your browser

---

## 🔒 Privacy First — Your Data Stays With You

Unlike other resume tools, ResumeBuddy:

- ❌ Does NOT upload your resume to any server
- ❌ Does NOT store your data in any cloud
- ❌ Does NOT require an account or login
- ✅ Stores everything locally in your browser (IndexedDB)
- ✅ API calls go directly from YOUR browser to Google — we're not in the middle
- ✅ Uses YOUR free API key (BYOK — Bring Your Own Key)

---

## 🧑‍💻 For Developers — Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- A free [Google Gemini API Key](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/nicepicgorl-jpeg/ResumeBuddy.git

# 2. Navigate into the project
cd ResumeBuddy

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Then open **http://localhost:3000** in your browser. That's it!

---

## 🙋 For Non-Technical Users — Step-by-Step Guide

Don't worry if you've never used a terminal before. Follow these steps exactly:

### Step 1: Install Node.js

1. Go to **https://nodejs.org**
2. Click the big green **"Download"** button (LTS version)
3. Run the installer — click **Next → Next → Next → Install**
4. Restart your computer

### Step 2: Download ResumeBuddy

1. On this page, click the green **"Code"** button (top right area)
2. Click **"Download ZIP"**
3. Unzip the downloaded folder to your Desktop

### Step 3: Open a Terminal

- **Windows:** Press `Win + R`, type `cmd`, press Enter
- **Mac:** Press `Cmd + Space`, type `Terminal`, press Enter

### Step 4: Run the App

Type these commands one at a time, pressing Enter after each:

```
cd Desktop/ResumeBuddy-main
npm install
npm run dev
```

> ⏳ `npm install` may take 1-2 minutes the first time. That's normal!

### Step 5: Open the App

Open your browser and go to: **http://localhost:3000**

You should see the ResumeBuddy landing page! 🎉

### Step 6: Get Your Free API Key

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key
5. In ResumeBuddy, click **Settings** (gear icon in sidebar)
6. Paste your key and save

> 💡 This key is free and stays in your browser. We never see it.

---

## 📖 How to Use ResumeBuddy

### 1. Fill Your Master Profile

Go to **Master Profile** and add:
- Your personal info (name, email, phone, LinkedIn)
- Professional summary
- Work experience with bullet points
- Key projects with links and highlights
- Skills
- Education

Click **Save Profile** (the green button at the bottom).

### 2. Optimize Your Resume

1. Go to **Optimize Resume**
2. Paste the full job description
3. Click **🚀 Optimize Now**
4. Review your score and the rewritten resume
5. Click **📋 Copy as Text** to paste into your resume
6. Or click **📄 Download ATS Template** to get a printable PDF

### 3. Generate a Cover Letter

1. Go to **Cover Letter**
2. Paste a job description (or pick one from your history)
3. Click **✉️ Generate Cover Letter**
4. Copy the result and customize as needed

### 4. Track Your History

Every optimization is saved automatically. Go to **History** to compare scores across different jobs.

---

## 🎨 Features

| Feature | Description |
|---------|-------------|
| 📝 Master Profile | Store your complete career history locally |
| ⚡ AI Optimizer | Rewrite resume bullets with power verbs and metrics |
| 📊 ATS Scoring | 0-100 score: Keyword Match (40%), Formatting (20%), Job Alignment (40%) |
| ✉️ Cover Letter | AI-generated cover letter tailored to each job |
| 📄 ATS Template | Clean, printable resume template (PDF via browser print) |
| 🚀 Projects | Highlight key projects with links, tech stack, and achievements |
| 🌙 Dark Mode | Persistent dark/light mode toggle |
| 📋 History | Browse and compare past optimizations |
| 🔒 Privacy | 100% local — IndexedDB + localStorage, zero server storage |
| 🔑 BYOK | Bring Your Own (free) Gemini API Key |

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Custom CSS Variables
- **Database:** Dexie.js (IndexedDB wrapper)
- **State:** Zustand (with localStorage persistence)
- **AI:** Google Gemini 2.5 Flash (client-side BYOK)
- **Language:** TypeScript

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📜 License

This project is open source and free to use.

---

<p align="center">
  <strong>Built with ❤️ for job seekers everywhere.</strong><br/>
  <em>Your resume, your data, your privacy.</em>
</p>
