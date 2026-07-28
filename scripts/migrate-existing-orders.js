/**
 * Migration Script: Migrate existing orders from 'orders' table to the new 4-table relational architecture
 */

const SUPABASE_URL = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
const SUPABASE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function main() {
  console.log('=== MIGRATING EXISTING ORDERS TO 4-TABLE ARCHITECTURE ===');

  // 1. Check if checkout_orders table is available
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/checkout_orders?select=id&limit=1`, { headers });
  if (!checkRes.ok) {
    console.error('❌ Table "checkout_orders" does not exist yet. Please execute "scripts/01_create_shiprocket_checkout_schema.sql" in your Supabase SQL Editor first.');
    return;
  }

  // 2. Fetch legacy orders
  const ordersRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=id.asc`, { headers });
  const orders = await ordersRes.json();
  console.log(`Found ${orders.length} legacy orders to migrate.`);

  for (const legacy of orders) {
    console.log(`Migrating Order #${legacy.id} (${legacy.customer_name})...`);

    // Clean payment gateway
    const rawPayment = String(legacy.payment_method || '').toUpperCase();
    const isPrepaid = rawPayment === 'PREPAID' || rawPayment === 'ONLINE' || rawPayment === 'PAYU';
    const paymentMethod = isPrepaid ? 'prepaid' : 'cod';
    const paymentGateway = isPrepaid ? 'payu' : 'cod';

    // Insert main order
    const mainOrderPayload = {
      legacy_id: legacy.id,
      shiprocket_order_id: String(legacy.shiprocket_order_id || `RT-${legacy.id}`),
      fastrr_order_id: `FAST-LEGACY-${legacy.id}`,
      customer_name: legacy.customer_name || 'Customer',
      customer_email: legacy.email || '',
      customer_phone: legacy.phone || '',
      financial_status: legacy.payment_status === 'paid' ? 'paid' : 'pending',
      payment_method: paymentMethod,
      payment_gateway: paymentGateway,
      sub_total: Number(legacy.subtotal || legacy.total || 0),
      tax_amount: Number(legacy.tax || 0),
      discount_amount: Number(legacy.discount || 0),
      total_amount: Number(legacy.total || 0),
      order_status: legacy.order_status || 'Pending',
      created_at: legacy.created_at || new Date().toISOString()
    };

    // Upsert into checkout_orders
    const insertMainRes = await fetch(`${SUPABASE_URL}/rest/v1/checkout_orders`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(mainOrderPayload)
    });

    if (!insertMainRes.ok) {
      console.error(`  ❌ Main order insert failed for #${legacy.id}:`, await insertMainRes.text());
      continue;
    }

    const [newOrder] = await insertMainRes.json();
    const newOrderId = newOrder.id;

    // Migrate Line Items
    const rawItems = legacy.items || [];
    const itemRows = rawItems.map(item => ({
      order_id: newOrderId,
      product_id: typeof item.id === 'number' ? item.id : null,
      sku: item.skuId || item.sku || 'N/A',
      product_name: item.name || 'Saree',
      image_url: item.image || '',
      color: item.color || '',
      unit_price: Number(item.price || 0),
      quantity: Number(item.qty || item.quantity || 1),
      total_price: Number((item.price || 0) * (item.qty || item.quantity || 1))
    }));

    if (itemRows.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/checkout_order_items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(itemRows)
      });
    }

    // Migrate Address
    const addressPayload = {
      order_id: newOrderId,
      address_type: 'shipping',
      full_name: legacy.customer_name || '',
      phone: legacy.phone || '',
      email: legacy.email || '',
      address_line1: legacy.shipping_line1 || legacy.address || '',
      address_line2: legacy.shipping_line2 || '',
      city: legacy.shipping_city || '',
      state: legacy.shipping_state || '',
      pincode: legacy.shipping_pincode || '',
      country: legacy.shipping_country || 'India'
    };

    await fetch(`${SUPABASE_URL}/rest/v1/checkout_order_addresses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(addressPayload)
    });

    // Migrate Shipment Metadata
    const shipmentPayload = {
      order_id: newOrderId,
      shipment_id: legacy.shiprocket_order_id ? `SHP-${legacy.shiprocket_order_id}` : `SHP-${legacy.id}`,
      pickup_location: 'work',
      tracking_status: legacy.order_status === 'Shipped' ? 'IN_TRANSIT' : (legacy.order_status === 'Delivered' ? 'DELIVERED' : 'MANIFESTED')
    };

    await fetch(`${SUPABASE_URL}/rest/v1/checkout_shipments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(shipmentPayload)
    });

    console.log(`  ✅ Order #${legacy.id} successfully migrated to 4-table structure (UUID: ${newOrderId})`);
  }

  console.log('\n=== MIGRATION COMPLETE ===');
}

main().catch(err => console.error('Migration error:', err));
