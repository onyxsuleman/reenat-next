import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../../utils/supabaseServer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, customerData } = body;

    let finalData = customerData || null;

    // 1. If token is provided, fetch latest customer details directly from Shiprocket Fastrr
    if (token && typeof token === 'string') {
      try {
        const response = await fetch('https://checkout-api.shiprocket.com/api/v1/customer-data/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData && resData.ok && resData.result) {
            finalData = resData.result;
          }
        }
      } catch (fetchErr) {
        console.warn('Fastrr customer-data endpoint query warning:', fetchErr.message);
      }
    }

    if (!finalData) {
      return NextResponse.json(
        { error: 'Customer data token or payload is invalid or expired.' },
        { status: 400 }
      );
    }

    // 2. Extract phone, addresses, email & profile info
    const addr = finalData.address || (Array.isArray(finalData.addresses) ? finalData.addresses[0] : null) || {};
    const rawPhone = String(finalData.phone || addr.phone || '').replace(/\D/g, '');
    const cleanPhoneDigits = rawPhone.length >= 10 ? rawPhone.slice(-10) : rawPhone;
    const formattedPhone = cleanPhoneDigits ? `+91${cleanPhoneDigits}` : '';
    
    const firstName = addr.first_name || addr.firstName || 'Customer';
    const lastName = addr.last_name || addr.lastName || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || `Customer ${cleanPhoneDigits.slice(-4)}`;
    
    const email = addr.email || finalData.email || (cleanPhoneDigits ? `${cleanPhoneDigits}@reenattrends.com` : 'customer@reenattrends.com');

    // 3. Upsert customer record into Supabase
    try {
      const supabase = getSupabaseServerClient();
      await supabase.from('customers').upsert(
        {
          phone: formattedPhone || cleanPhoneDigits,
          first_name: firstName,
          last_name: lastName,
          email: email,
          address_line1: addr.line1 || addr.address || '',
          address_line2: addr.line2 || '',
          city: addr.city || '',
          state: addr.state || '',
          pincode: addr.pincode || '',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'phone' }
      );
    } catch (dbErr) {
      console.warn('Could not sync Fastrr customer to Supabase table:', dbErr.message);
    }

    // 4. Return normalized user session
    const userSession = {
      isLoggedIn: true,
      email: email,
      phone: formattedPhone || cleanPhoneDigits,
      username: fullName,
      joinedDate: 'August 2026',
      uid: `FASTRR-${cleanPhoneDigits || Date.now()}`,
      address: {
        line1: addr.line1 || '',
        line2: addr.line2 || '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || '',
        country: addr.country || 'India'
      }
    };

    return NextResponse.json({ success: true, userSession });
  } catch (err) {
    console.error('Fastrr customer verification exception:', err);
    return NextResponse.json({ error: `Server exception: ${err.message}` }, { status: 500 });
  }
}
