import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('cms_session');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CMS Logout check error:", err);
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
  }
}
