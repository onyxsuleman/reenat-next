import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const supabase = createClient(url, key);

const tables = [
  'products',
  'orders',
  'checkout_orders',
  'checkout_order_items',
  'checkout_order_addresses',
  'checkout_shipments',
  'homepage_config',
  'collections',
  'webhook_raw_logs'
];

async function backupDatabase() {
  const timestamp = new Date().toISOString().split('T')[0];
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`📦 Starting full database backup from ${url}...`);
  const fullBackup = {
    metadata: {
      exportedAt: new Date().toISOString(),
      sourceUrl: url,
      tables: {}
    },
    data: {}
  };

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.warn(`⚠️ Table [${table}]: Skipped (${error.message})`);
        fullBackup.metadata.tables[table] = { status: 'error', error: error.message };
      } else {
        const rows = data || [];
        fullBackup.metadata.tables[table] = { status: 'ok', count: rows.length };
        fullBackup.data[table] = rows;

        // Also save individual JSON file for easy local development / mock importing
        const tableFilePath = path.join(backupDir, `${table}.json`);
        fs.writeFileSync(tableFilePath, JSON.stringify(rows, null, 2), 'utf-8');
        console.log(`✅ Table [${table}]: Exported ${rows.length} rows -> backups/${table}.json`);
      }
    } catch (e) {
      console.error(`❌ Table [${table}]: Exception ${e.message}`);
    }
  }

  // Save dated full snapshot
  const fullBackupPath = path.join(backupDir, `full_db_backup_${timestamp}.json`);
  const latestBackupPath = path.join(backupDir, 'full_db_backup_latest.json');

  fs.writeFileSync(fullBackupPath, JSON.stringify(fullBackup, null, 2), 'utf-8');
  fs.writeFileSync(latestBackupPath, JSON.stringify(fullBackup, null, 2), 'utf-8');

  console.log(`\n🎉 Full database backup completed successfully!`);
  console.log(`📁 Saved to: ${fullBackupPath}`);
  console.log(`📁 Saved to: ${latestBackupPath}`);
}

backupDatabase();
