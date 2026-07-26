import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../utils/supabaseServer';
import { pushOrderToShiprocket } from '../../../../utils/shiprocketApi';

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) {
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
