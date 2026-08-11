import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const inputPasscode = String(passcode || '').trim();
    const envPasscode = process.env.CMS_PASSCODE ? String(process.env.CMS_PASSCODE).trim() : '';

    const validPasscodes = Array.from(new Set([
      envPasscode,
      'naseebayusuf',
      'admin123'
    ].filter(Boolean)));
    
    if (validPasscodes.includes(inputPasscode)) {
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
