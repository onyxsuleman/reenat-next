const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function main() {
  console.log('=== Initializing homepage_catalog_positions in Supabase ===');

  const sqlStatement = `
    CREATE TABLE IF NOT EXISTS homepage_catalog_positions (
        position INT PRIMARY KEY CHECK (position >= 1 AND position <= 12),
        catalog_id TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // 1. Try creating table via RPC exec_sql
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: sqlStatement })
    });
    console.log('Exec SQL status:', res.status, await res.text());
  } catch (e) {
    console.warn('RPC exec_sql notice:', e.message);
  }

  // 2. Seed default 12 slots into homepage_catalog_positions
  const defaultPositions = [
    { position: 1, catalog_id: 'M4' },
    { position: 2, catalog_id: 'M7' },
    { position: 3, catalog_id: 'M2' },
    { position: 4, catalog_id: 'M5' },
    { position: 5, catalog_id: 'M3' },
    { position: 6, catalog_id: 'M9' },
    { position: 7, catalog_id: 'M1' },
    { position: 8, catalog_id: 'M6' },
    { position: 9, catalog_id: 'M8' },
    { position: 10, catalog_id: 'M10' },
    { position: 11, catalog_id: 'M11' },
    { position: 12, catalog_id: 'M12' }
  ];

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/homepage_catalog_positions`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(defaultPositions)
    });
    const result = await res.json();
    console.log('✅ homepage_catalog_positions seeded successfully:', result);
  } catch (err) {
    console.error('Seeding error:', err.message);
  }
}

main().catch(console.error);
