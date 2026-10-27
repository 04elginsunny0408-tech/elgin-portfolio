import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
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

  const certificates = db.prepare('SELECT * FROM certificates ORDER BY created_at DESC').all();
  return NextResponse.json({ certificates });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';
  const auth = verifySession(token);

  if (!auth.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    if (!data.title || !data.issuer) {
      return NextResponse.json({ error: 'Title and Issuer are required' }, { status: 400 });
    }

    const id = 'cert_' + crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO certificates (
        id, title, issuer, issue_date, credential_id, credential_url, file_path, skills_verified, ai_extracted, needs_review, is_published, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.title.trim(),
      data.issuer.trim(),
      data.issue_date?.trim() || null,
      data.credential_id?.trim() || null,
      data.credential_url?.trim() || null,
      data.file_path || null,
      data.skills_verified?.trim() || null,
      data.ai_extracted ? 1 : 0,
      data.needs_review ? 1 : 0,
      data.is_published ? 1 : 0,
      now
    );

    return NextResponse.json({ success: true, message: 'Certificate saved.' });
  } catch (err) {
    console.error('Certificate save error:', err);
    return NextResponse.json({ error: 'Failed to save certificate.' }, { status: 500 });
  }
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
    if (!data.id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    db.prepare(`
      UPDATE certificates SET
        title = ?,
        issuer = ?,
        issue_date = ?,
        credential_id = ?,
        credential_url = ?,
        file_path = ?,
        skills_verified = ?,
        needs_review = ?,
        is_published = ?
      WHERE id = ?
    `).run(
      data.title.trim(),
      data.issuer.trim(),
      data.issue_date?.trim() || null,
      data.credential_id?.trim() || null,
      data.credential_url?.trim() || null,
      data.file_path || null,
      data.skills_verified?.trim() || null,
      data.needs_review ? 1 : 0,
      data.is_published ? 1 : 0,
      data.id
    );

    return NextResponse.json({ success: true, message: 'Certificate updated.' });
  } catch (err) {
    console.error('Certificate update error:', err);
    return NextResponse.json({ error: 'Failed to update certificate.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';
  const auth = verifySession(token);

  if (!auth.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    db.prepare('DELETE FROM certificates WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Certificate deleted.' });
  } catch (err) {
    console.error('Certificate delete error:', err);
    return NextResponse.json({ error: 'Failed to delete certificate.' }, { status: 500 });
  }
}
