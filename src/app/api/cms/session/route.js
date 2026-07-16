import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('cms_session')?.value;
    
    if (session === 'unlocked_session_active') {
      return NextResponse.json({ unlocked: true });
    } else {
      return NextResponse.json({ unlocked: false });
    }
  } catch (err) {
    console.error("CMS Session check error:", err);
    return NextResponse.json({ unlocked: false }, { status: 550 });
  }
}
