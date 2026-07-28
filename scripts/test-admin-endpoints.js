const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

const endpoints = [
  '/pg_meta/v1/query',
  '/rest/v1/rpc/exec_sql',
  '/rest/v1/rpc/query',
  '/sql',
  '/pg/v1/query'
];

async function testEndpoints() {
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${SUPABASE_URL}${ep}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: 'SELECT 1;' })
      });
      console.log(`Endpoint ${ep} status: ${res.status}`);
      if (res.ok) {
        console.log(`✅ ENDPOINT ${ep} IS AVAILABLE! Output:`, await res.text());
      }
    } catch (err) {
      console.log(`Endpoint ${ep} failed:`, err.message);
    }
  }
}

testEndpoints();
