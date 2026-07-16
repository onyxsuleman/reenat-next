import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { passcode } = await request.json();
    const actualPasscode = process.env.CMS_PASSCODE;
    
    if (!actualPasscode) {
      return NextResponse.json({ error: 'CMS passcode is not configured on the server.' }, { status: 500 });
    }
    
    if (passcode === actualPasscode) {
      const cookieStore = await cookies();
      cookieStore.set('cms_session', 'unlocked_session_active', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 2, // 2 hours expiration
        path: '/',
      });
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
    }
  } catch (err) {
    console.error("CMS Auth Error:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
