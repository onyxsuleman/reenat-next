import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServerClient } from '../../../../../utils/supabaseServer';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-api-hmac-sha256') || request.headers.get('X-Api-Hmac-Sha256') || '';

    const merchantSecretKey = process.env.SHIPROCKET_MERCHANT_SECRET_KEY;

    // Cryptographic validation of incoming webhook (if secret is configured)
    if (merchantSecretKey && hmacHeader) {
      const calculatedHmac = crypto
        .createHmac('sha256', merchantSecretKey)
        .update(rawBody)
        .digest('base64');

      if (hmacHeader !== calculatedHmac) {
        console.warn('Webhook signature verification failed. HMAC mismatch.');
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
      }
    } else if (!hmacHeader) {
      console.warn('Incoming webhook missing x-api-hmac-sha256 header. Proceeding with warning.');
    }

    const payload = JSON.parse(rawBody);

    // Extracting details from Shiprocket's order payload.
    // Note: Shiprocket Webhooks have structured JSON models. We support multiple common mappings.
    const shiprocketOrderId = payload.shiprocket_order_id || payload.id;
    const customerName = payload.customer_name || payload.billing_name || (payload.customer ? `${payload.customer.first_name || ''} ${payload.customer.last_name || ''}`.trim() : 'Customer');
    const email = payload.customer_email || payload.email || (payload.customer ? payload.customer.email : '');
    const phone = payload.customer_phone || payload.phone || (payload.customer ? payload.customer.phone : '');

    // Addresses
    const shippingLine1 = payload.shipping_address || payload.shipping_line1 || '';
    const shippingLine2 = payload.shipping_address_2 || payload.shipping_line2 || '';
    const shippingCity = payload.shipping_city || payload.city || '';
    const shippingState = payload.shipping_state || payload.state || '';
    const shippingPincode = String(payload.shipping_pincode || payload.pincode || '');
    const shippingCountry = payload.shipping_country || payload.country || 'India';
    
    // Concatenate full address
    const fullAddress = `${shippingLine1} ${shippingLine2}, ${shippingCity}, ${shippingState} - ${shippingPincode}, ${shippingCountry}`.replace(/\s+/g, ' ').trim();

    // Financials
    const total = Math.round(Number(payload.total_price || payload.total || 0));
    const subtotal = Math.round(Number(payload.subtotal_price || payload.subtotal || total));
    const tax = Math.round(Number(payload.tax_price || payload.tax || 0));
    const discount = Math.round(Number(payload.discount_amount || payload.discount || 0));

    const paymentMethod = payload.payment_method || 'Pay Online';
    const paymentStatus = payload.payment_status || 'paid';
    const orderStatus = payload.order_status || 'Pending';

    // Parse Line items
    const rawItems = payload.items || payload.line_items || [];
    const orderItems = rawItems.map(item => ({
      id: item.id || item.product_id || '',
      name: item.title || item.name || 'Saree',
      qty: Number(item.quantity || item.qty || 1),
      price: Number(item.price || 0),
      image: item.image_url || item.image || '',
      color: item.color || '',
      skuId: item.sku || item.styleid || ''
    }));

    const supabase = getSupabaseServerClient();

    // 1. Insert/Update customer profile if email is present
    if (email) {
      const nameParts = customerName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { error: customerErr } = await supabase
        .from('customers')
        .upsert({
          email: email.trim(),
          phone: phone.trim(),
          first_name: firstName,
          last_name: lastName,
          default_address: fullAddress
        }, { onConflict: 'email' });

      if (customerErr) {
        console.error('Failed to update customer profile in webhook:', customerErr.message);
      }
    }

    // 2. Insert order details in orders database table
    const { data: insertedOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        email: email.trim(),
        phone: phone.trim(),
        address: fullAddress,
        shipping_line1: shippingLine1,
        shipping_line2: shippingLine2,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_pincode: shippingPincode,
        shipping_country: shippingCountry,
        shiprocket_order_id: String(shiprocketOrderId),
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: total,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        order_status: orderStatus,
        items: orderItems
      })
      .select();

    if (orderErr) {
      console.error('Failed to write order from webhook payload:', orderErr.message);
      return NextResponse.json({ error: 'Database order save failed' }, { status: 500 });
    }

    // 3. Decrement stock levels for purchased items
    for (const item of orderItems) {
      if (item.id && !String(item.id).startsWith('temp-')) {
        // Fetch current stock
        const { data: product } = await supabase
          .from('products')
          .select('stock_qty')
          .eq('id', item.id)
          .single();

        if (product) {
          const currentStock = Number(product.stock_qty || 10);
          const newStock = Math.max(0, currentStock - item.qty);

          await supabase
            .from('products')
            .update({ stock_qty: newStock })
            .eq('id', item.id);
        }
      }
    }

    return NextResponse.json({ success: true, order: insertedOrder[0] });
  } catch (err) {
    console.error('Webhook execution crashed:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
