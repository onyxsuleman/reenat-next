-- Migration: Add address_line2, district, taluka columns to orders and checkout_order_addresses
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS taluka TEXT;

ALTER TABLE public.checkout_order_addresses ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.checkout_order_addresses ADD COLUMN IF NOT EXISTS taluka TEXT;
