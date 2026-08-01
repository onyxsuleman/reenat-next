const { getSupabaseServerClient } = require('../src/utils/supabaseServer');

async function main() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('homepage_config').select('*');
  console.log('homepage_config rows:', data, 'error:', error);

  const positions = [
    { position: 1, catalogId: 'M4' },
    { position: 2, catalogId: 'M7' },
    { position: 3, catalogId: 'M2' },
    { position: 4, catalogId: 'M5' },
    { position: 5, catalogId: 'M3' },
    { position: 6, catalogId: 'M9' },
    { position: 7, catalogId: 'M1' },
    { position: 8, catalogId: 'M6' },
    { position: 9, catalogId: 'M8' },
    { position: 10, catalogId: 'M10' },
    { position: 11, catalogId: 'M11' },
    { position: 12, catalogId: 'M12' }
  ];

  const { data: upsertData, error: upsertErr } = await supabase
    .from('homepage_config')
    .upsert({ key: 'catalog_positions', value: positions }, { onConflict: 'key' })
    .select();

  console.log('✅ upsert catalog_positions:', upsertData, 'error:', upsertErr);
}

main().catch(console.error);
