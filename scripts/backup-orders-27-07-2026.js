/**
 * Backup Script: Create secure snapshot of current 'orders' table
 * Date Label: 27/07/2026
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function main() {
  console.log('=== STARTING SECURE ORDERS BACKUP (27/07/2026) ===');
  
  // 1. Fetch all orders from current orders table
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=id.asc`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch orders for backup: ${res.status} ${await res.text()}`);
  }
  const orders = await res.json();
  console.log(`Fetched ${orders.length} orders from live database.`);

  // 2. Save local backup file
  const backupFilePath = path.join(__dirname, 'orders_backup_27_07_2026.json');
  fs.writeFileSync(backupFilePath, JSON.stringify(orders, null, 2), 'utf8');
  console.log(`✅ Local backup file saved to: ${backupFilePath}`);
  console.log(`Backup completed successfully! ${orders.length} orders safely backed up.`);
}

main().catch(err => {
  console.error('❌ Backup Failed:', err);
  process.exit(1);
});
