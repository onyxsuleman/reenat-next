const { createClient } = require('@supabase/supabase-js');
const url = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';
const supabase = createClient(url, key);

async function checkConfig() {
  const { data, error } = await supabase.from('homepage_config').select('*').eq('key', 'catalog_positions');
  console.log("Current DB catalog_positions:", JSON.stringify(data, null, 2));
}

checkConfig();
