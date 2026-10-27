import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordWithToken, verifyResetToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const result = verifyResetToken(token);
  return NextResponse.json({ isValid: result.isValid, error: result.error });
}

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const result = await resetPasswordWithToken(token, newPassword);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to reset password.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Password has been successfully updated.' });
  } catch (err) {
    console.error('Password reset execution error:', err);
    return NextResponse.json({ error: 'Failed to complete password reset.' }, { status: 500 });
  }
}
