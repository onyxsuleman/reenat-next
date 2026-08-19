import { createClient } from '@supabase/supabase-js';

const urlsToTest = [
  'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io:8000',
  'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io',
  'http://200.97.166.100:8000'
];

const anonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoiYW5vbiJ9.YMlFaI6nW1eowbtWR4HKtB0iM10OalY0aVK0OiX0Lbg';
const serviceKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

async function testUrl(url, key, label) {
  console.log(`\nTesting ${label} with URL: ${url}`);
  try {
    const supabase = createClient(url, key);
    const { data, error, count } = await supabase.from('products').select('*', { count: 'exact' }).limit(3);
    if (error) {
      console.log(`❌ Query Error on ${url}:`, error.message, error.details || '');
    } else {
      console.log(`✅ SUCCESS on ${url}! Total products count in DB:`, count, 'Sample data length:', data?.length);
      if (data && data.length > 0) {
        console.log('Sample product:', data[0].name, '| ID:', data[0].id, '| Catalog:', data[0].catalog_id);
      }
      return true;
    }
  } catch (err) {
    console.log(`❌ Connection Exception on ${url}:`, err.message);
  }
  return false;
}

async function run() {
  for (const url of urlsToTest) {
    const ok = await testUrl(url, anonKey, 'Anon Key');
    if (ok) {
      await testUrl(url, serviceKey, 'Service Role Key');
      break;
    }
  }
}

run();
