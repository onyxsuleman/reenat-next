-- ==========================================
-- REENAT TRENDS DATABASE LAUNCH ADJUSTMENTS
-- Run this SQL in your Supabase SQL Editor
-- ==========================================

-- 1. Alter products table to support 6 images, video, and stock control
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image5 text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image6 text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_qty integer DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS linked_to text;

-- 2. Create orders table for secure checkout
CREATE TABLE IF NOT EXISTS public.orders (
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
  items jsonb NOT NULL -- json array of items: [{id, name, price, qty, image, color, skuId}]
);

-- Enable Row Level Security (RLS) on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous read (for users viewing order history and admin dashboard)
CREATE POLICY "Allow public read orders" 
  ON public.orders 
  FOR SELECT USING (true);

-- Policy to allow anonymous insert (for checkout submissions)
CREATE POLICY "Allow public insert orders" 
  ON public.orders 
  FOR INSERT WITH CHECK (true);

-- Policy to allow anonymous update (for updating status from CMS)
CREATE POLICY "Allow public update orders" 
  ON public.orders 
  FOR UPDATE USING (true) WITH CHECK (true);
