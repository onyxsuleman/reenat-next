const { getSupabaseServerClient } = require('../src/utils/supabaseServer');

async function main() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('homepage_config').select('*').eq('key', 'catalog_positions');
  console.log('Database catalog_positions row:', JSON.stringify(data, null, 2), 'error:', error);
}

main().catch(console.error);
