const { createClient } = require('@supabase/supabase-js');
const url = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';
const supabase = createClient(url, key);

const p56 = {
  "id": 56,
  "name": "Paithani Cotton Silk Saree with contrast blouse peice ( Tussar Brown ?",
  "type": "Silk",
  "color": "Tussar",
  "price": 949,
  "originalprice": 2499,
  "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276410506_aigxg6y.png",
  "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276416827_rqssvt2.png",
  "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276424156_uciw0s7.png",
  "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276428912_l4y7fzi.png",
  "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276443411_hbwetan.png",
  "image6": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276475693_6hz9xl6.png",
  "video_url": "",
  "stock_qty": 9,
  "origin": "India",
  "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
  "gst": "5",
  "hsn": "520811",
  "weight": 450,
  "styleid": "M2||Tussar R Brown Pai X1",
  "blouselen": "0.8",
  "sareelen": "5.5",
  "blousetype": "Zari Woven",
  "blousecolor": "Chocolate",
  "transparency": "No",
  "qty": "Single",
  "fabric": "Cotton Silk",
  "border": "Zari",
  "occasion": "Traditional",
  "loom": "Handloom",
  "brand": "REENAT TRENDS",
  "linked_to": "",
  "catalog_id": "M2",
  "rating": 4.5,
  "collection_id": 3
};

const p60 = {
  "id": 60,
  "name": "Paithani Cotton Silk Saree with contrast blouse peice / Color Red and Black ",
  "type": "Silk",
  "color": "Red",
  "price": 949,
  "originalprice": 2499,
  "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783439884391_960y69s.png",
  "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783439890590_xri33fg.png",
  "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783439897937_zaolk6c.png",
  "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783439901882_8084mf9.png",
  "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783439915173_cr26lp4.png",
  "image6": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783439923752_qkl3m46.png",
  "video_url": "",
  "stock_qty": 10,
  "origin": "India",
  "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
  "gst": "5",
  "hsn": "520811",
  "weight": 450,
  "styleid": "M2||Red and Black Pai X1",
  "blouselen": "0.8",
  "sareelen": "5.5",
  "blousetype": "Zari Woven",
  "blousecolor": "black",
  "transparency": "No",
  "qty": "Single",
  "fabric": "Cotton Silk",
  "border": "Zari",
  "occasion": "Traditional",
  "loom": "Handloom",
  "brand": "REENAT TRENDS",
  "linked_to": "",
  "catalog_id": "M2",
  "rating": 4.5,
  "collection_id": 3
};

async function restore() {
  console.log("Restoring product 56 and 60 to Supabase...");
  const { data: d56, error: e56 } = await supabase.from('products').upsert(p56).select();
  if (e56) console.error("Error inserting p56:", e56);
  else console.log("✅ Successfully restored Product 56:", d56);

  const { data: d60, error: e60 } = await supabase.from('products').upsert(p60).select();
  if (e60) console.error("Error inserting p60:", e60);
  else console.log("✅ Successfully restored Product 60:", d60);
}

restore();
