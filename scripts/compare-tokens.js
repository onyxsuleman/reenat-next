async function testToken(id, styleid, name) {
  const payload = {
    cart: [
      {
        id: id,
        name: name,
        qty: 1,
        price: 949,
        originalPrice: 2499,
        skuId: name,
        styleid: styleid,
        image: "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168166519_7otfupt.png"
      }
    ],
    customer: null
  };

  try {
    const res = await fetch('https://reenattrends.com/api/checkout/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { status: res.status, data };
  } catch (err) {
    return { error: err.message };
  }
}

async function runCompare() {
  console.log('Testing token for working ID 42 (old)...');
  const oldRes = await testToken(42, "M1||Mango Green Pai X1", "Premium Saree");
  console.log('Old Res:', JSON.stringify(oldRes, null, 2));

  console.log('\nTesting token for failing ID 100 (new)...');
  const newRes = await testToken(100, "M8||Pink Black Hathi Raja", "Hathi Raja Saree");
  console.log('New Res:', JSON.stringify(newRes, null, 2));
}

runCompare();
