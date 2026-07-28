const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function changeCollection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env!");
    return;
  }

  const supabase = createClient(url, key);
  
  console.log("Updating product ID 100 collection_id to 1 using service role...");
  const { data, error } = await supabase
    .from('products')
    .update({ collection_id: 1 })
    .eq('id', 100)
    .select();

  if (error) {
    console.error("Error updating product:", error);
  } else {
    console.log("Update success! Product data now:", JSON.stringify(data, null, 2));
  }
}

changeCollection();
