# Fairway Impact — Reviewer Guide

A subscription platform combining golf score tracking, a monthly prize draw, and charity fundraising.
Here's everything you need to explore the live application end to end.

---

## Getting started

Open the live link in your browser. You'll land on the homepage — no account needed to browse charities or view pricing.

To explore the full experience, create a free account:

1. Click **Sign up** in the top navigation
2. Enter your name, email, and a password
3. Check your inbox for a confirmation email and click the link inside
4. You'll be redirected back to the app, now logged in

---

## Exploring as a regular user

### Subscribe

1. Go to **Pricing** from the nav
2. Choose Monthly or Yearly and click **Subscribe**
3. You'll be taken to a Stripe checkout page — use the test card below:

```
Card number:  4242 4242 4242 4242
Expiry:       Any future date (e.g. 12/27)
CVC:          Any 3 digits
```

4. Complete checkout — you'll be redirected back to your dashboard with an active subscription

### Add golf scores

1. Go to **Dashboard → Scores**
2. Add a Stableford score (must be between 1 and 45)
3. Try adding scores on different dates — the platform keeps your last 5 only; the oldest drops off automatically when you add a sixth
4. You can edit or delete any score

### Select a charity

1. Go to **Dashboard → Charity**
2. Browse the charity directory — you can search and filter
3. Select a charity to support — a minimum 10% of your subscription goes to them each month

### View your draw participation

Once subscribed and with scores entered, your dashboard shows your draw status for the current month — whether you're entered and what your assigned numbers are after the draw runs.

---

## Exploring as an admin

To see the admin side, use these credentials:

Ask the submitter to promote your own account.

Once logged in as admin, visit **/admin** from the nav.

### What you can do in the admin panel

**Users** — view all registered users, their subscription status, and selected charity

**Charities** — add, edit, or remove charities from the directory; mark one as featured (shown on the homepage)

**Draws** — this is the core of the platform:
1. Click **Simulate Draw** to generate a preview of winning numbers and prize tiers without publishing anything
2. Review the simulated results — which users would win, what each tier pays out
3. Click **Publish Draw** to make it official — this locks the results and sends email notifications to all participants and winners

**Winners** — view users who matched numbers in a published draw:
- See their prize tier and amount
- Approve or reject their proof of identity
- Mark them as paid once settled

---

## How the draw and prizes work

Each month, 5 winning numbers are drawn. Every active subscriber gets a set of numbers. Prizes are split by how many numbers a user matches:

| Numbers matched | Prize share |
|---|---|
| 5 (jackpot) | 40% of the monthly pool |
| 4 | 35% of the monthly pool |
| 3 | 25% of the monthly pool |

If nobody wins the jackpot in a given month, it rolls over and adds to the next month's 40% pot.

The prize pool grows with the number of active subscribers — more members means bigger prizes.

---

## Pages to visit

| Page | What it shows |
|---|---|
| `/` | Homepage — hero, how it works, featured charity |
| `/charities` | Full charity directory with search |
| `/charities/[id]` | Individual charity profile |
| `/pricing` | Subscription plans |
| `/dashboard` | User overview — subscription, scores, charity, winnings |
| `/dashboard/scores` | Score entry and history |
| `/dashboard/charity` | Charity selection |
| `/admin` | Admin overview (admin only) |
| `/admin/draws` | Run and publish the monthly draw (admin only) |
| `/admin/winners` | Winner verification and payout (admin only) |
| `/admin/charities` | Charity management (admin only) |
| `/admin/users` | User and subscription management (admin only) |

---

## Things worth testing specifically

- Sign up, confirm email, and log in — the full auth flow
- Subscribe using the test card and watch the dashboard update
- Add 6 scores and confirm only the 5 most recent are kept
- As admin, simulate a draw and then publish it
- Check that a non-admin account cannot access `/admin` (it redirects to dashboard)
- Log out and confirm that `/dashboard` redirects to the login page
