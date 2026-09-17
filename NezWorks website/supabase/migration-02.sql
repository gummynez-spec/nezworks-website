-- =============================================================
-- ALTER TABLE: Add display_name + changes_remaining
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================

-- Clients: add display_name column
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS display_name text;

-- Clients: add display_name_changes_remaining column (default 1 = one free change)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS display_name_changes_remaining integer not null default 1;

-- Freelancers: add display_name column
ALTER TABLE public.freelancers ADD COLUMN IF NOT EXISTS display_name text;

-- Freelancers: add display_name_changes_remaining column (default 1 = one free change)
ALTER TABLE public.freelancers ADD COLUMN IF NOT EXISTS display_name_changes_remaining integer not null default 1;
