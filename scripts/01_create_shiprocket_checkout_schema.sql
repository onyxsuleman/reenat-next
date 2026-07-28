-- ====================================================================
-- REENAT TRENDS - SHIPROCKET FAST CHECKOUT (FASTRR) 4-TABLE SCHEMA
-- Run this SQL script in your Supabase SQL Editor (https://supabase.com)
-- Date Label Backup Snapshot: 27/07/2026
-- ====================================================================

-- 1. Main Orders Table
CREATE TABLE IF NOT EXISTS public.checkout_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  legacy_id BIGINT UNIQUE,
  fastrr_order_id TEXT UNIQUE,
  shiprocket_order_id TEXT,
  user_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  financial_status TEXT DEFAULT 'pending', -- 'paid', 'pending', 'refunded'
  payment_method TEXT DEFAULT 'cod',       -- 'prepaid', 'cod'
  payment_gateway TEXT,                    -- 'payu', 'upi', 'cod'
  sub_total NUMERIC(10,2) DEFAULT 0.00,
  shipping_charges NUMERIC(10,2) DEFAULT 0.00,
  discount_amount NUMERIC(10,2) DEFAULT 0.00,
  tax_amount NUMERIC(10,2) DEFAULT 0.00,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  order_status TEXT DEFAULT 'Pending',     -- 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Line Items Table (Relational Item-by-Item Storage)
CREATE TABLE IF NOT EXISTS public.checkout_order_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.checkout_orders(id) ON DELETE CASCADE,
  product_id BIGINT,
  sku TEXT,                                -- Master Warehouse SKU (styleid)
  variant_id TEXT,                         -- Fastrr / Product Variant Code
  product_name TEXT NOT NULL,
  image_url TEXT,
  color TEXT,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 1,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Addresses Table (Structured Shipping & Billing Addresses)
CREATE TABLE IF NOT EXISTS public.checkout_order_addresses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.checkout_orders(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL DEFAULT 'shipping', -- 'shipping', 'billing'
  full_name TEXT,
  phone TEXT,
  email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Shipment Metadata Table (Courier & Tracking Metadata)
CREATE TABLE IF NOT EXISTS public.checkout_shipments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.checkout_orders(id) ON DELETE CASCADE,
  shipment_id TEXT,                        -- Shiprocket Shipment ID
  courier_name TEXT,                       -- Courier (e.g. Delhivery, BlueDart)
  awb_code TEXT,                           -- Waybill Tracking Code
  pickup_location TEXT DEFAULT 'work',
  package_weight NUMERIC(6,3) DEFAULT 0.800,
  tracking_status TEXT DEFAULT 'MANIFESTED',-- 'MANIFESTED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'
  tracking_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_checkout_orders_fastrr_id ON public.checkout_orders(fastrr_order_id);
CREATE INDEX IF NOT EXISTS idx_checkout_orders_shiprocket_id ON public.checkout_orders(shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_checkout_orders_phone ON public.checkout_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_checkout_orders_email ON public.checkout_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_checkout_order_items_order_id ON public.checkout_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_checkout_order_items_sku ON public.checkout_order_items(sku);
CREATE INDEX IF NOT EXISTS idx_checkout_order_addresses_order_id ON public.checkout_order_addresses(order_id);
CREATE INDEX IF NOT EXISTS idx_checkout_shipments_order_id ON public.checkout_shipments(order_id);

-- Automated Function & Trigger for Gateway Normalization
CREATE OR REPLACE FUNCTION clean_incoming_fastrr_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalize Payment Method
  IF LOWER(NEW.payment_method) IN ('online', 'payu', 'upi', 'card', 'prepaid', 'pay online') THEN
    NEW.payment_method := 'prepaid';
  ELSE
    NEW.payment_method := 'cod';
  END IF;

  -- Default payment gateway if blank
  IF NEW.payment_gateway IS NULL OR NEW.payment_gateway = '' THEN
    IF NEW.payment_method = 'prepaid' THEN
      NEW.payment_gateway := 'payu';
    ELSE
      NEW.payment_gateway := 'cod';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clean_fastrr_order ON public.checkout_orders;
CREATE TRIGGER trg_clean_fastrr_order
BEFORE INSERT OR UPDATE ON public.checkout_orders
FOR EACH ROW EXECUTE FUNCTION clean_incoming_fastrr_order();

-- Enable Row Level Security (RLS) on all 4 tables
ALTER TABLE public.checkout_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_order_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_shipments ENABLE ROW LEVEL SECURITY;

-- Security Policies (Service role bypasses RLS automatically; client public reads permitted for authenticated user history)
CREATE POLICY "Allow public read checkout_orders" ON public.checkout_orders FOR SELECT USING (true);
CREATE POLICY "Allow public read checkout_order_items" ON public.checkout_order_items FOR SELECT USING (true);
CREATE POLICY "Allow public read checkout_order_addresses" ON public.checkout_order_addresses FOR SELECT USING (true);
CREATE POLICY "Allow public read checkout_shipments" ON public.checkout_shipments FOR SELECT USING (true);
