const { createClient } = require('@supabase/supabase-js');
const url = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';
const supabase = createClient(url, key);

async function main() {
  const { data } = await supabase.from('products').select('*');
  console.log("All DB Products Count:", data.length);
  const m2 = data.filter(p => (p.catalog_id && p.catalog_id.toLowerCase() === 'm2') || (p.styleid && p.styleid.startsWith('M2')));
  console.log("M2 Products in DB:", m2);
}
main();
