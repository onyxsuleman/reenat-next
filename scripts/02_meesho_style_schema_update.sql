-- 02_meesho_style_schema_update.sql
-- Add 3-pillar product identity columns (catalog_id, product_id, sku) to products and checkout_order_items

-- 1. Ensure products table has explicit product_id and sku columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS catalog_id text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_id text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;

-- Populate product_id for existing rows where missing (e.g. NSY0042 from id 42)
UPDATE public.products 
SET product_id = 'NSY' || LPAD(id::text, 4, '0')
WHERE product_id IS NULL OR product_id = '';

-- Populate sku from styleid if sku is null
UPDATE public.products
SET sku = styleid
WHERE (sku IS NULL OR sku = '') AND styleid IS NOT NULL AND styleid != '';

-- 2. Ensure checkout_order_items table has product_id, sku, and catalog_id columns
ALTER TABLE public.checkout_order_items ADD COLUMN IF NOT EXISTS product_id_str text;
ALTER TABLE public.checkout_order_items ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.checkout_order_items ADD COLUMN IF NOT EXISTS catalog_id text;

-- 3. Index for ultra-fast product lookups by product_id and sku
CREATE INDEX IF NOT EXISTS idx_products_product_id ON public.products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_catalog_id ON public.products(catalog_id);
