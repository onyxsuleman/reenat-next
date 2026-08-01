const { getSupabaseServerClient } = require('../src/utils/supabaseServer');

async function main() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('products').select('id, name, catalog_id, styleid, color');
  console.log('Total products in DB:', (data || []).length);
  (data || []).forEach(p => {
    console.log(`ID: ${p.id} | catalog_id: "${p.catalog_id}" | styleid: "${p.styleid}" | color: "${p.color}" | name: "${p.name ? p.name.substring(0, 25) : ''}"`);
  });
}

main().catch(console.error);
