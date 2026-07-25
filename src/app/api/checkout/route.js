import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../utils/supabaseServer';
import { pushOrderToShiprocket } from '../../../utils/shiprocketApi';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      fullName, 
      email, 
      phone, 
      address, 
      cart, 
      promoCode, 
      paymentMethod 
    } = body;

    // 1. Basic Field Validation
    if (!fullName || !email || !phone || !address || !cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid checkout fields.' }, { status: 400 });
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

    // 7. Deduplication check: Prevent duplicate orders within 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const roundedTotal = Math.round(total);
    const { data: existingLocalOrders } = await supabase
      .from('orders')
      .select('id, created_at')
      .eq('phone', phone.trim())
      .eq('total', roundedTotal)
      .gte('created_at', oneMinuteAgo)
      .limit(1);

    let order = null;

    if (existingLocalOrders && existingLocalOrders.length > 0) {
      console.log(`Duplicate local checkout detected (Order #${existingLocalOrders[0].id}). Returning existing record.`);
      const { data: fetchedData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', existingLocalOrders[0].id);
      order = fetchedData;
    } else {
      const paymentStatus = paymentMethod === 'Pay Online' ? 'paid' : 'pending';
      const { data: newOrder, error: insertErr } = await supabase
        .from('orders')
        .insert({
          customer_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
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

    return NextResponse.json({ success: true, order: order[0] });

  } catch (err) {
    console.error("Checkout route general exception:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
