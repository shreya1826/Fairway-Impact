# Fairway Impact

A subscription-based golf score tracker with a monthly draw, prize pool, and
charity contribution engine — built against the Digital Heroes PRD.

Stack: **Next.js 14 (App Router, TypeScript) · Supabase (Auth + Postgres + Storage) · Stripe (subscriptions) · Tailwind CSS · Resend (email)**, deployed on **Vercel**.

---

## What's implemented vs. what's scaffolded

Read this honestly before you present this as finished:

**Fully implemented, working logic:**
- Auth (signup/login/session), protected routes via middleware
- Score entry with the exact PRD rules: 1–45 range, one score per date, rolling
  window that auto-retires the oldest score beyond 5 (enforced at the database
  level with a trigger, not just in the UI)
- Charity directory + selection + contribution % (min 10%, adjustable)
- Stripe subscription checkout, billing portal, and webhook syncing
  subscription status into the database
- Draw engine: random draw, an algorithmic/weighted draw, prize-pool math
  (40/35/25% split), jackpot rollover logic, simulate-before-publish workflow
- Admin dashboard: users list, charity CRUD, draw simulation/publish, winner
  approve/reject/mark-paid
- Row Level Security policies so users can only see their own data, admins see everything
- Transactional emails (draw published, winner notice, subscription confirmed)

**Scaffolded / needs more passes from you:**
- Winner proof screenshot upload UI (the storage bucket + API route exist;
  there's no upload form on the dashboard yet — worth building next)
- Inline editing of users/scores from the admin panel (currently: use the
  Supabase Table Editor directly)
- Deeper animation/motion polish (Framer Motion is installed but only lightly used)
- Automated tests
- A cron job to auto-run the draw monthly (right now an admin triggers it manually)

This is an honest starting point you can extend — not a finished product.
Before you submit anything as an evaluation deliverable, make sure you
understand how each piece works; you may be asked to explain these decisions.

---

## Part 1 — Set this up in VS Code

### 1. Install prerequisites (one-time, skip what you already have)
1. Install **Node.js 20 LTS**: https://nodejs.org (the installer includes `npm`)
2. Install **VS Code**: https://code.visualstudio.com
3. Install **Git**: https://git-scm.com/downloads
4. In VS Code, install these extensions (Extensions panel, `Ctrl+Shift+X`):
   - "ES7+ React/Redux/React-Native snippets"
   - "Tailwind CSS IntelliSense"
   - "Prettier - Code formatter"

Verify Node installed correctly — open a terminal (`Ctrl+\``) and run:
```bash
node -v   # should print v20.x.x
npm -v
```

### 2. Open the project
1. Unzip the file I gave you to a folder, e.g. `C:\projects\fairway-impact` or `~/projects/fairway-impact`
2. In VS Code: **File → Open Folder…** → select that folder
3. Open the integrated terminal: **Terminal → New Terminal**

### 3. Install dependencies
```bash
npm install
```
This reads `package.json` and downloads everything (Next.js, Supabase client, Stripe, Tailwind, etc.) into a `node_modules` folder. Takes 1–3 minutes.

---

## Part 2 — Set up Supabase (your database)

1. Go to https://supabase.com → sign up (free tier is enough) → **New Project**
   - Pick any name/region, set a database password (save it somewhere)
   - Wait ~2 minutes for it to provision
2. In your new project: **Project Settings → API**. Copy three values, you'll need them next:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this one secret — never put it in client-side code)
3. **SQL Editor → New query** → open `supabase/schema.sql` from this project,
   paste the entire contents in, and click **Run**. This creates every table,
   the rolling-5-scores trigger, Row Level Security policies, the storage
   bucket for winner proofs, and seeds 3 sample charities.
4. **Authentication → URL Configuration** → set:
   - Site URL: `http://localhost:3000` (you'll change this after deploying)
   - Redirect URLs: add `http://localhost:3000/auth/callback`

---

## Part 3 — Set up Stripe (payments)

1. Go to https://dashboard.stripe.com → sign up → make sure you're in **Test mode** (toggle, top right)
2. **Product catalog → Add product**:
   - Create "Fairway Impact Monthly" — recurring price, $9.00/month → copy the **Price ID** (starts `price_`)
   - Create "Fairway Impact Yearly" — recurring price, $89.00/year → copy that **Price ID** too
3. **Developers → API keys** → copy the **Publishable key** and **Secret key** (test mode versions)
4. **Developers → Webhooks** → you'll add the endpoint URL after deploying to
   Vercel (Stripe needs a public HTTPS URL — `localhost` won't work directly
   unless you use the Stripe CLI, see optional step below).

### Optional: test webhooks locally
```bash
# install the Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
This prints a webhook signing secret (`whsec_...`) — use that in your local `.env.local` for `STRIPE_WEBHOOK_SECRET` while testing locally.

---

## Part 4 — Set up Resend (email, optional but recommended)

1. https://resend.com → sign up free → **API Keys → Create API Key** → copy it
2. For testing you can use their sandbox sender `onboarding@resend.dev` — no domain setup needed for development

If you skip this, the app still works — emails are just skipped with a console warning.

---

## Part 5 — Environment variables

In VS Code, duplicate `.env.example` and rename the copy to `.env.local`
(this file is git-ignored, so your secrets never get committed). Fill in
every value you collected above:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...

RESEND_API_KEY=re_...
EMAIL_FROM="Fairway Impact <onboarding@resend.dev>"

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Part 6 — Run it locally

```bash
npm run dev
```
Open http://localhost:3000 — you should see the homepage.

1. Click **Subscribe** → **Sign up** → create an account → confirm via the
   email Supabase sends (check spam; in dev, Supabase's default email
   provider is rate-limited, so this can be slow — that's normal)
2. Log in, go to `/dashboard/scores`, add a score
3. To test the subscription flow, use Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC
4. **Make yourself an admin**: in Supabase → SQL Editor, run:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
   Then visit `/admin` while logged in as that user.

---

## Part 7 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```
Create a new empty repo at https://github.com/new (don't initialize it with a README), then:
```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

---

## Part 8 — Deploy to Vercel

The PRD requires a **new** Vercel account/project (not personal/existing) — sign up fresh at https://vercel.com if needed.

1. https://vercel.com/new → **Import Git Repository** → pick your repo
2. Framework Preset: Next.js (auto-detected) — leave build settings default
3. **Environment Variables** → add every key from your `.env.local`, with one change:
   `NEXT_PUBLIC_SITE_URL` → set it to your upcoming Vercel URL, e.g. `https://fairway-impact.vercel.app` (you'll know the exact URL after the first deploy — you can redeploy after to fix it)
4. Click **Deploy**. Wait ~2 minutes.
5. Once deployed, copy your live URL and:
   - In **Supabase → Authentication → URL Configuration**: update Site URL
     and add `https://<your-app>.vercel.app/auth/callback` to Redirect URLs
   - In **Stripe → Developers → Webhooks → Add endpoint**: URL =
     `https://<your-app>.vercel.app/api/stripe/webhook`, select events
     `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted` → copy the new signing secret → update
     `STRIPE_WEBHOOK_SECRET` in Vercel's environment variables → redeploy
     (Vercel → Deployments → ⋯ → Redeploy)
   - In Vercel, update `NEXT_PUBLIC_SITE_URL` to the real deployed URL, then redeploy

6. Make your live admin account the same way as Part 6, step 4, but you're
   now running that SQL against your production Supabase project (same one — there's only one).

---

## Troubleshooting

- **"Invalid API key" from Supabase** → you mixed up the anon key and service role key, or didn't restart `npm run dev` after editing `.env.local`
- **Stripe checkout redirects but subscription never shows active** → your webhook isn't reachable. Locally, you need `stripe listen` running; in production, double check the webhook URL and signing secret in Vercel's env vars
- **"relation does not exist" errors** → the SQL in `supabase/schema.sql` didn't fully run — re-run it, check the SQL Editor's error output line by line
- **Build fails on Vercel but works locally** → almost always a missing environment variable. Compare your Vercel env vars against `.env.example`

---

## Project structure
```
src/
  app/                  Next.js App Router pages + API routes
    api/                Server-side route handlers (Stripe, scores, draws, winners)
    dashboard/          User-facing pages (protected)
    admin/              Admin-only pages (protected, role-checked)
    auth/                Login / signup / email callback
  components/           Shared UI components
  lib/                  Supabase clients, Stripe client, draw engine, prize pool math, email
  types/                Shared TypeScript types
supabase/schema.sql      Full DB schema, RLS policies, storage bucket, seed data
```
