/**
 * Fix script: Repair orders 9-15 by matching product names to find correct images and SKU IDs
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

// Normalize name for fuzzy matching
function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  console.log('=== Fetching all products ===');
  const products = await supabaseGet('products', 'select=id,name,image,color,styleid');
  console.log(`Found ${products.length} products\n`);

  console.log('=== Fetching orders 9-15 ===');
  const orders = await supabaseGet('orders', 'select=*&id=gte.9&id=lte.15&order=id.asc');
  console.log(`Found ${orders.length} orders\n`);

  for (const order of orders) {
    console.log(`--- Order #${order.id} (RT-${order.id}) ---`);
    const items = order.items || [];
    let changed = false;

    const enrichedItems = items.map(item => {
      const itemName = normalize(item.name);
      
      // Find best matching product by name similarity
      let bestMatch = null;
      let bestScore = 0;
      
      for (const prod of products) {
        const prodName = normalize(prod.name);
        // Count matching words
        const itemWords = itemName.split(' ').filter(w => w.length > 2);
        const prodWords = prodName.split(' ').filter(w => w.length > 2);
        const matches = itemWords.filter(w => prodWords.includes(w)).length;
        const score = matches / Math.max(itemWords.length, 1);
        
        if (score > bestScore && score > 0.4) {
          bestScore = score;
          bestMatch = prod;
        }
      }

      if (bestMatch) {
        console.log(`  Item "${item.name.substring(0, 50)}..." → matched product #${bestMatch.id} "${bestMatch.name.substring(0, 50)}..." (score: ${bestScore.toFixed(2)})`);
        
        const newItem = { ...item };
        
        // Fix the ID to point to our actual product
        newItem.id = bestMatch.id;
        
        if (!item.image || !item.image.startsWith('http')) {
          newItem.image = bestMatch.image || '';
          console.log(`    ✓ image → set`);
          changed = true;
        }
        
        if (!item.skuId || item.skuId === 'N/A') {
          newItem.skuId = bestMatch.styleid || '';
          console.log(`    ✓ skuId → "${bestMatch.styleid}"`);
          changed = true;
        }

        if (!item.color) {
          newItem.color = bestMatch.color || '';
          console.log(`    ✓ color → "${bestMatch.color}"`);
          changed = true;
        }

        return newItem;
      } else {
        console.log(`  ⚠ No match found for "${item.name.substring(0, 60)}"`);
        return item;
      }
    });

    if (changed) {
      console.log(`  → Patching order #${order.id}...`);
      try {
        await supabasePatch('orders', order.id, { items: enrichedItems });
        console.log(`  ✅ Order #${order.id} updated\n`);
      } catch (err) {
        console.error(`  ❌ Failed:`, err.message);
      }
    } else {
      console.log(`  (no changes needed)\n`);
    }
  }

  console.log('=== Verification: Re-reading orders ===');
  const verifyOrders = await supabaseGet('orders', 'select=id,payment_method,items&id=gte.9&id=lte.15&order=id.asc');
  for (const o of verifyOrders) {
    const item = (o.items || [])[0] || {};
    console.log(`Order #${o.id}: payment="${o.payment_method}" | skuId="${item.skuId || 'N/A'}" | image="${item.image ? '✓ SET' : '✗ EMPTY'}" | id=${item.id}`);
  }
  
  console.log('\n=== Done! ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
