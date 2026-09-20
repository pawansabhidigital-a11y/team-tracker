# Sabhi Digital - Webinar Checklist App

A Next.js web app for tracking webinar setup steps, team completion, and auto-timestamping.

## Features

✅ **32-Step Checklist** — All webinar setup steps included  
✅ **Auto-Timestamp** — Records exact date & time when step is completed  
✅ **Team Tracking** — Shows who completed each step  
✅ **Progress Bar** — Visual completion percentage  
✅ **Notes & Issues** — Track issues found during each step  
✅ **Browser Storage** — Data saved locally (survives page refresh)  
✅ **Fully Responsive** — Works on mobile, tablet, desktop  

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

### Build & Deploy to Vercel

```bash
# Build for production
npm run build

# Start production server (local testing)
npm start
```

Then deploy to Vercel (see deployment section below).

## How to Use

1. **Select Webinar Date** — Pick the date of your webinar
2. **Select Client** — Choose which client this webinar is for
3. **See 32 Steps** — All steps appear automatically
4. **Mark ✓ When Done** — Click checkbox to mark step complete
5. **Add Details** — Click "Details" to expand and add notes
6. **Select Team Member** — Choose who completed this step
7. **Timestamp Auto-Fills** — Date & time recorded automatically
8. **Data Saved** — Browser stores all data locally

## Folder Structure

```
webinar-checklist-app/
├── app/
│   ├── page.tsx          # Main page
│   ├── layout.tsx        # Page layout
│   └── globals.css       # Global styles
├── components/
│   └── Checklist.tsx     # Checklist component
├── lib/
│   └── data.ts           # Sample clients, team, steps
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Environment Setup

No environment variables needed. App works out of the box.

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - webinar checklist app"
git remote add origin https://github.com/YOUR_USERNAME/webinar-checklist-app.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"
5. Wait 2-3 minutes
6. Your app is live! 🚀

## Technologies

- **Next.js 14** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **localStorage** — Browser data storage

## Support

For issues or questions, check the error messages in browser console (F12).

---

Built with ❤️ for Sabhi Digital Webinar Team
