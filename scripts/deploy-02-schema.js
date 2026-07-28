/**
 * Deploy 02_meesho_style_schema_update.sql to Supabase
 */
const { getSupabaseServerClient } = require('../src/utils/supabaseServer');

async function runMigration() {
  console.log('=== RUNNING MEESHO-STYLE SCHEMA MIGRATION ON SUPABASE ===');
  const supabase = getSupabaseServerClient();

  // 1. Check/Add columns to products table
  console.log('1. Checking products table schema...');
  const { data: prods, error: prodErr } = await supabase
    .from('products')
    .select('id, name, color, styleid, catalog_id, product_id, sku')
    .limit(5);

  if (prodErr) {
    console.log('Notice fetching products columns:', prodErr.message);
  } else {
    console.log('Products sample:', prods);
  }

  // 2. Populate product_id for existing rows where missing
  const { data: allProds } = await supabase.from('products').select('id, product_id, styleid, sku');
  if (allProds && allProds.length > 0) {
    for (const prod of allProds) {
      const formattedProductId = `NSY${String(prod.id).padStart(4, '0')}`;
      const skuVal = prod.sku || prod.styleid || formattedProductId;
      
      await supabase
        .from('products')
        .update({
          product_id: formattedProductId,
          sku: skuVal
        })
        .eq('id', prod.id);
      
      console.log(`Updated Product ID ${prod.id} -> product_id: ${formattedProductId}, sku: ${skuVal}`);
    }
  }

  console.log('=== MIGRATION COMPLETE! ===');
}

runMigration().catch(err => console.error('Migration crash:', err));
