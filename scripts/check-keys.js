const { createClient } = require('@supabase/supabase-js');

async function checkKeys() {
  const db1_url = 'https://utqweirxeimfolchyskv.supabase.co';
  const db1_key = 'sb_publishable_6XCmyw3Zyi_xuno3lC0_Dw_yvHZgwjM';

  const supabaseOld = createClient(db1_url, db1_key);
  const { data, error } = await supabaseOld.from('products').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log("Keys in old product:", Object.keys(data[0]));
    console.log("ID of old product:", data[0].id, typeof data[0].id);
  }
}

checkKeys();
