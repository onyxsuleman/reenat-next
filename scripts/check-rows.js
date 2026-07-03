const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function checkRows() {
  const db1_url = process.env.OLD_SUPABASE_URL;
  const db1_key = process.env.OLD_SUPABASE_ANON_KEY;

  if (!db1_url || !db1_key) {
    console.error("Missing OLD_SUPABASE_URL or OLD_SUPABASE_ANON_KEY in env!");
    return;
  }

  const supabaseOld = createClient(db1_url, db1_key);
  const { data, error } = await supabaseOld.from('products').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log("One product row:", JSON.stringify(data[0], null, 2));
  }
}

checkRows();
