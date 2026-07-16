-- ========================================================
-- REENAT TRENDS DATABASE ENHANCEMENTS MIGRATION
-- Run this SQL in your Supabase database console or CLI
-- ========================================================

-- 1. Create COLLECTIONS table
CREATE TABLE IF NOT EXISTS public.collections (
  id serial PRIMARY KEY,
  title text NOT NULL,
  handle text UNIQUE NOT NULL,
  body_html text,
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Link PRODUCTS to COLLECTIONS with a foreign key column
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS collection_id integer REFERENCES public.collections(id);

-- 3. Create CUSTOMERS profile registry table
CREATE TABLE IF NOT EXISTS public.customers (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  phone text,
  first_name text,
  last_name text,
  default_address text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Enhance ORDERS table with detailed shipping components & tracking columns
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS shipping_line1 text,
  ADD COLUMN IF NOT EXISTS shipping_line2 text,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_state text,
  ADD COLUMN IF NOT EXISTS shipping_pincode text,
  ADD COLUMN IF NOT EXISTS shipping_country text DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS shiprocket_order_id text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS carrier_name text,
  ADD COLUMN IF NOT EXISTS tracking_url text;

-- 5. Create RETURN_ORDERS tracking table
CREATE TABLE IF NOT EXISTS public.return_orders (
  id serial PRIMARY KEY,
  order_id integer REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id integer REFERENCES public.products(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'Requested', -- 'Requested', 'Approved', 'Rejected', 'Picked Up', 'Completed'
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Populate COLLECTIONS table from existing unique product types (migration)
INSERT INTO public.collections (title, handle, body_html)
SELECT DISTINCT 
  type, 
  lower(regexp_replace(trim(type), '[^a-zA-Z0-9]+', '-', 'g')),
  concat('<p>Exquisite selection of handcrafted ', type, ' sarees.</p>')
FROM public.products
WHERE type IS NOT NULL AND trim(type) != ''
ON CONFLICT (handle) DO NOTHING;

-- 7. Update existing products to link to the new collections
UPDATE public.products p
SET collection_id = c.id
FROM public.collections c
WHERE trim(p.type) = trim(c.title) AND p.collection_id IS NULL;

-- 8. Enable Row Level Security (RLS) on the new tables
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_orders ENABLE ROW LEVEL SECURITY;

-- 9. Establish standard public SELECT policies for collections
DROP POLICY IF EXISTS "Allow public read collections" ON public.collections;
CREATE POLICY "Allow public read collections" ON public.collections FOR SELECT USING (true);

-- Note: No public policies are defined for customers and return_orders.
-- They remain secure, accessible only server-side using the service role key.
