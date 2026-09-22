# Sabhi Digital - Webinar Checklist App

A comprehensive Next.js web application for tracking team accountability in webinar setup and execution. Manages 32 sequential steps with automatic timestamping, team member assignment, and persistent data storage.

## Features

✅ **Login Required** - Every page is behind a sign-in wall enforced in middleware
✅ **Role-Based Access Control** - Team Lead / Coordinator / Executive, each with different rights
✅ **Dashboard** - Client list, webinar progress and team totals on one page
✅ **Admin-Only Client Management** - Only the Team Lead can add clients and fill their details
✅ **32-Step Webinar Checklist** - Complete workflow from pre-webinar setup to post-webinar documentation
✅ **Multiple Clients** - Track separate checklists for different webinar clients
✅ **Team Member Tracking** - Assign team members to completed tasks with auto-timestamp
✅ **Auto-Timestamping** - Automatically records completion time in Indian time format
✅ **Persistent Storage** - Uses browser localStorage (no database required)
✅ **Progress Tracking** - Real-time completion percentage and visual progress bar
✅ **Detailed Notes** - Add notes and document issues for each step
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth (credentials provider, JWT session, bcrypt hashes)
- **Storage**: Browser localStorage
- **Deployment**: Vercel

## Authentication & Roles

Every route except `/login` is protected by `middleware.ts`. Unauthenticated
requests are redirected before any page code runs, so this cannot be bypassed
from the browser.

### Roles

| Role | Label | Complete steps | Add notes | Assign member | Reset checklist | Add/edit clients |
|---|---|:---:|:---:|:---:|:---:|:---:|
| `admin` | Team Lead | ✅ | ✅ | ✅ | ✅ | ✅ |
| `coordinator` | Coordinator | ✅ | ✅ | ✅ | ❌ | ❌ |
| `executive` | Executive | ✅ | ✅ | ❌ | ❌ | ❌ |

Everyone can *see* the client list. Only `admin` can add, edit or delete a
client and fill in its details (coach, Zoom email, WhatsApp group, landing
page).

Permissions live in [`lib/rbac.ts`](lib/rbac.ts). They are applied in two
places: the controls are disabled in the UI, and `handleStepUpdate` re-checks
the permission before changing anything.

### Setting up users

```bash
npm run gen-auth
```

This prints one-time passwords plus the two environment variables to set. For a
custom list:

```bash
npm run gen-auth -- someone@sabhi.com:admin other@sabhi.com:executive
```

Put the output in `.env.local` for local development, and in **Vercel → Project
→ Settings → Environment Variables** for production. See `.env.example`.

> **Note on `APP_USERS`:** it is base64-encoded JSON, not plain JSON. A bcrypt
> hash contains `$`, and `$NAME` gets expanded away inside `.env` files, which
> silently truncates the hash and makes every login fail. Base64 sidesteps that.

### Scope of the current setup

Login and RBAC are real and enforced server-side. **The data is not** — both
the checklists and the client list live in each user's browser
`localStorage`, so:

- a client the admin adds is only visible in the admin's own browser
- teammates do not see each other's checklist progress
- a determined user can edit their own copy

Sharing data across the team, and making the record tamper-proof, needs a
database and API routes. `lib/clients.ts` is written as the single place that
reads and writes clients, so swapping its body for API calls is the change
that makes the list shared. That is a separate piece of work from RBAC.

## Project Structure

```
webinar-checklist-app/
├── middleware.ts          # Redirects unauthenticated requests to /login
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth endpoints
│   ├── login/page.tsx     # Sign-in page
│   ├── page.tsx           # Dashboard (stats, clients, webinar progress)
│   ├── checklist/page.tsx # The 32-step checklist
│   ├── layout.tsx         # Root layout with metadata
│   └── globals.css        # Tailwind CSS imports
├── components/
│   ├── Checklist.tsx      # Checklist display component
│   ├── ClientManager.tsx  # Client list + add/edit form (admin only)
│   ├── Header.tsx         # User chip, nav, sign out
│   └── Providers.tsx      # NextAuth session provider
├── lib/
│   ├── auth.ts            # NextAuth options, user lookup
│   ├── rbac.ts            # Roles and permissions
│   ├── clients.ts         # Client store + validation
│   └── data.ts            # Seed data (clients, team members, steps)
├── types/
│   └── next-auth.d.ts     # Adds `role` to the session types
├── scripts/
│   └── gen-auth.mjs       # Generates passwords + env vars
├── .env.example           # Required environment variables
├── public/                # Static assets
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── next.config.js         # Next.js configuration
├── .eslintrc.json         # ESLint configuration
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Installation & Setup

### 1. Extract the ZIP file
```bash
unzip webinar-checklist-app.zip
cd webinar-checklist-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your sign-in credentials
```bash
npm run gen-auth
```
Copy `NEXTAUTH_SECRET` and `APP_USERS` from the output into a `.env.local`
file, and add `NEXTAUTH_URL=http://localhost:3000`. Save the printed passwords
- they are not shown again.

### 4. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Select Webinar Date** - Choose the date of the webinar
2. **Select Client** - Pick the client from the dropdown (ABC Coaching, XYZ Academy, PQR Institute)
3. **View 32 Steps** - All 32 webinar setup steps appear automatically
4. **Mark Steps Complete** - Check the checkbox when a step is completed
   - ✅ Auto-timestamp is generated (e.g., "15 Sep 2026 03:45 PM")
   - ✅ Timestamp appears in the step's details section
5. **Assign Team Member** - Click "Details" to expand and select who completed the task
6. **Add Notes** - Document any relevant information or issues
7. **Data Persists** - Refresh the page - your data is automatically saved!

## Key Features Explained

### Auto-Timestamp
When you mark a step as complete, the system automatically records the exact date and time in Indian time format:
```
Day Month Year Hour:Minute AM/PM
Example: 15 Sep 2026 03:45 PM
```

### Persistent Storage
All data is saved to your browser's localStorage. Even if you close and reopen the app, your progress is preserved.

### Multiple Webinars
Track different webinars simultaneously by selecting different dates and clients. Each combination has its own independent checklist.

### Progress Tracking
A visual progress bar shows completion percentage in real-time, updated as you check off steps.

## Sample Data

### Clients
- **ABC Coaching** - Coach: Priya Singh
- **XYZ Academy** - Coach: Rajesh Kumar
- **PQR Institute** - Coach: Maya Patel

### Team Members
- **Pawan** - Team Lead
- **Yuvraj** - Executive
- **Priya** - Coordinator

## Deploy to Vercel

### Step 1: Create Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/webinar-checklist-app.git
git push -u origin main
```

### Step 3: Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repository
3. Before deploying, open **Environment Variables** and add:
   - `NEXTAUTH_SECRET` - from `npm run gen-auth`
   - `APP_USERS` - from `npm run gen-auth`
   - `NEXTAUTH_URL` - your deployed URL, e.g. `https://team-tracker.vercel.app`
4. Click "Deploy"

Without `NEXTAUTH_SECRET` and `APP_USERS` the app still builds and serves the
login page, but nobody can sign in. The server log says which one is missing.

## Testing Checklist

After installation:
- ✅ Select a webinar date
- ✅ Select a client name
- ✅ See all 32 steps appear
- ✅ Click checkbox on a step
- ✅ Verify auto-timestamp appears
- ✅ Click "Details" to expand
- ✅ Select a team member from dropdown
- ✅ Add notes and issue descriptions
- ✅ Refresh page - verify data is saved
- ✅ Try different date/client combinations

## Troubleshooting

### "Cannot find module '@/components/Checklist'"
- Verify `components/Checklist.tsx` exists with capital 'C'
- Check import path: `'@/components/Checklist'`

### "Cannot find module '@/lib/data'"
- Verify `lib/data.ts` exists
- Check folder name is `lib` (not `libs`)

### App shows blank page
- Open browser console: F12
- Check for errors
- Verify all files are in correct folders

### Data not saving after refresh
- Check browser settings allow site data storage
- Try incognito mode to test
- Clear browser cache if needed

### Styles look broken
- Run `npm run dev` again
- Clear browser cache (Ctrl+Shift+Delete)
- Restart development server

## Production Checklist

Before deploying to Vercel:
- [ ] Test all 32 steps load correctly
- [ ] Test checkmarks work and auto-timestamp appears
- [ ] Test team member dropdown functionality
- [ ] Test data persists after refresh
- [ ] Test with different date/client combinations
- [ ] Check styling on mobile devices
- [ ] Verify no console errors in browser

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check Next.js documentation: [nextjs.org](https://nextjs.org)
4. Check Tailwind docs: [tailwindcss.com](https://tailwindcss.com)

---

Made for **Sabhi Digital** | Version 1.0
