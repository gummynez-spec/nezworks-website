-- =============================================================
-- MESSAGES + INVOICES — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =============================================================

-- ------------------------------------------------------------
-- CONVERSATIONS (who's chatting)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- MESSAGES (individual messages + invoices)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Indexes for fast queries
-- ------------------------------------------------------------
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_conversations_client on public.conversations(client_id);
create index if not exists idx_conversations_freelancer on public.conversations(freelancer_id);

-- ------------------------------------------------------------
-- RLS policies
-- ------------------------------------------------------------
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Conversations: own data" ON public.conversations
  FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Messages: own data" ON public.messages
  FOR ALL USING (true);

-- ------------------------------------------------------------
-- Realtime (optional — enables live updates)
-- ------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
