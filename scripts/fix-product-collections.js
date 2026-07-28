const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function fixProductCollections() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY in env!");
    return;
  }

  const supabase = createClient(url, key);

  // 1. Fetch products with null collection_id
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, type, collection_id');

  if (prodErr) {
    console.error("Error fetching products:", prodErr);
    return;
  }

  const nullProducts = products.filter(p => p.collection_id === null);
  console.log(`Found ${nullProducts.length} products with null collection_id out of ${products.length} total products.`);

  if (nullProducts.length === 0) {
    console.log("No products to fix!");
    return;
  }

  // 2. Fetch all collections
  const { data: collections, error: colErr } = await supabase
    .from('collections')
    .select('*');

  if (colErr) {
    console.error("Error fetching collections:", colErr);
    return;
  }

  console.log("Current collections:", collections.map(c => `${c.id}: ${c.title}`));

  for (const product of nullProducts) {
    const pType = product.type ? product.type.trim() : '';
    if (!pType) {
      console.log(`Product ID ${product.id} ("${product.name}") has no type. Skipping...`);
      continue;
    }

    // Check if collection exists
    let matchedCollection = collections.find(c => c.title.toLowerCase() === pType.toLowerCase());

    if (!matchedCollection) {
      // Create new collection
      const handle = pType.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      console.log(`Collection "${pType}" does not exist. Creating it with handle "${handle}"...`);
      
      const { data: newCol, error: insertErr } = await supabase
        .from('collections')
        .insert({
          title: pType,
          handle: handle,
          body_html: `<p>Exquisite selection of handcrafted ${pType} sarees.</p>`
        })
        .select()
        .single();

      if (insertErr) {
        console.error(`Failed to create collection "${pType}":`, insertErr.message);
        continue;
      }

      console.log(`Created collection: ID ${newCol.id} for "${pType}"`);
      matchedCollection = newCol;
      // Add to local collections array for subsequent products
      collections.push(newCol);
    }

    // Update product's collection_id
    console.log(`Updating Product ID ${product.id} to Collection ID ${matchedCollection.id} ("${matchedCollection.title}")...`);
    const { error: updateErr } = await supabase
      .from('products')
      .update({ collection_id: matchedCollection.id })
      .eq('id', product.id);

    if (updateErr) {
      console.error(`Failed to update Product ID ${product.id}:`, updateErr.message);
    } else {
      console.log(`Successfully updated Product ID ${product.id}.`);
    }
  }

  console.log("Database fix operation completed.");
}

fixProductCollections();
