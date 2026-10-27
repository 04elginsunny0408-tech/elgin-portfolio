import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, getActiveSessions, revokeAllOtherSessions, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';
  const auth = verifySession(token);

  if (!auth.isValid || !auth.owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessions = getActiveSessions(auth.owner.id);
  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      user_agent: s.user_agent,
      ip_address: s.ip_address,
      last_active_at: s.last_active_at,
      is_current: s.token === token,
    })),
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';
  const auth = verifySession(token);

  if (!auth.isValid || !auth.owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revokeAllOtherSessions(auth.owner.id, token);
  return NextResponse.json({ success: true, message: 'All other sessions have been revoked.' });
}
