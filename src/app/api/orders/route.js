import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../utils/supabaseServer';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    
    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone parameter is required.' }, { status: 400 });
    }
    
    const supabase = getSupabaseServerClient();
    
    // Query the unified orders table with relational joins
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        addresses:order_addresses(*),
        shipments:order_shipments(*)
      `)
      .order('created_at', { ascending: false });

    const conditions = [];
    if (email) {
      conditions.push(`customer_email.eq.${email.trim()}`);
    }
    if (phone) {
      conditions.push(`customer_phone.eq.${phone.trim()}`);
      const clean = phone.replace(/\D/g, '');
      const tenDigit = clean.length > 10 ? clean.slice(-10) : clean;
      conditions.push(`customer_phone.eq.${tenDigit}`);
      conditions.push(`customer_phone.eq.+91${tenDigit}`);
      conditions.push(`customer_phone.eq.91${tenDigit}`);
    }

    query = query.or(conditions.join(','));
    const { data, error } = await query;

    if (error) {
      console.error("Fetch orders backend error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Map the relational structure into the frontend format
    const formattedOrders = data.map(o => {
      const shipAddr = (o.addresses || [])[0] || {};
      const fullAddress = `${shipAddr.address_line1 || ''} ${shipAddr.address_line2 || ''}, ${shipAddr.city || ''}, ${shipAddr.state || ''} - ${shipAddr.pincode || ''}`.replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();
      const shipment = (o.shipments || [])[0] || {};

      return {
        id: o.shiprocket_order_id || o.fastrr_order_id || o.id,
        uuid: o.id,
        fastrr_order_id: o.fastrr_order_id,
        shiprocket_order_id: o.shiprocket_order_id,
        customer_name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        address: fullAddress,
        shipping_line1: shipAddr.address_line1 || '',
        shipping_line2: shipAddr.address_line2 || '',
        shipping_city: shipAddr.city || '',
        shipping_state: shipAddr.state || '',
        shipping_pincode: shipAddr.pincode || '',
        shipping_country: shipAddr.country || 'India',
        subtotal: Number(o.sub_total || 0),
        tax: 0,
        discount: Number(o.discount_amount || 0),
        total: Number(o.total_amount || 0),
        payment_method: (
          String(o.payment_method || '').toUpperCase().includes('PREPAID') || 
          String(o.payment_method || '').toUpperCase().includes('ONLINE') || 
          String(o.payment_method || '').toUpperCase().includes('UPI') || 
          String(o.payment_method || '').toUpperCase().includes('CARD') || 
          String(o.payment_method || '').toUpperCase().includes('PAYU') || 
          String(o.payment_gateway || '').toLowerCase().includes('payu') ||
          String(o.payment_gateway || '').toLowerCase().includes('razorpay') ||
          String(o.payment_gateway || '').toLowerCase().includes('cashfree') ||
          ['paid', 'captured', 'success', 'successful', 'completed', 'authorized'].includes(String(o.financial_status || '').toLowerCase())
        ) ? 'Prepaid' : 'COD',
        payment_status: o.financial_status || 'pending',
        order_status: o.order_status || 'Pending',
        courier_name: shipment.courier_name || '',
        awb_code: shipment.awb_code || '',
        tracking_url: shipment.tracking_url || '',
        created_at: o.created_at,
        items: (o.items || []).map(i => ({
          id: i.product_id || i.id,
          productId: i.product_id || '',
          name: i.name_snapshot,
          qty: i.quantity,
          price: Number(i.unit_price || 0),
          color: i.color_snapshot || '',
          skuId: i.sku_snapshot || 'N/A'
        }))
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (err) {
    console.error("Fetch orders backend exception:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
