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

  const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC').all();
  return NextResponse.json({ projects });
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
    if (!data.title || !data.summary) {
      return NextResponse.json({ error: 'Title and summary are required' }, { status: 400 });
    }

    const id = 'proj_' + crypto.randomUUID();
    const slug = (data.slug || data.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO projects (
        id, title, slug, summary, description, tech_stack, cover_image, demo_url, repo_url, verified_dates, is_published, sort_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.title.trim(),
      slug,
      data.summary.trim(),
      data.description?.trim() || data.summary.trim(),
      data.tech_stack?.trim() || '',
      data.cover_image || null,
      data.demo_url?.trim() || null,
      data.repo_url?.trim() || null,
      data.verified_dates?.trim() || 'Verified Project',
      data.is_published ? 1 : 0,
      Number(data.sort_order) || 0,
      now
    );

    return NextResponse.json({ success: true, message: 'Project created.' });
  } catch (err) {
    console.error('Project create error:', err);
    return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 });
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
    if (!data.id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE projects SET
        title = ?,
        summary = ?,
        description = ?,
        tech_stack = ?,
        cover_image = ?,
        demo_url = ?,
        repo_url = ?,
        verified_dates = ?,
        is_published = ?,
        sort_order = ?
      WHERE id = ?
    `).run(
      data.title.trim(),
      data.summary.trim(),
      data.description?.trim() || '',
      data.tech_stack?.trim() || '',
      data.cover_image || null,
      data.demo_url?.trim() || null,
      data.repo_url?.trim() || null,
      data.verified_dates?.trim() || 'Verified Project',
      data.is_published ? 1 : 0,
      Number(data.sort_order) || 0,
      data.id
    );

    return NextResponse.json({ success: true, message: 'Project updated.' });
  } catch (err) {
    console.error('Project update error:', err);
    return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 });
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

    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    console.error('Project delete error:', err);
    return NextResponse.json({ error: 'Failed to delete project.' }, { status: 500 });
  }
}
