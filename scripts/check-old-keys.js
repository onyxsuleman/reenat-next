const { createClient } = require('@supabase/supabase-js');

async function checkOldKeys() {
  const db1_url = 'https://utqweirxeimfolchyskv.supabase.co';
  const db1_key = 'sb_publishable_6XCmyw3Zyi_xuno3lC0_Dw_yvHZgwjM';

  const supabaseOld = createClient(db1_url, db1_key);
  const { data, error } = await supabaseOld.from('products').select('id, name');
  if (error) {
    console.error(error);
  } else {
    console.log("Old DB Products:", data);
  }
}

checkOldKeys();
