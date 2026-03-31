# The Kinetic Audit — Vercel Deployment Guide

## What's in this package

```
kinetic-audit-vercel/
├── api/
│   └── generate.js        ← Secure serverless function (holds your API key)
├── public/
│   └── index.html         ← The full Kinetic Audit web app
├── vercel.json            ← Vercel routing config
└── README.md              ← This file
```

---

## Step 1 — Create your Vercel account

1. Go to **https://vercel.com/signup**
2. Sign up with GitHub (recommended) or email
3. Free plan is sufficient — no credit card needed

---

## Step 2 — Deploy via Vercel web interface (no terminal needed)

### Option A — Drag and drop (fastest)

1. Log into Vercel at **https://vercel.com/dashboard**
2. Click **"Add New Project"**
3. Click **"Browse"** or drag the entire `kinetic-audit-vercel` folder onto the upload area
4. Vercel will detect the structure automatically
5. Click **"Deploy"** — wait about 60 seconds

### Option B — GitHub (recommended for easy future updates)

1. Create a free GitHub account at **https://github.com** if you don't have one
2. Create a new repository called `kinetic-audit`
3. Upload all files from this folder to the repository
4. In Vercel, click **"Add New Project"** → **"Import Git Repository"**
5. Select your `kinetic-audit` repository → click **"Deploy"**

---

## Step 3 — Add your Anthropic API key (CRITICAL)

Without this step the AI results won't work — it will fall back to fixed copy.

1. In your Vercel project dashboard, click **"Settings"** (top navigation)
2. Click **"Environment Variables"** in the left sidebar
3. Click **"Add New"**
4. Set:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key (starts with `sk-ant-...`)
   - **Environment:** Production, Preview, Development (check all three)
5. Click **"Save"**
6. Go back to **"Deployments"** and click **"Redeploy"** → **"Redeploy"** to apply the key

Your Anthropic API key is at: **https://console.anthropic.com/settings/keys**

---

## Step 4 — Add a custom domain (optional but recommended)

**audit.focusacademy.global** would be a clean, memorable URL for QR codes and email footers.

1. In Vercel project → **Settings** → **Domains**
2. Type: `audit.focusacademy.global` → click **"Add"**
3. Vercel will show you a CNAME record to add in your DNS
4. Since your site is on Wix, go to your **Wix dashboard** → **Domains** → **Manage DNS**
5. Add a CNAME record:
   - **Host:** `audit`
   - **Value:** `cname.vercel-dns.com`
6. Wait 10–30 minutes for DNS to propagate

---

## Step 5 — Embed in your Wix website

1. Log into your **Wix Editor**
2. Create a new page called **"The Kinetic Audit"**
3. Click **"Add Elements"** (+) → **"Embed"** → **"Embed a Website"**
4. Click the embed element → **"Enter Website Address"**
5. Enter your Vercel URL (e.g. `https://kinetic-audit.vercel.app` or your custom domain)
6. Resize the embed element to fill the full page height (set to ~900px minimum)
7. In embed settings, enable **"Allow Scrolling"**
8. Publish the page

---

## Step 6 — Test the full flow

Go through the audit yourself:
1. Choose a path (Baseline or Lens)
2. Complete all four stages
3. Enter your email
4. Confirm AI results are generated (not fallback copy)

If you see fallback copy instead of personalised results, the API key is not yet active — check Step 3.

---

## Updating the app in the future

If you're using GitHub (Option B):
1. Make changes to `public/index.html`
2. Commit and push to GitHub
3. Vercel redeploys automatically — no manual action needed

---

## Support

For questions about the app: hello@focusacademy.global
For Vercel issues: vercel.com/help
For Anthropic API: console.anthropic.com
