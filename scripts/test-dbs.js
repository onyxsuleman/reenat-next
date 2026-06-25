const { createClient } = require('@supabase/supabase-js');

async function testDbs() {
  const db1_url = 'https://utqweirxeimfolchyskv.supabase.co';
  const db1_key = 'sb_publishable_6XCmyw3Zyi_xuno3lC0_Dw_yvHZgwjM';

  const db2_url = 'https://eilxtuedgtimrxfvqojv.supabase.co';
  const db2_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHh0dWVkZ3RpbXJ4ZnZxb2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzI3NTQsImV4cCI6MjA5Nzk0ODc1NH0.W656PBpffUxSn-CTpHD7bDef_B5u2WXBdk8y7r9QmdE';

  console.log("Checking DB 1 (fallback):", db1_url);
  try {
    const supabase1 = createClient(db1_url, db1_key);
    const { data: p1, error: e1 } = await supabase1.from('products').select('name');
    if (e1) {
      console.log("DB 1 Error:", e1.message);
    } else {
      console.log(`DB 1 returned ${p1.length} items:`, p1.map(p => p.name));
    }
  } catch (err) {
    console.log("DB 1 Exception:", err.message);
  }

  console.log("\nChecking DB 2 (.env.local):", db2_url);
  try {
    const supabase2 = createClient(db2_url, db2_key);
    const { data: p2, error: e2 } = await supabase2.from('products').select('name');
    if (e2) {
      console.log("DB 2 Error:", e2.message);
    } else {
      console.log(`DB 2 returned ${p2.length} items:`, p2.map(p => p.name));
    }
  } catch (err) {
    console.log("DB 2 Exception:", err.message);
  }
}

testDbs();
