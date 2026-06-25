const { createClient } = require('@supabase/supabase-js');

async function checkNewKeys() {
  const db2_url = 'https://eilxtuedgtimrxfvqojv.supabase.co';
  const db2_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHh0dWVkZ3RpbXJ4ZnZxb2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzI3NTQsImV4cCI6MjA5Nzk0ODc1NH0.W656PBpffUxSn-CTpHD7bDef_B5u2WXBdk8y7r9QmdE';

  const supabaseNew = createClient(db2_url, db2_key);
  const { data, error } = await supabaseNew.from('products').select('id, name');
  if (error) {
    console.error(error);
  } else {
    console.log("New DB Products:", data);
  }
}

checkNewKeys();
