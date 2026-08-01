const { createClient } = require('@supabase/supabase-js');

const url = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const supabase = createClient(url, key);

async function main() {
  console.log('=== Checking Catalog M2 products ===');
  const { data: m2Products, error } = await supabase
    .from('products')
    .select('*')
    .ilike('catalog_id', 'M2');

  console.log('Current M2 products count:', (m2Products || []).length);

  // Restore Product ID 56 to Tussar R Brown
  const { data: updated56, error: err56 } = await supabase
    .from('products')
    .update({
      color: 'Tussar',
      styleid: 'M2||Tussar R Brown Pai X1',
      name: 'Paithani Cotton Silk Saree with contrast blouse piece',
      stock_qty: 9,
      qty: 'Single'
    })
    .eq('id', 56)
    .select();

  console.log('✅ Restored product 56 to Tussar R Brown:', updated56);

  // Insert Black Gold Pai X1 as a brand new variation under Catalog M2
  const { data: insertedBlack, error: errBlack } = await supabase
    .from('products')
    .insert({
      catalog_id: 'M2',
      name: 'Paithani Cotton Silk Saree with contrast blouse piece',
      price: 949,
      originalprice: 2499,
      type: 'Silk',
      origin: 'India',
      desc: 'Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend.',
      gst: '5',
      hsn: '520811',
      weight: 450,
      styleid: 'M2||Black Gold Pai X1',
      blouselen: '0.8',
      sareelen: '5.5',
      blousetype: 'Contrast Blouse',
      blousecolor: 'Golden',
      color: 'Black Gold',
      transparency: 'No',
      qty: 'Single',
      fabric: 'Cotton Silk',
      border: 'Zari',
      occasion: 'Traditional',
      loom: 'Handloom',
      brand: 'REENAT TRENDS',
      image: m2Products && m2Products[0] ? m2Products[0].image : '',
      stock_qty: 10
    })
    .select();

  console.log('✅ Inserted Black Gold as new variation:', insertedBlack);
}

main().catch(console.error);
