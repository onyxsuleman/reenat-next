const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function testDbs() {
  const db1_url = process.env.OLD_SUPABASE_URL;
  const db1_key = process.env.OLD_SUPABASE_ANON_KEY;

  const db2_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const db2_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!db1_url || !db1_key || !db2_url || !db2_key) {
    console.error("Missing DB 1 or DB 2 credentials in env!");
    return;
  }

  console.log("Checking DB 1 (fallback):", db1_url);
  try {
    const supabase1 = createClient(db1_url, db1_key);
    const { data: p1, error: e1 } = await supabase1.from('products').select('name');
    if (e1) {
      console.log("DB 1 Error:", e1.message);
    } else {
      console.log(`DB 1 returned ${p1.length} items:`, p1.map(p => p.name));
    }
  } catch (err) {
    console.log("DB 1 Exception:", err.message);
  }

  console.log("\nChecking DB 2 (.env.local):", db2_url);
  try {
    const supabase2 = createClient(db2_url, db2_key);
    const { data: p2, error: e2 } = await supabase2.from('products').select('name');
    if (e2) {
      console.log("DB 2 Error:", e2.message);
    } else {
      console.log(`DB 2 returned ${p2.length} items:`, p2.map(p => p.name));
    }
  } catch (err) {
    console.log("DB 2 Exception:", err.message);
  }
}

testDbs();
