/**
 * Diagnostic: Show what's stored in each order's items array
 */

const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

async function main() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=id.asc`, { headers });
  const orders = await res.json();

  for (const order of orders) {
    console.log(`\n=== Order #${order.id} (RT-${order.id}) ===`);
    console.log(`  payment_method: "${order.payment_method}"`);
    console.log(`  customer: ${order.customer_name}`);
    const items = order.items || [];
    items.forEach((item, idx) => {
      console.log(`  Item[${idx}]:`);
      console.log(`    id: ${item.id}`);
      console.log(`    name: "${item.name}"`);
      console.log(`    skuId: "${item.skuId || item.sku || 'N/A'}"`);
      console.log(`    image: "${(item.image || '').substring(0, 80)}"`);
      console.log(`    price: ${item.price}, qty: ${item.qty}`);
      console.log(`    color: "${item.color || ''}"`);
    });
  }
}

main().catch(err => console.error(err));
