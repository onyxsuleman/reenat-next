const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function testInsert() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("Connecting to:", url);
  console.log("Key starts with:", key?.substring(0, 10));

  const supabase = createClient(url, key);

  const testOrder = {
    customer_name: "Test User",
    email: "test@example.com",
    phone: "9999999999",
    address: "123 Test St",
    subtotal: 1000,
    tax: 80,
    discount: 0,
    total: 1080,
    payment_method: "COD",
    payment_status: "pending",
    order_status: "Pending",
    items: []
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(testOrder)
    .select();

  if (error) {
    console.error("Insert failed!");
    console.error("Message:", error.message);
    console.error("Details:", error.details);
    console.error("Hint:", error.hint);
    console.error("Code:", error.code);
  } else {
    console.log("Insert succeeded!", data);
  }
}

testInsert();
