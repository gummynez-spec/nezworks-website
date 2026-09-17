-- ============================================================
-- NezWorks — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- CLIENTS (register-client form)
-- ------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  email text not null,
  name text not null,
  display_name text,
  display_name_changes_remaining integer not null default 1,
  brand text,
  needs jsonb,
  project text,
  contact jsonb not null,
  budget jsonb,
  bank_name text,
  bank_account_name text,
  bank_account_number text
);

-- ------------------------------------------------------------
-- FREELANCERS (register-freelancer form)
-- ------------------------------------------------------------
create table if not exists public.freelancers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  email text not null,
  name text not null,
  display_name text,
  display_name_changes_remaining integer not null default 1,
  skills jsonb,
  exp text,
  contact jsonb not null,
  portfolio text,
  bank_name text,
  bank_account_name text,
  bank_account_number text
);

-- ------------------------------------------------------------
-- WORKS (freelancer workspace listings)
-- ------------------------------------------------------------
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  freelancer_id uuid references public.freelancers(id) on delete set null,
  title text not null,
  description text,
  price numeric not null default 0,
  cat text,
  deliver text,
  cover_img text,
  published boolean not null default true,
  views integer not null default 0,
  orders integer not null default 0
);

-- ------------------------------------------------------------
-- CONTACT MESSAGES (contact.html form)
-- ------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  topic text,
  message text
);

-- ------------------------------------------------------------
-- PROJECT REQUESTS (index project modal)
-- ------------------------------------------------------------
create table if not exists public.project_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  service text,
  scope text,
  name text,
  email text,
  brief text
);

-- ------------------------------------------------------------
-- Row Level Security — demo permissive policies
-- (replace with Supabase Auth + auth.uid() when real logins ship)
-- ------------------------------------------------------------
alter table public.clients enable row level security;
alter table public.freelancers enable row level security;
alter table public.works enable row level security;
alter table public.contact_messages enable row level security;
alter table public.project_requests enable row level security;

create policy "clients public insert" on public.clients for insert to anon with check (true);
create policy "clients public select" on public.clients for select to anon using (true);
create policy "clients public update" on public.clients for update to anon using (true);
create policy "clients public delete" on public.clients for delete to anon using (true);

create policy "freelancers public insert" on public.freelancers for insert to anon with check (true);
create policy "freelancers public select" on public.freelancers for select to anon using (true);
create policy "freelancers public update" on public.freelancers for update to anon using (true);
create policy "freelancers public delete" on public.freelancers for delete to anon using (true);

create policy "works public insert" on public.works for insert to anon with check (true);
create policy "works public select" on public.works for select to anon using (true);
create policy "works public update" on public.works for update to anon using (true);
create policy "works public delete" on public.works for delete to anon using (true);

create policy "contact public insert" on public.contact_messages for insert to anon with check (true);
create policy "contact public select" on public.contact_messages for select to anon using (true);

create policy "requests public insert" on public.project_requests for insert to anon with check (true);
create policy "requests public select" on public.project_requests for select to anon using (true);