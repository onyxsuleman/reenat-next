import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../utils/supabaseServer';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }
    
    const supabase = getSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('email', email.trim())
      .order('created_at', { ascending: false });
      
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
