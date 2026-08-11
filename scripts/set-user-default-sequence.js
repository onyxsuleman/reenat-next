const { createClient } = require('@supabase/supabase-js');
const url = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';
const supabase = createClient(url, key);

const defaultPositions = [
  { position: 1, catalogId: 'M1' },
  { position: 2, catalogId: 'M2' },
  { position: 3, catalogId: 'M3' },
  { position: 4, catalogId: 'M4' },
  { position: 5, catalogId: 'M5' },
  { position: 6, catalogId: 'M6' },
  { position: 7, catalogId: 'M7' },
  { position: 8, catalogId: 'M8' },
  { position: 9, catalogId: 'M9' },
  { position: 10, catalogId: '' },
  { position: 11, catalogId: '' },
  { position: 12, catalogId: '' }
];

async function setUserDefaultSequence() {
  console.log("Restoring catalog sequence to default (M1, M2, M3, M4, M5, M6, M7, M8, M9) in Supabase...");
  const { data, error } = await supabase
    .from('homepage_config')
    .upsert({
      key: 'catalog_positions',
      value: defaultPositions,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' })
    .select();

  if (error) {
    console.error("Error setting default sequence:", error);
  } else {
    console.log("✅ Successfully updated Supabase DB to default sequence:", JSON.stringify(data, null, 2));
  }
}

setUserDefaultSequence();
