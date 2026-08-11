const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to load env variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}

async function backup() {
  loadEnv();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in .env.local");
    process.exit(1);
  }

  console.log("Connecting to Supabase at:", supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 1. Products
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (prodErr) throw prodErr;

    const prodFile = path.join(backupDir, `products_backup_${today}.json`);
    fs.writeFileSync(prodFile, JSON.stringify(products, null, 2), 'utf8');
    console.log(`✅ Products backup created: ${prodFile} (${products.length} items)`);

    // 2. Orders
    const { data: orders, error: ordErr } = await supabase
      .from('orders')
      .select('*')
      .order('id', { ascending: true });

    if (!ordErr && orders) {
      const ordFile = path.join(backupDir, `orders_backup_${today}.json`);
      fs.writeFileSync(ordFile, JSON.stringify(orders, null, 2), 'utf8');
      console.log(`✅ Orders backup created: ${ordFile} (${orders.length} items)`);
    }

    // 3. Catalog Positions (if table exists)
    const { data: positions, error: posErr } = await supabase
      .from('catalog_positions')
      .select('*');

    if (!posErr && positions) {
      const posFile = path.join(backupDir, `catalog_positions_backup_${today}.json`);
      fs.writeFileSync(posFile, JSON.stringify(positions, null, 2), 'utf8');
      console.log(`✅ Catalog positions backup created: ${posFile} (${positions.length} items)`);
    }

    // 4. Combined Full DB Backup
    const fullBackup = {
      timestamp: new Date().toISOString(),
      date: today,
      products: products || [],
      orders: orders || [],
      catalog_positions: positions || []
    };
    const fullFile = path.join(backupDir, `full_db_backup_${today}.json`);
    fs.writeFileSync(fullFile, JSON.stringify(fullBackup, null, 2), 'utf8');
    console.log(`✅ Full DB snapshot created: ${fullFile}`);

    console.log("🎉 Complete database backup finished successfully!");
  } catch (err) {
    console.error("Backup failed:", err.message);
    process.exit(1);
  }
}

backup();
