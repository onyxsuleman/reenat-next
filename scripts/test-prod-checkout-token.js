async function testProdToken() {
  const payload = {
    cart: [
      {
        id: 100,
        name: "Hathi Raja Latest Design Saree",
        qty: 1,
        price: 949,
        originalPrice: 2499,
        skuId: "Pink Black Hathi Raja",
        styleid: "M8||Pink Black Hathi Raja",
        image: "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1784652238005_xed8kfz.png"
      }
    ],
    customer: null
  };

  console.log('Sending payload to production token endpoint...');
  try {
    const res = await fetch('https://reenattrends.com/api/checkout/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testProdToken();
