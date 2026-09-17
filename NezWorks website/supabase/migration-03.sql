-- =============================================================
-- ALTER TABLE: Add auth, email, bank columns
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================

-- Clients: add auth_user_id (links to Supabase Auth)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS auth_user_id uuid references auth.users(id) on delete cascade;

-- Clients: add email
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email text;

-- Clients: add bank columns
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS bank_account_name text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS bank_account_number text;

-- Freelancers: add auth_user_id (links to Supabase Auth)
ALTER TABLE public.freelancers ADD COLUMN IF NOT EXISTS auth_user_id uuid references auth.users(id) on delete cascade;

-- Freelancers: add email
ALTER TABLE public.freelancers ADD COLUMN IF NOT EXISTS email text;

-- Freelancers: add bank columns
ALTER TABLE public.freelancers ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.freelancers ADD COLUMN IF NOT EXISTS bank_account_name text;
ALTER TABLE public.freelancers ADD COLUMN IF NOT EXISTS bank_account_number text;

-- Enable RLS on all tables (if not already)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can read/update their own data
CREATE POLICY IF NOT EXISTS "Clients: own data" ON public.clients
  FOR ALL USING (auth_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Freelancers: own data" ON public.freelancers
  FOR ALL USING (auth_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Works: own data" ON public.works
  FOR ALL USING (freelancer_id IN (SELECT id FROM public.freelancers WHERE auth_user_id = auth.uid()));

-- Allow inserts during registration (before auth is fully set up)
CREATE POLICY IF NOT EXISTS "Clients: insert" ON public.clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Freelancers: insert" ON public.freelancers
  FOR INSERT WITH CHECK (true);
