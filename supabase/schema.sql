-- Firstline Database Schema
-- Run this in Supabase SQL Editor

create table if not exists profiles (
  id uuid references auth.users primary key,
  email text,
  stripe_customer_id text,
  plan text default 'free',
  leads_used_this_month int default 0,
  api_key text unique,
  created_at timestamptz default now()
);

create table if not exists lead_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  name text,
  status text default 'pending',
  total_leads int,
  processed_leads int default 0,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lead_lists(id),
  name text,
  company text,
  linkedin_url text,
  email text,
  enriched_data jsonb,
  generated_line text,
  feedback text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table lead_lists enable row level security;
alter table leads enable row level security;

-- RLS Policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can view own lead lists" on lead_lists
  for select using (auth.uid() = user_id);

create policy "Users can insert own lead lists" on lead_lists
  for insert with check (auth.uid() = user_id);

create policy "Users can view own leads" on leads
  for select using (
    list_id in (select id from lead_lists where user_id = auth.uid())
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Reset monthly usage (run via cron)
-- select cron.schedule('reset-monthly-usage', '0 0 1 * *', $$
--   update profiles set leads_used_this_month = 0;
-- $$);
