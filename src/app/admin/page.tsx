import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, SESSION_COOKIE_NAME, getActiveSessions } from '@/lib/auth';
import db from '@/lib/db';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

const toPlain = <T,>(data: T): T => JSON.parse(JSON.stringify(data));

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';
  const auth = verifySession(token);

  if (!auth.isValid || !auth.owner) {
    redirect('/admin/login');
  }

  // Fetch full portfolio state for owner management and convert to plain objects
  const rawSettings = db.prepare('SELECT * FROM site_settings WHERE id = ?').get('global') || {};
  const rawProjects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC').all();
  const rawCertificates = db.prepare('SELECT * FROM certificates ORDER BY created_at DESC').all();
  const rawSkills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
  const rawEducation = db.prepare('SELECT * FROM education ORDER BY start_date DESC').all();
  const rawSessions = getActiveSessions(auth.owner.id);

  const sessions = rawSessions.map((s) => ({
    id: s.id,
    user_agent: s.user_agent,
    ip_address: s.ip_address,
    last_active_at: s.last_active_at,
    is_current: s.token === token,
  }));

  return (
    <DashboardClient
      owner={toPlain(auth.owner)}
      initialSettings={toPlain(rawSettings)}
      initialProjects={toPlain(rawProjects)}
      initialCertificates={toPlain(rawCertificates)}
      initialSkills={toPlain(rawSkills)}
      initialEducation={toPlain(rawEducation)}
      initialSessions={toPlain(sessions)}
    />
  );
}
