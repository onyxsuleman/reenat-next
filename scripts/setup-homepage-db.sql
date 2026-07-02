-- ==========================================
-- REENAT TRENDS HOMEPAGE CONFIGURATION TABLE
-- Run this SQL in your Supabase SQL Editor
-- ==========================================

CREATE TABLE IF NOT EXISTS public.homepage_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous read access to configuration
CREATE POLICY "Allow public read access" 
  ON public.homepage_config 
  FOR SELECT USING (true);

-- Policy to allow anonymous write access to configuration
CREATE POLICY "Allow public write access" 
  ON public.homepage_config 
  FOR ALL USING (true) WITH CHECK (true);
