import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'portfolio.db');

// Global singleton pattern to prevent multiple simultaneous locks across Next.js build workers
declare global {
  var __portfolio_sqlite_db: DatabaseSync | undefined;
}

let db: DatabaseSync;
if (!globalThis.__portfolio_sqlite_db) {
  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA busy_timeout = 10000;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  globalThis.__portfolio_sqlite_db = db;
} else {
  db = globalThis.__portfolio_sqlite_db;
}

// Initialize tables safely
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS owner (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      recovery_email TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL,
      FOREIGN KEY(owner_id) REFERENCES owner(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(owner_id) REFERENCES owner(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      owner_name TEXT NOT NULL DEFAULT 'Elgin',
      headline TEXT NOT NULL DEFAULT 'CSE-AI Student | Developer | Problem Solver',
      bio TEXT NOT NULL DEFAULT 'Building digital solutions, exploring AI and web technologies, and turning ideas into real-world impact.',
      default_theme TEXT NOT NULL DEFAULT 'space',
      iris_name TEXT NOT NULL DEFAULT 'Iris',
      logo_url TEXT,
      github_url TEXT,
      linkedin_url TEXT,
      instagram_url TEXT,
      contact_email TEXT,
      selected_cursor TEXT NOT NULL DEFAULT 'cosmic',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      cover_image TEXT,
      demo_url TEXT,
      repo_url TEXT,
      verified_dates TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      issue_date TEXT,
      credential_id TEXT,
      credential_url TEXT,
      file_path TEXT,
      skills_verified TEXT,
      ai_extracted INTEGER NOT NULL DEFAULT 0,
      needs_review INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      proficiency INTEGER NOT NULL DEFAULT 85,
      is_published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS education (
      id TEXT PRIMARY KEY,
      institution TEXT NOT NULL,
      degree TEXT NOT NULL,
      field_of_study TEXT,
      start_date TEXT,
      end_date TEXT,
      description TEXT,
      is_published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    );
  `);

  // Seed default settings if not exists
  const existingSettings = db.prepare('SELECT id FROM site_settings WHERE id = ?').get('global');
  if (!existingSettings) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO site_settings (
        id, owner_name, headline, bio, default_theme, iris_name,
        github_url, linkedin_url, instagram_url, contact_email, selected_cursor, updated_at
      ) VALUES (
        'global', 'Elgin', 'CSE-AI Student | Developer | Problem Solver',
        'Building digital solutions, exploring AI and web technologies, and turning ideas into real-world impact.',
        'space', 'Iris', '', '', '', '', 'cosmic', ?
      )
    `).run(now);
  }

  // Seed verified projects if projects table has fewer than 3
  const projectCountRow = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (projectCountRow.count < 3) {
    const now = new Date().toISOString();
    const insertProject = db.prepare(`
      INSERT OR IGNORE INTO projects (
        id, title, slug, summary, description, tech_stack, cover_image, demo_url, repo_url, verified_dates, is_published, sort_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProject.run(
      'proj_bharat_yatra',
      'Bharat Yatra',
      'bharat-yatra',
      'A tourism website associated with my Smart India Hackathon journey.',
      'Bharat Yatra is a tourism web platform developed during the Smart India Hackathon journey, designed to facilitate travel exploration and showcase cultural destinations with a modern digital interface.',
      'HTML, CSS, JavaScript, Node.js',
      '/assets/projects/bharat_yatra_planet.webp',
      '',
      '',
      'SIH Journey',
      1,
      1,
      now
    );

    insertProject.run(
      'proj_recircuit',
      'ReCircuit',
      'recircuit',
      'E-waste management & circular economy platform (Currently Building / In Development).',
      'ReCircuit is an active in-development sustainability platform addressing electronic waste collection, safe data wiping workflows, and device recycling logistics. Conceptualized and actively being built.',
      'Python, Machine Learning, Web, Node.js',
      '/assets/projects/bharat_yatra_planet.webp',
      '',
      '',
      'Currently Building / In Development',
      1,
      2,
      now
    );

    insertProject.run(
      'proj_ai_chat',
      'AI Chat Assistant',
      'ai-chat-assistant',
      'Personal conversational AI assistant built with LLM integrations and domain memory.',
      'A sophisticated personal conversational agent featuring specialized dual-personality modes, domain memory retrieval, and real-time interactive assistance.',
      'Python, LLMs, Web, Next.js',
      '/assets/projects/central_sun.webp',
      '',
      '',
      'Production AI',
      1,
      3,
      now
    );
  }

  // Seed verified skills if empty
  const skillCountRow = db.prepare('SELECT COUNT(*) as count FROM skills').get() as { count: number };
  if (skillCountRow.count === 0) {
    const insertSkill = db.prepare(`
      INSERT OR IGNORE INTO skills (id, category, name, proficiency, is_published, sort_order)
      VALUES (?, ?, ?, ?, 1, ?)
    `);
    insertSkill.run('skill_python', 'AI & Backend', 'Python', 90, 1);
    insertSkill.run('skill_js', 'Core Web', 'JavaScript / TypeScript', 85, 2);
    insertSkill.run('skill_react', 'Frontend', 'React / Next.js', 80, 3);
    insertSkill.run('skill_html_css', 'Core Web', 'HTML5 / CSS3', 90, 4);
    insertSkill.run('skill_nodejs', 'Backend', 'Node.js', 75, 5);
    insertSkill.run('skill_git', 'Developer Tools', 'Git & GitHub', 85, 6);
  }

  // Seed verified certificates if empty
  const certCountRow = db.prepare('SELECT COUNT(*) as count FROM certificates').get() as { count: number };
  if (certCountRow.count === 0) {
    const now = new Date().toISOString();
    const insertCert = db.prepare(`
      INSERT OR IGNORE INTO certificates (
        id, title, issuer, issue_date, credential_id, credential_url, skills_verified, is_published, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    insertCert.run(
      'cert_python',
      'Python Programming',
      'Verified Competency Provider',
      'Nov 2024',
      'PY-2024-ELG',
      '',
      'Python, Algorithms, Data Structures',
      now
    );
    insertCert.run(
      'cert_sih',
      'Smart India Hackathon Finalist',
      'Government of India / AICTE',
      '2024',
      'SIH-2024-NEV',
      '',
      'Web Engineering, Hackathon Innovation',
      now
    );
  }
} catch (err) {
  // If another process is initializing tables, busy_timeout handles it
}

export default db;
