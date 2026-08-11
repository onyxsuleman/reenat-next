const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

const sql = `
  ALTER TABLE IF EXISTS homepage_config DISABLE ROW LEVEL SECURITY;
`;

async function fixRls() {
  console.log("Disabling RLS on homepage_config table...");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: sql })
  });

  console.log("exec_sql response status:", res.status);
  const text = await res.text();
  console.log("exec_sql response text:", text);
}

fixRls();
