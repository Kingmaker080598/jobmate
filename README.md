# JobMate 🚀 — AI-Powered Career Companion

**JobMate** is your all-in-one job application assistant powered by AI. Upload your resume, manage your application profile, and let JobMate help you tailor your resume and fill out job applications — faster and smarter.

![JobMate Banner](public/banner-jobmate.png) <!-- optional image/banner -->

## 🔥 Features

- ✨ **AI Resume Tailoring** (Coming Soon)
- 📁 Upload and manage master resumes
- 🗜️ **Auto-Fill Application Forms**
- 🧠 Smart Suggestions (Coming Soon)
- 🗜️ **Resume History**
- 💼 Profile Management Dashboard
- 🧹 Chrome Extension Integration (Coming Soon)
- 🔐 Authentication with Supabase
- ⚡ Hosted on Vercel

---

## 📸 Preview

> 💡 Hosted at [https://jobmate.vercel.app](https://jobmate.vercel.app)



---

## ✨ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/jobmate.git
cd jobmate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_api_key
CLOUDCONVERT_API_KEY=your_cloudconvert_key
```


---

## 🧠 Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Framer Motion, MUI
- **Auth & DB**: Supabase (PostgreSQL, RLS Policies)
- **AI**: OpenAI API for resume generation
- **File Handling**: Supabase Storage, CloudConvert
- **Deployment**: Vercel

---

## 🧪 To Do (Phases)

### ✅ Phase 1 - MVP
- [x] Auth + Supabase
- [x] Resume upload + history
- [x] Application auto-fill form
- [x] User dashboard
- [x] Vercel deployment

### 🚧 Phase 2 - AI Tailoring & Enhancements
- [ ] AI resume tailoring
- [ ] Smart suggestions panel
- [ ] Chrome Extension for job scraping
- [ ] Auto-apply system (bots)

---

## 🧑‍💻 Contributing

Got ideas or want to collaborate? Feel free to fork this repo and open a pull request.

---

## 📄 License

MIT © [Your Name or JobMate](https://jobmate.vercel.app)
