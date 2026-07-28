const { getSupabaseServerClient } = require('../src/utils/supabaseServer');

async function main() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error selecting from products:', error);
  } else {
    console.log('Sample product columns:', Object.keys(data[0] || {}));
    console.log('Sample product row:', data[0]);
  }
}

main();
