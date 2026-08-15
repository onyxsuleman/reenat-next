import { NextResponse } from 'next/server';
import { sendMetaCapiEvent } from '../../../../utils/metaPixel';

/**
 * POST /api/pixel/view-content
 * Server-side Conversions API counterpart for the client-side ViewContent pixel event.
 * Called from the product page immediately after the product data has loaded and
 * the client-side fbq('track', 'ViewContent', ..., { eventID }) has fired.
 * The matching event_id ensures Meta deduplicates the browser and server events.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, productId, productName, price } = body;

    if (!eventId || !productId) {
      return NextResponse.json({ error: 'Missing required fields: eventId or productId.' }, { status: 400 });
    }

    const clientIpAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const clientUserAgent = request.headers.get('user-agent') || null;

    const result = await sendMetaCapiEvent({
      eventName: 'ViewContent',
      eventId,
      value: Number(price || 0),
      currency: 'INR',
      items: [{ id: String(productId), quantity: 1, item_price: Number(price || 0) }],
      eventSourceUrl: `https://www.reenattrends.com/product?id=${productId}`,
      clientIpAddress,
      clientUserAgent,
    });

    return NextResponse.json({ success: true, capiResult: result });
  } catch (err) {
    console.error('ViewContent CAPI route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
