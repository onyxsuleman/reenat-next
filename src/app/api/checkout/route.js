import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../utils/supabaseServer';
import { pushOrderToShiprocket } from '../../../utils/shiprocketApi';
import { sendMetaCapiEvent } from '../../../utils/metaPixel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      fullName, 
      email, 
      phone, 
      address, 
      city,
      state,
      pincode,
      cart, 
      promoCode, 
      paymentMethod 
    } = body;

    const resolvedCity = (city || body.shippingCity || body.shipping_city || '').trim();
    const resolvedState = (state || body.shippingState || body.shipping_state || '').trim();
    const resolvedPincode = (pincode || body.shippingPincode || body.shipping_pincode || '').trim();
    const resolvedAddress = (address || body.shippingAddress || body.shipping_line1 || '').trim();
    const resolvedFullName = (fullName || body.name || '').trim();
    const resolvedEmail = (email || '').trim();
    const resolvedPhone = (phone || '').trim();

    // 1. Strict Field Validation (Full shipping address with city, state, and pincode is required)
    if (
      !resolvedFullName || 
      !resolvedEmail || 
      !resolvedPhone || 
      !resolvedAddress || 
      !resolvedCity || 
      !resolvedState || 
      !resolvedPincode || 
      !cart || 
      !Array.isArray(cart) || 
      cart.length === 0
    ) {
      return NextResponse.json({ 
        error: 'Missing or invalid checkout fields. Full address including City, State, and Pincode is required.' 
      }, { status: 400 });
    }

    // 3. Connect to Supabase
    const supabase = getSupabaseServerClient();

    // 4. Server-side Validation of Pricing and Stock levels
    let subtotal = 0;
    const verifiedOrderItems = [];
    const stockUpdates = [];

    for (const item of cart) {
      if (!item.id || String(item.id).startsWith('temp-')) {
        // Handle temp/mock products locally
        const mockPrice = Number(item.price) || 0;
        const qty = Number(item.qty) || 1;
        subtotal += mockPrice * qty;
        verifiedOrderItems.push({
          id: item.id,
          name: item.name,
          price: mockPrice,
          qty: qty,
          image: item.image,
          color: item.color || '',
          skuId: item.skuId || item.styleId || ''
        });
        continue;
      }

      let product = null;
      let isFallback = false;

      // Fetch the product from Supabase to guarantee actual price and stock
      const { data: dbProduct, error: fetchErr } = await supabase
        .from('products')
        .select('id, name, price, stock_qty, image, styleid, catalog_id')
        .eq('id', item.id)
        .single();

      if (fetchErr || !dbProduct) {
        // Fallback: product not found in database — use cart-provided data to allow checkout
        console.warn(`Product ID ${item.id} not found in database; using cart fallback for checkout.`);
        product = {
          id: item.id,
          name: item.name,
          price: Number(item.price) || 949,
          stock_qty: 50,
          image: item.image,
          styleid: item.skuId || item.styleId || item.styleid || ''
        };
        isFallback = true;
      } else {
        product = dbProduct;
      }

      const qty = Number(item.qty) || 1;
      const dbStock = Number(product.stock_qty) !== undefined ? Number(product.stock_qty) : 10;
      
      // Stock verification
      if (dbStock < qty) {
        return NextResponse.json({ error: `Insufficient stock for product '${product.name}'. Available: ${dbStock}` }, { status: 400 });
      }

      const dbPrice = Number(product.price);
      subtotal += dbPrice * qty;

      verifiedOrderItems.push({
        id: product.id,
        name: product.name,
        price: dbPrice,
        qty: qty,
        image: product.image,
        color: item.color || '',
        skuId: product.styleid || ''
      });

      // Prepare stock update (only if not resolved via fallback)
      if (!isFallback) {
        stockUpdates.push({
          id: product.id,
          new_stock: Math.max(0, dbStock - qty)
        });
      }
    }

    // 5. Promo Discount Code Validation
    let discountRate = 0;
    if (promoCode && promoCode.trim().toUpperCase() === 'WELCOME10') {
      discountRate = 0.10;
    }
    const discountAmount = subtotal * discountRate;

    // 6. Tax and Total Calculations
    const taxRate = 0.08; // 8% sales tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax - discountAmount;

    // 7. Deduplication check: Prevent duplicate orders within a short window.
    // Deliberately NOT matching on total/quantity — a duplicate caused by a
    // differing cart state (retry, double-submit, fallback firing alongside
    // a successful Fastrr order) will usually have a DIFFERENT total, which
    // is exactly the case this check needs to catch, not exclude.
    const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();
    const roundedTotal = Math.round(total);
    const { data: existingLocalOrders } = await supabase
      .from('orders')
      .select('id, created_at, total, order_status, shiprocket_order_id')
      .eq('phone', phone.trim())
      .gte('created_at', twoMinutesAgo)
      .limit(1);

    let order = null;
    let isDuplicate = false;

    if (existingLocalOrders && existingLocalOrders.length > 0) {
      isDuplicate = true;
      console.warn(`Duplicate checkout attempt detected for phone ${phone.trim()} within 2 minutes (existing Order #${existingLocalOrders[0].id}, total ₹${existingLocalOrders[0].total}). Skipping new order creation and re-push to Shiprocket.`);
      const { data: fetchedData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', existingLocalOrders[0].id);
      order = fetchedData;

      // Duplicate: return the existing order immediately, skip stock
      // decrement, skip Meta CAPI, and — critically — skip the Shiprocket
      // push below, since that existing order was already pushed once.
      const createdOrder = order && order[0] ? order[0] : null;
      return NextResponse.json({ success: true, order: createdOrder, duplicate: true });
    } else {
      const fullCombinedAddress = `${resolvedAddress}, ${resolvedCity}, ${resolvedState} - ${resolvedPincode}`.replace(/\s+/g, ' ').trim();
      const paymentStatus = paymentMethod === 'Pay Online' ? 'paid' : 'pending';
      const { data: newOrder, error: insertErr } = await supabase
        .from('orders')
        .insert({
          customer_name: resolvedFullName,
          email: resolvedEmail,
          phone: resolvedPhone,
          address: fullCombinedAddress,
          shipping_line1: resolvedAddress,
          shipping_city: resolvedCity,
          shipping_state: resolvedState,
          shipping_pincode: resolvedPincode,
          shipping_country: 'India',
          subtotal: Math.round(subtotal),
          tax: Math.round(tax),
          discount: Math.round(discountAmount),
          total: roundedTotal,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          order_status: 'Pending',
          items: verifiedOrderItems
        })
        .select();

      if (insertErr) {
        console.error("Database order insertion failed:", insertErr.message, insertErr.details, insertErr.hint);
        return NextResponse.json({ error: `Order insert failed: ${insertErr.message}` }, { status: 500 });
      }
      order = newOrder;
    }

    // 8. Decrement Stock Levels
    for (const update of stockUpdates) {
      const { error: stockErr } = await supabase
        .from('products')
        .update({ stock_qty: update.new_stock })
        .eq('id', update.id);
      
      if (stockErr) {
        // Log stock decrement failures but don't crash checkout
        console.error(`Failed to update stock quantity for product ID ${update.id}:`, stockErr.message);
      }
    }

    // 9. Push order to Shiprocket Shipping Dashboard via Adhoc API
    if (order && order[0]) {
      pushOrderToShiprocket(order[0]).catch(err => {
        console.error('Background Shiprocket order push error in direct checkout:', err);
      });
    }

    const createdOrder = order && order[0] ? order[0] : null;
    const eventId = createdOrder ? `purchase_${createdOrder.id}` : `purchase_${Date.now()}`;
    const addPaymentEventId = createdOrder ? `add_payment_${createdOrder.id}` : `add_payment_${Date.now()}`;

    // 10. Send Meta Conversions API (CAPI) Purchase and AddPaymentInfo Events with event_id deduplication keys
    if (createdOrder) {
      const clientIpAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null;
      const clientUserAgent = request.headers.get('user-agent') || (body.browserMeta?.user_agent) || null;
      const fbp = body.browserMeta?.fbp || request.cookies.get('_fbp')?.value || null;
      const fbc = body.browserMeta?.fbc || request.cookies.get('_fbc')?.value || null;

      // CAPI Purchase
      sendMetaCapiEvent({
        eventName: 'Purchase',
        eventId: eventId,
        email: resolvedEmail,
        phone: resolvedPhone,
        fullName: resolvedFullName,
        city: resolvedCity,
        state: resolvedState,
        zipcode: resolvedPincode,
        country: 'India',
        value: createdOrder.total || roundedTotal,
        currency: 'INR',
        items: verifiedOrderItems,
        eventSourceUrl: 'https://www.reenattrends.com/cart',
        clientIpAddress: clientIpAddress,
        clientUserAgent: clientUserAgent,
        fbp: fbp,
        fbc: fbc
      }).catch(capiErr => {
        console.warn('Non-blocking Meta CAPI Purchase send warning:', capiErr.message);
      });

      // CAPI AddPaymentInfo
      sendMetaCapiEvent({
        eventName: 'AddPaymentInfo',
        eventId: addPaymentEventId,
        email: resolvedEmail,
        phone: resolvedPhone,
        fullName: resolvedFullName,
        city: resolvedCity,
        state: resolvedState,
        zipcode: resolvedPincode,
        country: 'India',
        value: createdOrder.total || roundedTotal,
        currency: 'INR',
        items: verifiedOrderItems,
        eventSourceUrl: 'https://www.reenattrends.com/cart',
        clientIpAddress: clientIpAddress,
        clientUserAgent: clientUserAgent,
        fbp: fbp,
        fbc: fbc
      }).catch(capiErr => {
        console.warn('Non-blocking Meta CAPI AddPaymentInfo send warning:', capiErr.message);
      });
    }

    return NextResponse.json({ success: true, order: createdOrder, eventId, addPaymentEventId });

  } catch (err) {
    console.error("Checkout route general exception:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
