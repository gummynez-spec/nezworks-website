-- =============================================================
-- RUN THIS FIRST — All tables in one go
-- Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================

create extension if not exists "pgcrypto";

-- =============================================================
-- 1. CLIENTS
-- =============================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  email text,
  name text not null,
  display_name text,
  display_name_changes_remaining integer not null default 1,
  brand text,
  needs jsonb,
  project text,
  contact jsonb,
  budget jsonb,
  bank_name text,
  bank_account_name text,
  bank_account_number text
);

-- =============================================================
-- 2. FREELANCERS
-- =============================================================
create table if not exists public.freelancers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  email text,
  name text not null,
  display_name text,
  display_name_changes_remaining integer not null default 1,
  skills jsonb,
  exp text,
  contact jsonb,
  portfolio text,
  bank_name text,
  bank_account_name text,
  bank_account_number text
);

-- =============================================================
-- 3. WORKS
-- =============================================================
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  freelancer_id uuid references public.freelancers(id) on delete set null,
  title text not null,
  description text,
  price numeric not null default 0,
  cat text,
  deliver text,
  status text default 'active'
);

-- =============================================================
-- 4. CONVERSATIONS (chat)
-- =============================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_id uuid references public.clients(id) on delete cascade,
  freelancer_id uuid references public.freelancers(id) on delete cascade,
  client_name text,
  freelancer_name text,
  last_message text
);

-- =============================================================
-- 5. MESSAGES (chat + invoices)
-- =============================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  sender_role text not null,
  type text not null default 'text',
  content text,
  invoice_data jsonb
);

-- =============================================================
-- 6. CONTACT MESSAGES (from contact form)
-- =============================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  message text
);

-- =============================================================
-- 7. PROJECT REQUESTS (from project modal)
-- =============================================================
create table if not exists public.project_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  project_type text,
  budget text,
  details text
);

-- =============================================================
-- 8. SYSTEM CONFIG (welcome messages etc.)
-- =============================================================
create table if not exists public.system_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Default welcome messages
insert into public.system_config (key, value) values
  ('welcome_client', '{"title": "Welcome to NezWorks!", "message": "สวัสดีค่ะ ขอบคุณที่มาใช้บริการ NezWorks 🎉\n\nเราพร้อมช่วยเหลือคุณทุกขั้นตอน หากมีคำถามอะไร สามารถพิมพ์ถามในแชทนี้ได้เลยนะคะ\n\n- ทีม NezWorks"}'::jsonb),
  ('welcome_freelancer', '{"title": "Welcome to NezWorks!", "message": "สวัสดีค่ะ ยินดีต้อนรับสู่ NezWorks 🎉\n\nคุณสามารถเริ่มรับงานได้ทันที หากมีคำถามหรือต้องการความช่วยเหลือ สามารถพิมพ์ถามในแชทนี้ได้เลยนะคะ\n\n- ทีม NezWorks"}'::jsonb)
on conflict (key) do nothing;

-- =============================================================
-- 9. INDEXES
-- =============================================================
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_conversations_client on public.conversations(client_id);
create index if not exists idx_conversations_freelancer on public.conversations(freelancer_id);
create index if not exists idx_works_freelancer on public.works(freelancer_id);

-- =============================================================
-- 10. RLS (Row Level Security)
-- =============================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Allow all operations (simpler for now)
CREATE POLICY IF NOT EXISTS "allow_all" ON public.clients FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "allow_all" ON public.freelancers FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "allow_all" ON public.works FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "allow_all" ON public.conversations FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "allow_all" ON public.messages FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "allow_all" ON public.contact_messages FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "allow_all" ON public.project_requests FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "allow_all" ON public.system_config FOR ALL USING (true);

-- =============================================================
-- 11. REALTIME (for live chat)
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
