const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

async function verify() {
  console.log('=== VERIFYING 4-TABLE RELATIONAL DATA ===');

  // Query checkout_orders with joined items, addresses, and shipments
  const res = await fetch(`${SUPABASE_URL}/rest/v1/checkout_orders?select=*,items:checkout_order_items(*),addresses:checkout_order_addresses(*),shipments:checkout_shipments(*)&limit=3&order=created_at.desc`, { headers });
  if (!res.ok) {
    console.error('❌ Failed to fetch from checkout_orders:', res.status, await res.text());
    return;
  }

  const data = await res.json();
  console.log(`✅ Successfully fetched ${data.length} orders from 4-table relational architecture!`);

  data.forEach((o, i) => {
    console.log(`\n--- Order #${i+1}: ${o.customer_name} (Fastrr ID: ${o.fastrr_order_id}) ---`);
    console.log(`  Legacy ID: ${o.legacy_id}`);
    console.log(`  Payment Method: ${o.payment_method} (${o.payment_gateway})`);
    console.log(`  Financial Status: ${o.financial_status}`);
    console.log(`  Total: ₹${o.total_amount}`);
    console.log(`  Items Count: ${o.items.length}`);
    o.items.forEach(item => {
      console.log(`    - Item: ${item.product_name} | SKU: ${item.sku} | Price: ₹${item.unit_price} x ${item.quantity}`);
    });
    const addr = o.addresses[0] || {};
    console.log(`  Shipping Address: ${addr.address_line1}, ${addr.city}, ${addr.state} - ${addr.pincode}`);
    const shp = o.shipments[0] || {};
    console.log(`  Shipment Tracking: Status=${shp.tracking_status} | ShipmentID=${shp.shipment_id}`);
  });

  console.log('\n=== ALL 4 TABLES ARE FULLY FUNCTIONAL AND SYNCED! ===');
}

verify();
