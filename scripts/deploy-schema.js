/**
 * Deploy SQL Schema for Shiprocket Fastrr Checkout 4-Table Architecture
 */

const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

const sqlStatements = [
  `CREATE TABLE IF NOT EXISTS checkout_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    legacy_id BIGINT UNIQUE,
    fastrr_order_id TEXT UNIQUE,
    shiprocket_order_id TEXT,
    user_id UUID,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    financial_status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cod',
    payment_gateway TEXT,
    sub_total NUMERIC(10,2) DEFAULT 0.00,
    shipping_charges NUMERIC(10,2) DEFAULT 0.00,
    discount_amount NUMERIC(10,2) DEFAULT 0.00,
    tax_amount NUMERIC(10,2) DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    order_status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS checkout_order_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES checkout_orders(id) ON DELETE CASCADE,
    product_id BIGINT,
    sku TEXT,
    variant_id TEXT,
    product_name TEXT NOT NULL,
    image_url TEXT,
    color TEXT,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    quantity INT NOT NULL DEFAULT 1,
    total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS checkout_order_addresses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES checkout_orders(id) ON DELETE CASCADE,
    address_type TEXT NOT NULL DEFAULT 'shipping',
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
  );`,

  `CREATE TABLE IF NOT EXISTS checkout_shipments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES checkout_orders(id) ON DELETE CASCADE,
    shipment_id TEXT,
    courier_name TEXT,
    awb_code TEXT,
    pickup_location TEXT,
    package_weight NUMERIC(6,3) DEFAULT 0.800,
    tracking_status TEXT DEFAULT 'MANIFESTED',
    tracking_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`
];

async function main() {
  console.log('=== DEPLOYING 4-TABLE SHIPROCKET SCHEMA TO SUPABASE ===');

  // Check if tables already exist or execute via sql / rest endpoint
  for (let i = 0; i < sqlStatements.length; i++) {
    const stmt = sqlStatements[i];
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: stmt })
      });
      
      if (!res.ok) {
        // Try fallback query or direct table inspection
        console.log(`Notice on statement ${i+1}: ${res.status}`);
      } else {
        console.log(`Statement ${i+1} executed successfully.`);
      }
    } catch (err) {
      console.warn(`Statement ${i+1} warning:`, err.message);
    }
  }

  // Verify tables by querying REST API directly
  const tableNames = ['checkout_orders', 'checkout_order_items', 'checkout_order_addresses', 'checkout_shipments'];
  for (const table of tableNames) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, { headers });
    if (res.ok) {
      console.log(`✅ Table "${table}" is ACTIVE and accessible via REST API.`);
    } else {
      console.log(`❌ Table "${table}" returned status ${res.status}: ${await res.text()}`);
    }
  }
}

main().catch(err => console.error('Deployment error:', err));
