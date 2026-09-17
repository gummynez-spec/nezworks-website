-- =============================================================
-- SYSTEM CONFIG — editable welcome messages
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =============================================================

-- ------------------------------------------------------------
-- SYSTEM_CONFIG (key-value store for admin settings)
-- ------------------------------------------------------------
create table if not exists public.system_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Insert default welcome messages
insert into public.system_config (key, value) values
  ('welcome_client', '{"title": "Welcome to NezWorks!", "message": "สวัสดีค่ะ ขอบคุณที่มาใช้บริการ NezWorks 🎉\n\nเราพร้อมช่วยเหลือคุณทุกขั้นตอน หากมีคำถามอะไร สามารถพิมพ์ถามในแชทนี้ได้เลยนะคะ\n\n- ทีม NezWorks"}'::jsonb),
  ('welcome_freelancer', '{"title": "Welcome to NezWorks!", "message": "สวัสดีค่ะ ยินดีต้อนรับสู่ NezWorks 🎉\n\nคุณสามารถเริ่มรับงานได้ทันที หากมีคำถามหรือต้องการความช่วยเหลือ สามารถพิมพ์ถามในแชทนี้ได้เลยนะคะ\n\n- ทีม NezWorks"}'::jsonb)
on conflict (key) do nothing;

-- RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "System config: read" ON public.system_config FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "System config: update" ON public.system_config FOR UPDATE USING (true);
