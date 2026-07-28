/**
 * One-time fix script: Repair existing orders in Supabase
 * - Updates payment_method from "Pay Online" to "COD" for COD orders
 * - Enriches order items with correct images and SKU IDs from products table
 */

const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function supabaseGet(table, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers });
  if (!res.ok) throw new Error(`GET ${table} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function supabasePatch(table, id, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PATCH ${table} id=${id} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log('=== Fetching all products for lookup ===');
  const products = await supabaseGet('products', 'select=id,name,image,color,styleid');
  console.log(`Found ${products.length} products`);

  // Build lookup by numeric ID
  const prodLookup = {};
  products.forEach(p => {
    prodLookup[String(p.id)] = p;
  });

  console.log('\n=== Fetching all orders ===');
  const orders = await supabaseGet('orders', 'select=*&order=id.asc');
  console.log(`Found ${orders.length} orders\n`);

  for (const order of orders) {
    console.log(`--- Order #${order.id} (RT-${order.id}) ---`);
    console.log(`  Current payment_method: "${order.payment_method}"`);
    
    const updates = {};
    let changed = false;

    // 1. Fix payment_method: All orders except the last one (RT-8) are showing "Pay Online" but may be COD
    // We'll set all orders with "Pay Online" to "COD" since user confirmed they are all COD
    if (order.payment_method === 'Pay Online') {
      updates.payment_method = 'COD';
      updates.payment_status = 'pending';
      console.log(`  ✓ Fixing payment_method: "Pay Online" → "COD"`);
      changed = true;
    }

    // 2. Enrich items with product data
    const items = order.items || [];
    let itemsChanged = false;
    
    const enrichedItems = items.map(item => {
      const numId = String(item.id || '').replace(/\D/g, '');
      const matchedProd = numId ? prodLookup[numId] : null;
      
      if (!matchedProd) {
        console.log(`  ⚠ No product found for item id=${item.id}`);
        return item;
      }

      const newItem = { ...item };

      // Fix image
      if (!item.image || !item.image.startsWith('http')) {
        newItem.image = matchedProd.image || '';
        console.log(`  ✓ Item ${item.id}: image → "${(matchedProd.image || '').substring(0, 60)}..."`);
        itemsChanged = true;
      }

      // Fix skuId  
      if (!item.skuId || item.skuId === 'N/A' || item.skuId === '') {
        newItem.skuId = matchedProd.styleid || '';
        console.log(`  ✓ Item ${item.id}: skuId → "${matchedProd.styleid}"`);
        itemsChanged = true;
      }

      // Fix name
      if (!item.name || item.name === 'Saree') {
        newItem.name = matchedProd.name || item.name;
        itemsChanged = true;
      }

      // Fix color
      if (!item.color) {
        newItem.color = matchedProd.color || '';
        itemsChanged = true;
      }

      return newItem;
    });

    if (itemsChanged) {
      updates.items = enrichedItems;
      changed = true;
    }

    if (changed) {
      console.log(`  → Patching order #${order.id}...`);
      try {
        const result = await supabasePatch('orders', order.id, updates);
        console.log(`  ✅ Order #${order.id} updated successfully`);
      } catch (err) {
        console.error(`  ❌ Failed to update order #${order.id}:`, err.message);
      }
    } else {
      console.log(`  (no changes needed)`);
    }
    console.log('');
  }

  console.log('=== Done! All orders processed. ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
