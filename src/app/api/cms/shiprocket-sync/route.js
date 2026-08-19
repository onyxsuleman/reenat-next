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

    // Fetch from unified orders table with joins
    const { data: orderData } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        addresses:order_addresses(*)
      `)
      .or(`id.eq.${orderId},fastrr_order_id.eq.${orderId},shiprocket_order_id.eq.${orderId},legacy_order_ref.eq.${orderId}`)
      .maybeSingle();

    let order = null;

    if (orderData) {
      const shipAddr = (orderData.addresses || [])[0] || {};
      const fullAddress = `${shipAddr.address_line1 || ''} ${shipAddr.address_line2 || ''}, ${shipAddr.city || ''}, ${shipAddr.state || ''} - ${shipAddr.pincode || ''}`.replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();

      order = {
        id: orderData.legacy_order_ref || orderData.id,
        uuid: orderData.id,
        customer_name: orderData.customer_name,
        email: orderData.customer_email,
        phone: orderData.customer_phone,
        address: fullAddress,
        total: orderData.total_amount,
        payment_method: String(orderData.payment_method).toUpperCase() === 'PREPAID' ? 'Prepaid' : 'COD',
        items: (orderData.items || []).map(i => ({
          id: i.product_id || i.id,
          name: i.name_snapshot,
          qty: i.quantity,
          price: Number(i.unit_price || 0),
          color: i.color_snapshot || '',
          skuId: i.sku_snapshot || 'N/A'
        }))
      };
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
