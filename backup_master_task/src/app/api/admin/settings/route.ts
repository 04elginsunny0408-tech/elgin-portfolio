import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';
  const auth = verifySession(token);

  if (!auth.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = db.prepare('SELECT * FROM site_settings WHERE id = ?').get('global');
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';
  const auth = verifySession(token);

  if (!auth.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE site_settings SET
        owner_name = ?,
        headline = ?,
        bio = ?,
        default_theme = ?,
        iris_name = ?,
        logo_url = ?,
        github_url = ?,
        linkedin_url = ?,
        instagram_url = ?,
        contact_email = ?,
        selected_cursor = ?,
        updated_at = ?
      WHERE id = 'global'
    `).run(
      data.owner_name?.trim() || 'Elgin',
      data.headline?.trim() || 'CSE-AI Student | Developer | Problem Solver',
      data.bio?.trim() || '',
      data.default_theme || 'space',
      data.iris_name?.trim() || 'Iris',
      data.logo_url || null,
      data.github_url?.trim() || '',
      data.linkedin_url?.trim() || '',
      data.instagram_url?.trim() || '',
      data.contact_email?.trim() || '',
      data.selected_cursor || 'cosmic',
      now
    );

    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err) {
    console.error('Settings update error:', err);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}
