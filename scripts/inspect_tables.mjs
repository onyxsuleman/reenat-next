import { createClient } from '@supabase/supabase-js';

const url = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoiYW5vbiJ9.YMlFaI6nW1eowbtWR4HKtB0iM10OalY0aVK0OiX0Lbg';
const serviceKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const supabase = createClient(url, serviceKey);

async function inspectDatabase() {
  const tables = ['products', 'orders', 'checkout_orders', 'homepage_config', 'reviews', 'webhook_raw_logs', 'collections'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' }).limit(1);
      if (error) {
        console.log(`Table [${table}]: ❌ ${error.message}`);
      } else {
        console.log(`Table [${table}]: ✅ Found (${count} total rows)`);
      }
    } catch (e) {
      console.log(`Table [${table}]: Exception ${e.message}`);
    }
  }
}

inspectDatabase();
