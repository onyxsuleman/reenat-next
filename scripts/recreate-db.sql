-- ========================================================
-- REENAT TRENDS FRESH DATABASE INITIALIZATION SCRIPT
-- WARNING: This will drop existing tables and recreate them.
-- Run this SQL in your Supabase SQL Editor (https://supabase.com)
-- ========================================================

-- Disable constraints temporarily to drop tables in any order
DROP TABLE IF EXISTS public.pinned_products CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.homepage_config CASCADE;

-- 1. Create PRODUCTS table with all 6 images, video, and stock columns from the start
CREATE TABLE public.products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  type text,
  color text,
  price numeric NOT NULL,
  originalprice numeric,
  image text NOT NULL,
  image2 text,
  image3 text,
  image4 text,
  image5 text,
  image6 text,
  video_url text,
  stock_qty integer DEFAULT 10,
  origin text,
  craft text,
  "desc" text,
  gst text DEFAULT '5',
  hsn text,
  weight numeric,
  styleid text,
  blouselen text DEFAULT '0.8',
  sareelen text DEFAULT '5.5',
  blousetype text DEFAULT 'Contrast Blouse',
  blousecolor text,
  transparency text DEFAULT 'No',
  qty text DEFAULT 'Single',
  fabric text,
  border text,
  occasion text,
  loom text,
  brand text DEFAULT 'REENAT TRENDS',
  linked_to text,
  catalog_id text,
  rating numeric DEFAULT 4.5,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create HOMEPAGE_CONFIG table
CREATE TABLE public.homepage_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create ORDERS table for checkouts
CREATE TABLE public.orders (
  id serial PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  subtotal numeric NOT NULL,
  tax numeric NOT NULL,
  discount numeric DEFAULT 0,
  total numeric NOT NULL,
  payment_method text NOT NULL DEFAULT 'COD',
  payment_status text NOT NULL DEFAULT 'pending',
  order_status text NOT NULL DEFAULT 'Pending', -- 'Pending', 'Shipped', 'Delivered', 'Cancelled'
  items jsonb NOT NULL -- [{id, name, price, qty, image, color, skuId}]
);

-- 4. Create PINNED_PRODUCTS table for homepage featured lists (1-9)
CREATE TABLE public.pinned_products (
  id serial PRIMARY KEY,
  product_id integer REFERENCES public.products(id) ON DELETE CASCADE,
  pin_order integer CHECK (pin_order BETWEEN 1 AND 9),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(pin_order) -- Ensures only one product occupies a pin slot
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_products ENABLE ROW LEVEL SECURITY;

-- 5. Define public access policies (for development & launch)
-- PRODUCTS policies
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

-- HOMEPAGE_CONFIG policies
CREATE POLICY "Allow public read homepage_config" ON public.homepage_config FOR SELECT USING (true);
CREATE POLICY "Allow public write homepage_config" ON public.homepage_config FOR ALL USING (true) WITH CHECK (true);

-- ORDERS policies
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- PINNED_PRODUCTS policies
CREATE POLICY "Allow public read pinned_products" ON public.pinned_products FOR SELECT USING (true);
CREATE POLICY "Allow public write pinned_products" ON public.pinned_products FOR ALL USING (true) WITH CHECK (true);
