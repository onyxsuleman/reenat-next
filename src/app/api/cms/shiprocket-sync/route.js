import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../utils/supabaseServer';
import { pushOrderToShiprocket } from '../../../../utils/shiprocketApi';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // 1. Try fetching from legacy orders table first
    let { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    // 2. If not found, search checkout_orders by UUID or legacy_id
    if (!order) {
      const { data: normOrder } = await supabase
        .from('checkout_orders')
        .select(`
          *,
          items:checkout_order_items(*),
          addresses:checkout_order_addresses(*)
        `)
        .or(`id.eq.${orderId},legacy_id.eq.${orderId}`)
        .maybeSingle();

      if (normOrder) {
        const shipAddr = (normOrder.addresses || [])[0] || {};
        const fullAddress = `${shipAddr.address_line1 || ''} ${shipAddr.address_line2 || ''}, ${shipAddr.city || ''}, ${shipAddr.state || ''} - ${shipAddr.pincode || ''}`.replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();

        order = {
          id: normOrder.legacy_id || normOrder.id,
          customer_name: normOrder.customer_name,
          email: normOrder.customer_email,
          phone: normOrder.customer_phone,
          address: fullAddress,
          total: normOrder.total_amount,
          payment_method: String(normOrder.payment_method).toUpperCase() === 'PREPAID' ? 'Prepaid' : 'COD',
          items: (normOrder.items || []).map(i => ({
            id: i.product_id || i.id,
            name: i.product_name,
            qty: i.quantity,
            price: Number(i.unit_price || 0),
            image: i.image_url,
            color: i.color || '',
            skuId: i.sku || 'N/A'
          }))
        };
      }
    }

    if (!order) {
      return NextResponse.json({ error: `Order #${orderId} not found in database.` }, { status: 404 });
    }

    console.log(`CMS Manual Push to Shiprocket for Order #${orderId}...`);
    const result = await pushOrderToShiprocket(order);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Order RT-${orderId} successfully pushed to Shiprocket!`,
        shiprocket_order_id: result.shiprocket_order_id,
        shipment_id: result.shipment_id,
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to push order to Shiprocket'
      }, { status: 500 });
    }
  } catch (err) {
    console.error('CMS Shiprocket sync exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
