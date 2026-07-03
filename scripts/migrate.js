const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function migrate() {
  const db1_url = process.env.OLD_SUPABASE_URL;
  const db1_key = process.env.OLD_SUPABASE_ANON_KEY;

  const db2_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const db2_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!db1_url || !db1_key || !db2_url || !db2_key) {
    console.error("Missing DB 1 or DB 2 credentials in env!");
    return;
  }

  console.log("Fetching products from old database (DB 1)...");
  const supabaseOld = createClient(db1_url, db1_key);
  const supabaseNew = createClient(db2_url, db2_key);

  try {
    const { data: oldProducts, error: fetchErr } = await supabaseOld.from('products').select('*');
    if (fetchErr) {
      console.error("Failed to fetch from old DB:", fetchErr.message);
      return;
    }

    console.log(`Fetched ${oldProducts.length} products from old DB.`);
    
    // We will insert these products into the new DB.
    // Let's filter out products that are already in the new DB (by name, styleid, or check all).
    const { data: newProducts, error: fetchNewErr } = await supabaseNew.from('products').select('name');
    if (fetchNewErr) {
      console.error("Failed to fetch from new DB:", fetchNewErr.message);
      return;
    }
    
    const existingNames = new Set((newProducts || []).map(p => p.name));
    const toInsert = oldProducts.filter(p => !existingNames.has(p.name));

    console.log(`Found ${toInsert.length} products that are not in the new DB.`);

    if (toInsert.length === 0) {
      console.log("No new products to migrate.");
      return;
    }

    // Prepare rows for insertion (keep the original IDs to avoid clashing or sequence errors)
    const rows = toInsert.map(p => {
      const row = { ...p };
      delete row.created_at; // Let the database handle timestamp
      return row;
    });

    console.log("Migrating rows:", rows.map(r => r.name));
    
    const { data, error: insertErr } = await supabaseNew.from('products').insert(rows);
    if (insertErr) {
      console.error("Migration insert error:", insertErr.message);
      console.error("Error details:", JSON.stringify(insertErr));
    } else {
      console.log("Migration successful!");
    }
  } catch (err) {
    console.error("Exception during migration:", err.message);
  }
}

migrate();
