const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function checkNewProducts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env!");
    return;
  }

  const supabase = createClient(url, key);
  const { data: collections, error: colError } = await supabase.from('collections').select('*');
  if (colError) {
    console.error("Collections error:", colError);
  } else {
    console.log("All collections in database:");
    console.log(JSON.stringify(collections, null, 2));
  }

  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error(error);
  } else {
    console.log(`Total products: ${data.length}`);
    const targets = data.filter(p => p.catalog_id === 'M8' || p.id === 100);
    console.log("Matched products:", JSON.stringify(targets, null, 2));
    
    // Print all IDs and keys
    console.log("All products mapping:");
    data.forEach(p => {
      console.log(`ID: ${p.id}, Catalog: ${p.catalog_id}, Color: ${p.color}, StyleId: ${p.styleid || p.styleId}, Price: ${p.price}, CollectionID: ${p.collection_id}`);
    });
  }
}

checkNewProducts();
