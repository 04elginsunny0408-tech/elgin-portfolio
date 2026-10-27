import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const result = await requestPasswordReset(identifier || '', ipAddress);

    return NextResponse.json(result);
  } catch (err) {
    console.error('Password reset request error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the reset request.' },
      { status: 500 }
    );
  }
}
