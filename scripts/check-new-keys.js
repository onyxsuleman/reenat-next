const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function checkNewKeys() {
  const db2_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const db2_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!db2_url || !db2_key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env!");
    return;
  }

  const supabaseNew = createClient(db2_url, db2_key);
  const { data, error } = await supabaseNew.from('products').select('id, name');
  if (error) {
    console.error(error);
  } else {
    console.log("New DB Products:", data);
  }
}

checkNewKeys();
