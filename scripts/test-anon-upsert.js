const { createClient } = require('@supabase/supabase-js');
const url = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const anonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoiYW5vbiJ9.YMlFaI6nW1eowbtWR4HKtB0iM10OalY0aVK0OiX0Lbg';
const supabase = createClient(url, anonKey);

async function testAnonUpsert() {
  const testVal = [
    { position: 1, catalogId: 'M1' },
    { position: 2, catalogId: 'M2' }
  ];

  const { data, error } = await supabase
    .from('homepage_config')
    .upsert({ key: 'catalog_positions', value: testVal, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select();

  console.log("Anon key upsert result:", { data, error });
}

testAnonUpsert();
