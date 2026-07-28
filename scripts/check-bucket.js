const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function checkBucket() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use Anon Key first to see if it can read buckets, or Service Role Key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("Connecting to:", url);
  const supabase = createClient(url, key);

  console.log("Listing buckets...");
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Failed to list buckets:", error.message);
  } else {
    console.log("Buckets found:", buckets.map(b => b.name));
  }
}

checkBucket();
