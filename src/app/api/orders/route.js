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
    
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    const conditions = [];
    if (email) {
      conditions.push(`email.eq.${email.trim()}`);
    }
    if (phone) {
      conditions.push(`phone.eq.${phone.trim()}`);
      
      const clean = phone.replace(/\D/g, '');
      const tenDigit = clean.length > 10 ? clean.slice(-10) : clean;
      
      conditions.push(`phone.eq.${tenDigit}`);
      conditions.push(`phone.eq.+91${tenDigit}`);
      conditions.push(`phone.eq.91${tenDigit}`);
    }
    
    query = query.or(conditions.join(','));

    
    const { data, error } = await query;
      
    if (error) {
      console.error("Fetch orders backend error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error("Fetch orders backend exception:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 550 });
  }
}
