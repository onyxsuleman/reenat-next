const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllProducts() {
  console.log("Deleting all products from Supabase...");
  // Delete all rows from 'products' table
  const { data, error } = await supabase
    .from('products')
    .delete()
    .neq('id', 0);

  if (error) {
    console.error("Error deleting products:", error);
  } else {
    console.log("All products successfully deleted from database!");
  }
}

deleteAllProducts();
