import React from 'react';
import db from '@/lib/db';
import PortfolioClient from './PortfolioClient';

export const dynamic = 'force-dynamic';

const toPlain = <T,>(data: T): T => JSON.parse(JSON.stringify(data));

export default function HomePage() {
  // Read verified authentic data directly from SQLite and convert from null-prototype to plain objects
  const rawSettings = db.prepare('SELECT * FROM site_settings WHERE id = ?').get('global') || {};
  const rawProjects = db.prepare('SELECT * FROM projects WHERE is_published = 1 ORDER BY sort_order ASC').all();
  const rawSkills = db.prepare('SELECT * FROM skills WHERE is_published = 1 ORDER BY sort_order ASC').all();
  const rawEducation = db.prepare('SELECT * FROM education WHERE is_published = 1').all();
  const rawCertificates = db.prepare('SELECT * FROM certificates WHERE is_published = 1').all();

  const settings = toPlain(rawSettings);
  const projects = toPlain(rawProjects);
  const skills = toPlain(rawSkills);
  const education = toPlain(rawEducation);
  const certificates = toPlain(rawCertificates);

  return (
    <PortfolioClient
      initialSettings={settings}
      projects={projects}
      skills={skills}
      education={education}
      certificates={certificates}
    />
  );
}
