const { createClient } = require('@supabase/supabase-js');

const projects = [
  {
    name: 'Current Env URL (Kong)',
    url: 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io',
    key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo'
  },
  {
    name: 'Official Cloud URL (eilxtuedgtimrxfvqojv)',
    url: 'https://eilxtuedgtimrxfvqojv.supabase.co',
    key: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo'
  }
];

async function check() {
  for (const proj of projects) {
    console.log(`\n=== Testing ${proj.name} (${proj.url}) ===`);
    try {
      const client = createClient(proj.url, proj.key);
      const { data, error } = await client.from('orders').select('id, customer_name').limit(3);
      if (error) {
        console.log(`❌ Error: ${error.message}`);
      } else {
        console.log(`✅ Success! Found ${data.length} orders in 'orders' table.`);
        console.log('Sample:', data);
      }
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }
}

check();
