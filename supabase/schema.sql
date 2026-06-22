-- ============================================================
-- Fairway Impact — Database Schema
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'subscriber' check (role in ('subscriber','admin')),
  stripe_customer_id text,
  charity_id uuid,
  charity_percent numeric not null default 10 check (charity_percent >= 10 and charity_percent <= 100),
  created_at timestamptz not null default now()
);

-- 2. CHARITIES
create table public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  image_url text,
  website text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_charity_fk foreign key (charity_id) references public.charities(id) on delete set null;

-- 3. SUBSCRIPTIONS
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('monthly','yearly')),
  status text not null default 'inactive' check (status in ('active','inactive','canceled','past_due')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- 4. SCORES — only the 5 most recent are kept (enforced in app logic + trigger below)
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score int not null check (score >= 1 and score <= 45),
  played_on date not null,
  created_at timestamptz not null default now(),
  unique (user_id, played_on) -- "Only one score entry is permitted per date"
);

-- Trigger: after insert, delete anything beyond the 5 most recent rows for that user
create or replace function public.enforce_rolling_five_scores()
returns trigger as $$
begin
  delete from public.scores
  where user_id = new.user_id
    and id not in (
      select id from public.scores
      where user_id = new.user_id
      order by played_on desc, created_at desc
      limit 5
    );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_rolling_five_scores
after insert on public.scores
for each row execute function public.enforce_rolling_five_scores();

-- 5. DRAWS
create table public.draws (
  id uuid primary key default gen_random_uuid(),
  month int not null check (month between 1 and 12),
  year int not null,
  draw_type text not null default 'random' check (draw_type in ('random','algorithmic')),
  status text not null default 'draft' check (status in ('draft','simulated','published')),
  winning_numbers int[] not null default '{}',
  prize_pool_total numeric not null default 0,
  jackpot_rollover numeric not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (month, year)
);

-- 6. DRAW ENTRIES — a user's numbers for a given draw (derived from their score history)
create table public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  numbers int[] not null,
  match_tier int, -- 5, 4, 3, or null
  created_at timestamptz not null default now(),
  unique (draw_id, user_id)
);

-- 7. WINNERS
create table public.winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  tier int not null check (tier in (3,4,5)),
  prize_amount numeric not null default 0,
  proof_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','paid')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- (Runs as the table owner, so it works even before the user's session/RLS exists.)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.charities enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.draw_entries enable row level security;
alter table public.winners enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- profiles
create policy "profiles_select_own_or_admin" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles for update using (auth.uid() = id or public.is_admin());
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- charities (public read, admin write)
create policy "charities_select_all" on public.charities for select using (true);
create policy "charities_admin_write" on public.charities for all using (public.is_admin()) with check (public.is_admin());

-- subscriptions
create policy "subs_select_own_or_admin" on public.subscriptions for select using (auth.uid() = user_id or public.is_admin());
create policy "subs_admin_write" on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());

-- scores
create policy "scores_select_own_or_admin" on public.scores for select using (auth.uid() = user_id or public.is_admin());
create policy "scores_insert_own" on public.scores for insert with check (auth.uid() = user_id);
create policy "scores_update_own_or_admin" on public.scores for update using (auth.uid() = user_id or public.is_admin());
create policy "scores_delete_own_or_admin" on public.scores for delete using (auth.uid() = user_id or public.is_admin());

-- draws (public read once published, admin manages everything)
create policy "draws_select_published_or_admin" on public.draws for select using (status = 'published' or public.is_admin());
create policy "draws_admin_write" on public.draws for all using (public.is_admin()) with check (public.is_admin());

-- draw_entries
create policy "entries_select_own_or_admin" on public.draw_entries for select using (auth.uid() = user_id or public.is_admin());
create policy "entries_admin_write" on public.draw_entries for all using (public.is_admin()) with check (public.is_admin());

-- winners
create policy "winners_select_own_or_admin" on public.winners for select using (auth.uid() = user_id or public.is_admin());
create policy "winners_insert_own" on public.winners for insert with check (auth.uid() = user_id);
create policy "winners_admin_write" on public.winners for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- STORAGE (winner proof screenshots)
-- Run after the SQL above: Storage -> create bucket "winner-proofs" (private)
-- Then run:
-- ============================================================
insert into storage.buckets (id, name, public) values ('winner-proofs', 'winner-proofs', false)
on conflict (id) do nothing;

create policy "proof_upload_own" on storage.objects for insert
  with check (bucket_id = 'winner-proofs' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "proof_read_own_or_admin" on storage.objects for select
  using (bucket_id = 'winner-proofs' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()));

-- ============================================================
-- SEED: a couple of starter charities so the directory isn't empty
-- ============================================================
insert into public.charities (name, description, featured, image_url) values
('First Tee Foundation', 'Helping young people build character and life skills through the game of golf.', true, 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b'),
('Greens for Good', 'Funding community sports access programs in under-resourced neighborhoods.', false, 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb'),
('Caddie Forward', 'Scholarships and mentorship for caddies transitioning into higher education.', false, 'https://images.unsplash.com/photo-1551958219-acbc608c6377');

-- ============================================================
-- IMPORTANT: after creating your first real user via signup,
-- run this once (replace the email) to make yourself an admin:
-- update public.profiles set role = 'admin' where id =
--   (select id from auth.users where email = 'you@example.com');
-- ============================================================
