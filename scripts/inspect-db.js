const { createClient } = require('@supabase/supabase-js');

const url = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const supabase = createClient(url, key);

async function inspect() {
  console.log("=== Inspecting Products in Database ===");
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name, catalog_id, color, styleid, stock_qty');
  
  if (pErr) {
    console.error("Products fetch error:", pErr);
  } else {
    console.log(`Total Products in DB: ${products.length}`);
    const catalogMap = {};
    products.forEach(p => {
      const cid = p.catalog_id || 'UNCATEGORIZED';
      if (!catalogMap[cid]) catalogMap[cid] = [];
      catalogMap[cid].push({ id: p.id, color: p.color, styleid: p.styleid, name: p.name });
    });
    console.log("Catalogs breakdown:", JSON.stringify(catalogMap, null, 2));
  }

  console.log("\n=== Inspecting homepage_config / catalog_sequence in DB ===");
  const { data: config, error: cErr } = await supabase
    .from('homepage_config')
    .select('*');

  if (cErr) {
    console.error("homepage_config fetch error:", cErr);
  } else {
    console.log("homepage_config rows:", JSON.stringify(config, null, 2));
  }
}

inspect();
