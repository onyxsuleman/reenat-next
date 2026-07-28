const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
  console.log('Testing REST OpenAPI spec...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (res.ok) {
    const spec = await res.json();
    console.log('OpenAPI Title:', spec.info ? spec.info.title : 'N/A');
    console.log('Definitions/Tables in DB schema:', Object.keys(spec.definitions || {}));
  } else {
    console.log('OpenAPI spec fetch failed:', res.status);
  }
}

inspect();
