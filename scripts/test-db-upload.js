const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function testUpload() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("Supabase URL:", url);
  console.log("Using Anon Key Prefix:", key?.substring(0, 15));

  const supabase = createClient(url, key);

  console.log("Testing inserting a product using Anon Key...");
  const { data, error } = await supabase.from('products').insert({
    name: "Test Anon Insert Saree",
    price: 999,
    image: "https://example.com/test.jpg"
  }).select();

  if (error) {
    console.error("Anon insert FAILED:", error.message);
    console.error("Details:", error);
  } else {
    console.log("Anon insert SUCCEEDED!", data);
    // Cleanup if succeeded
    await supabase.from('products').delete().eq('id', data[0].id);
  }
}

testUpload();
