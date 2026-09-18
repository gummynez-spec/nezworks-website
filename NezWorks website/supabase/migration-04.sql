-- =============================================================
-- ALTER TABLE: Add revisions, tags, gallery to works
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================

-- Works: add revision count
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS revisions integer DEFAULT 2;

-- Works: add style tags (JSONB array)
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;

-- Works: add gallery images (JSONB array of base64/URL strings)
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb;

-- Works: add freelancer name (denormalized for fast reads)
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS freelancer_name text;

-- Works: add slug (for clean URLs, optional)
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS slug text;
