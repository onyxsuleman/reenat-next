const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

async function test() {
  const sql = `
  CREATE TABLE IF NOT EXISTS checkout_orders (
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
  );
  `;

  const headersList = [
    { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
    { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    { 'x-api-key': SUPABASE_KEY, 'Content-Type': 'application/json' }
  ];

  for (const h of headersList) {
    try {
      const res = await fetch(`${SUPABASE_URL}/pg_meta/v1/query`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify({ query: sql })
      });
      console.log('Status:', res.status, await res.text());
    } catch (err) {
      console.error(err);
    }
  }
}

test();
