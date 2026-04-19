# Sheeen Auto Publish — SaaS App

Automated AI-powered Instagram posting for fashion brands. Converts your n8n workflow into a full multi-brand SaaS application.

## Stack

- **Frontend + Backend**: Next.js 14 (App Router)
- **Database + Auth**: Supabase (PostgreSQL + Row Level Security)
- **AI**: Google Gemini (captions + image generation)
- **Instagram Publishing**: Zernio API
- **Deployment**: Vercel (with built-in Cron)

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd sheeen-saas
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the migration file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Copy your project URL and keys from **Settings → API**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=any_random_secret_string_you_choose
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to login.

---

## Deploy to Vercel

### 1. Push to GitHub, then import in Vercel

### 2. Add all environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` → your Vercel URL
- `CRON_SECRET` → any secret string

### 3. The cron job in `vercel.json` fires every hour automatically
It checks which brands have a schedule matching the current time and runs their pipeline.

### 4. Configure Supabase Auth redirect URL
In Supabase → **Authentication → URL Configuration**:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/api/auth/callback`

---

## App Setup (after deploy)

1. **Sign up** at your app URL
2. Go to **Brands** → create your first brand (e.g. "Sheeen.store")
3. Go to **Integrations** → fill in all credentials:
   - Shopify store domain + Admin API token
   - Gemini API key (from [aistudio.google.com](https://aistudio.google.com/apikey))
   - Zernio API key + Account ID
   - Brand logo URL or Google Drive file ID
4. Go to **Schedule** → choose posting days and time
5. Set brand status to **Active** in the Brands page
6. Hit **Run now** on the Dashboard to test it!

---

## Pipeline Flow

When triggered (scheduled or manual):

```
1. Fetch products from Shopify (up to 100 published)
      ↓
2. Filter excluded types (hoodies, sweatshirts, etc.)
      ↓
3. Randomly select one product + image
      ↓
4. Generate caption via Gemini (3 sentences, emojis, CTA, hashtags)
      ↓
5. Get scene suggestion from Gemini (max 8 words)
      ↓
6. Generate fashion ad image via Gemini image model
   (product image + logo → cinematic 1:1 Instagram ad)
      ↓
7. Upload image to S3 via Zernio presigned URL
      ↓
8. Publish post to Instagram via Zernio API (publishNow: true)
      ↓
9. Save run log + update post record in Supabase
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login/signup page
│   ├── (app)/                 # Protected app layout
│   │   ├── dashboard/         # Main dashboard
│   │   ├── posts/             # Post history
│   │   ├── schedule/          # Posting schedule config
│   │   ├── integrations/      # API credentials
│   │   ├── brands/            # Multi-brand management
│   │   ├── settings/          # AI prompt config
│   │   └── logs/              # Run logs
│   └── api/
│       ├── pipeline/run/      # POST: manual pipeline trigger
│       ├── schedule/cron/     # GET: cron job (runs every hour)
│       ├── brands/            # CRUD for brands
│       ├── integrations/test/ # Test API connections
│       ├── posts/             # Post history API
│       └── logs/              # Run logs API
├── components/
│   ├── layout/                # Sidebar, Topbar
│   └── dashboard/             # Dashboard widgets
├── lib/
│   ├── pipeline/engine.ts     # Core pipeline logic
│   ├── shopify/client.ts      # Shopify API
│   ├── gemini/client.ts       # Gemini AI (captions + images)
│   ├── zernio/client.ts       # Zernio (S3 + Instagram)
│   └── supabase/client.ts     # Supabase helpers
└── types/index.ts             # TypeScript types
```

---

## Multi-Brand Support

Each brand has completely isolated:
- Shopify store credentials
- Gemini API key
- Zernio account
- Logo
- Schedule (days, time)
- Excluded product types
- Hashtags and AI prompts
- Post history and logs

Switch between brands using the sidebar dropdown.

---

## Cron / Scheduling

The cron hits `/api/schedule/cron?secret=YOUR_CRON_SECRET` every hour.

It:
1. Fetches all active schedules
2. Checks if current UTC time matches any brand's configured day + hour
3. Verifies no post was made in the last 30 minutes (dedup)
4. Runs the pipeline for matching brands

You can also trigger it externally (e.g. from Railway, Render, or a cron service) by calling:
```
GET https://your-app.vercel.app/api/schedule/cron
Headers: x-cron-secret: YOUR_CRON_SECRET
```

---

## Getting Your API Keys

### Shopify Admin API Token
1. Go to your Shopify admin → **Settings → Apps → Develop apps**
2. Create a new app, enable `read_products` scope
3. Install the app and copy the **Admin API access token**

### Gemini API Key
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Create a new API key

### Zernio
1. Sign up at [zernio.com](https://zernio.com)
2. Connect your Instagram account
3. Copy your API key and Account ID from the dashboard

---

## Development Notes

- All credentials are stored per-brand in Supabase with Row Level Security
- Users can only access their own brands/posts/logs
- The pipeline runs server-side in a Next.js API route
- For very long image generation times, consider moving the pipeline to a background job queue (e.g. Inngest, Trigger.dev) on production
