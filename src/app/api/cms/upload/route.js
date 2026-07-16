import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '../../../../utils/supabaseServer';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('cms_session')?.value;
    
    if (session !== 'unlocked_session_active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    const path = formData.get('path');
    
    if (!file || !path) {
      return NextResponse.json({ error: 'Missing file or path parameter.' }, { status: 400 });
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const supabase = getSupabaseServerClient();
    
    const { data, error } = await supabase.storage
      .from('saree-images')
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error("Storage upload proxy error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('saree-images')
      .getPublicUrl(path);
      
    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("CMS Upload proxy exception:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 550 });
  }
}
