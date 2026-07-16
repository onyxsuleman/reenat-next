-- ========================================================
-- REENAT TRENDS DATABASE ROW LEVEL SECURITY (RLS) LOCKDOWN
-- Run this SQL in your Supabase SQL Editor (https://supabase.com)
-- ========================================================

-- 1. Enable RLS on all tables (idempotent, safe to re-run)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_threads ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing wide-open public policies to prevent conflicting rules
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert products" ON public.products;
DROP POLICY IF EXISTS "Allow public update products" ON public.products;
DROP POLICY IF EXISTS "Allow public delete products" ON public.products;

DROP POLICY IF EXISTS "Allow public read homepage_config" ON public.homepage_config;
DROP POLICY IF EXISTS "Allow public write homepage_config" ON public.homepage_config;

DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;

DROP POLICY IF EXISTS "Allow public read pinned_products" ON public.pinned_products;
DROP POLICY IF EXISTS "Allow public write pinned_products" ON public.pinned_products;

DROP POLICY IF EXISTS "Allow public read community_threads" ON public.community_threads;
DROP POLICY IF EXISTS "Allow public insert community_threads" ON public.community_threads;
DROP POLICY IF EXISTS "Allow public update community_threads" ON public.community_threads;
DROP POLICY IF EXISTS "Allow public delete community_threads" ON public.community_threads;

-- ========================================================
-- 3. Define Secured policies for SELECT (Public Read Only)
-- ========================================================

-- PRODUCTS: Anyone can view sarees
CREATE POLICY "Allow public read products" 
  ON public.products 
  FOR SELECT 
  USING (true);

-- HOMEPAGE_CONFIG: Anyone can view homepage sliders/categories configuration
CREATE POLICY "Allow public read homepage_config" 
  ON public.homepage_config 
  FOR SELECT 
  USING (true);

-- COMMUNITY_THREADS: Anyone can read reviews and Q&As
CREATE POLICY "Allow public read community_threads" 
  ON public.community_threads 
  FOR SELECT 
  USING (true);

-- PINNED_PRODUCTS: Anyone can read pinned/featured listings
CREATE POLICY "Allow public read pinned_products" 
  ON public.pinned_products 
  FOR SELECT 
  USING (true);

-- ========================================================
-- 4. Define Locked-down policies for ORDERS
-- ========================================================
-- We do NOT define any public SELECT, INSERT, UPDATE, or DELETE policies for public/anon users on the orders table.
-- By leaving these policies undefined, Supabase blocks all client-side queries on orders.
-- Secure server-side routes (initialized with the Service Role Key) automatically bypass RLS and can query/write orders.

-- ========================================================
-- 5. Define policies for Writes (Server/Service Role Only)
-- ========================================================
-- Note: All insert/update/delete operations for products, config, and threads are now routed through our secure Next.js API endpoints.
-- Since Next.js API routes run on the server side and prioritize using the private SUPABASE_SERVICE_ROLE_KEY,
-- they bypass these RLS policies automatically.
-- The public anon key (used in the browser console) will be blocked from writing to any table.
