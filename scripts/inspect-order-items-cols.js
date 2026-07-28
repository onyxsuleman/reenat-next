const { getSupabaseServerClient } = require('../src/utils/supabaseServer');

async function main() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('checkout_order_items').select('*').limit(1);
  if (error) {
    console.error('Error selecting from checkout_order_items:', error);
  } else {
    console.log('Sample checkout_order_items columns:', Object.keys(data[0] || {}));
    if (data.length > 0) {
      console.log('Sample checkout_order_items row:', data[0]);
    }
  }
}

main();
