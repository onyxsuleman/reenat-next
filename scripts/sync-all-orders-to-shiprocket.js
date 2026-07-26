/**
 * Sync all existing orders from Supabase to Shiprocket
 */

const { getSupabaseServerClient } = require('../src/utils/supabaseServer.js');
const { pushOrderToShiprocket } = require('../src/utils/shiprocketApi.js');

async function syncAllOrders() {
  console.log('=== Starting Bulk Order Sync to Shiprocket ===');
  
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=id.asc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const orders = await res.json();
  console.log(`Found ${orders.length} orders in Supabase database.`);

  for (const order of orders) {
    if (!order.items || order.items.length === 0) {
      console.log(`Skipping Order #${order.id} (no items found)`);
      continue;
    }

    console.log(`\nSyncing Order #${order.id} (RT-${order.id}) for ${order.customer_name}...`);
    const result = await pushOrderToShiprocket(order);
    if (result.success) {
      console.log(`✅ Order #${order.id} synced! Shiprocket Order ID: ${result.shiprocket_order_id}, Shipment ID: ${result.shipment_id}`);
    } else {
      console.log(`⚠️ Order #${order.id} sync notice:`, result.error);
    }
  }

  console.log('\n=== Sync Finished! ===');
}

syncAllOrders().catch(err => console.error('Bulk sync failed:', err));
