# AI Pulse — Setup Guide

## 1. Install Node.js
```bash
brew install node
# or: nvm install --lts
```

## 2. Install dependencies
```bash
cd ~/ai-pulse
npm install
```

## 3. Set up Supabase
1. Go to supabase.com → New Project
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. Copy your Project URL and anon key from Settings → API

## 4. Configure environment
Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
CRON_SECRET=pick-any-random-string
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> NOTE: The anon key alone won't let the refresh endpoint write to the DB.
> Go to Supabase → Settings → API → copy the **service_role** key and use it
> in a server-only env var `SUPABASE_SERVICE_ROLE_KEY` (see note below).

## 5. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

## 6. Seed initial data
Visit http://localhost:3000/api/refresh to trigger the first data pull.
No auth needed in dev (CRON_SECRET check skips when header is absent in dev).

## 7. Deploy to Vercel
```bash
npx vercel
npx vercel --prod
```
Add these env vars in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_SITE_URL` (your production domain)

The cron job in `vercel.json` will auto-refresh every 30 minutes.

## 8. Buy a domain
Vercel Dashboard → your project → Settings → Domains → search & buy.

---

## Supabase write permissions

The refresh endpoint needs write access. Two options:

**Option A (recommended):** In Supabase, go to Settings → API → copy `service_role` key.
Add `SUPABASE_SERVICE_ROLE_KEY=...` to your env, then update `lib/supabase.ts` to use it
server-side (create a separate `lib/supabase-admin.ts`).

**Option B (quick):** In Supabase, temporarily disable RLS on `content_items` for testing.
Re-enable when done.
