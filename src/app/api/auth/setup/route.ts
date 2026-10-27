import { NextRequest, NextResponse } from 'next/server';
import { registerInitialOwner, loginOwner, getOwnerCount, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (getOwnerCount() > 0) {
      return NextResponse.json(
        { error: 'Owner account is already configured. Public registration is permanently closed.' },
        { status: 403 }
      );
    }

    const { username, password, recoveryEmail } = await req.json();

    if (!username || username.trim().length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters long.' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const result = await registerInitialOwner(username, password, recoveryEmail || '');
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to initialize owner account.' }, { status: 400 });
    }

    // Automatically log in newly created owner
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const loginRes = await loginOwner(username, password, true, userAgent, ipAddress);

    const response = NextResponse.json({ success: true, message: 'Owner setup complete.' });

    if (loginRes.token) {
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: loginRes.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err) {
    console.error('Setup error:', err);
    return NextResponse.json({ error: 'Server initialization error.' }, { status: 500 });
  }
}
