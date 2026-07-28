const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function testInsert() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("Connecting to:", url);
  console.log("Using key starting with:", key?.substring(0, 15));

  const supabase = createClient(url, key);

  // Attempt to insert a test product
  const testProduct = {
    name: "Test Saree " + Date.now(),
    price: 949,
    originalprice: 2499,
    type: "Silk",
    origin: "India",
    desc: "Test description",
    gst: "5",
    hsn: "520811",
    weight: 450,
    styleid: "M99||Pink Black HR 1",
    catalog_id: "M99",
    blouselen: "0.8 m",
    sareelen: "5.5 m",
    blousetype: "Zari Woven",
    blousecolor: "Baby Pink",
    color: "Baby Pink",
    transparency: "No",
    qty: "Single",
    fabric: "Cotton Silk",
    border: "Zari",
    occasion: "Traditional",
    loom: "Handloom",
    brand: "REENAT TRENDS",
    image: "https://example.com/test-image.jpg",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
    image6: "",
    linked_to: "",
    rating: 4.5,
    video_url: "",
    stock_qty: 10
  };

  console.log("Testing select using service key...");
  const { data: selData, error: selError } = await supabase.from('products').select('id').limit(1);
  if (selError) {
    console.error("Select with service key FAILED:", selError.message);
  } else {
    console.log("Select with service key SUCCEEDED! Rows found:", selData.length);
  }

  console.log("Inserting test product...");
  const { data, error } = await supabase
    .from('products')
    .insert(testProduct)
    .select();

  if (error) {
    console.error("Insert failed!");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Details:", error.details);
    console.error("Hint:", error.hint);
  } else {
    console.log("Insert SUCCEEDED!", data);
    // Cleanup
    const { error: delError } = await supabase
      .from('products')
      .delete()
      .eq('id', data[0].id);
    if (delError) {
      console.error("Cleanup failed:", delError.message);
    } else {
      console.log("Cleanup succeeded.");
    }
  }
}

testInsert();
