const { createClient } = require('@supabase/supabase-js');

async function migrate() {
  const db1_url = 'https://utqweirxeimfolchyskv.supabase.co';
  const db1_key = 'sb_publishable_6XCmyw3Zyi_xuno3lC0_Dw_yvHZgwjM';

  const db2_url = 'https://eilxtuedgtimrxfvqojv.supabase.co';
  const db2_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHh0dWVkZ3RpbXJ4ZnZxb2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzI3NTQsImV4cCI6MjA5Nzk0ODc1NH0.W656PBpffUxSn-CTpHD7bDef_B5u2WXBdk8y7r9QmdE';

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
