import { NextRequest, NextResponse } from 'next/server';
import { loginOwner, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { username, password, rememberDevice } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    const result = await loginOwner(username, password, !!rememberDevice, userAgent, ipAddress);

    if (!result.success || !result.token) {
      return NextResponse.json({ error: result.error || 'Authentication failed.' }, { status: 401 });
    }

    const maxAge = rememberDevice ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server authentication error.' }, { status: 500 });
  }
}
