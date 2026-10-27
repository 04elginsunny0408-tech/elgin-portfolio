import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import db from './db';

export const SESSION_COOKIE_NAME = 'elgin_owner_session';
const SESSION_MAX_AGE_DAYS = 30; // Max lifetime if remember device

export interface OwnerRecord {
  id: string;
  username: string;
  recovery_email: string | null;
  created_at: string;
}

export interface SessionRecord {
  id: string;
  owner_id: string;
  token: string;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: string;
  created_at: string;
  last_active_at: string;
}

export function getOwnerCount(): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM owner').get() as { count: number };
  return row.count;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = db.prepare('SELECT attempts, reset_at FROM rate_limits WHERE key = ?').get(key) as { attempts: number; reset_at: number } | undefined;

  if (!existing || now > existing.reset_at) {
    db.prepare(`
      INSERT INTO rate_limits (key, attempts, reset_at)
      VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET attempts = 1, reset_at = ?
    `).run(key, now + windowMs, now + windowMs);
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (existing.attempts >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  const nextAttempts = existing.attempts + 1;
  db.prepare('UPDATE rate_limits SET attempts = ? WHERE key = ?').run(nextAttempts, key);
  return { allowed: true, remaining: maxAttempts - nextAttempts };
}

export function resetRateLimit(key: string): void {
  db.prepare('DELETE FROM rate_limits WHERE key = ?').run(key);
}

export async function registerInitialOwner(username: string, passwordPlain: string, recoveryEmail: string): Promise<{ success: boolean; error?: string }> {
  if (getOwnerCount() > 0) {
    return { success: false, error: 'Owner account is already configured. Public registration is permanently closed.' };
  }

  if (!username || username.trim().length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }

  if (!passwordPlain || passwordPlain.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  const passwordHash = await hashPassword(passwordPlain);
  const id = 'owner_' + crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO owner (id, username, password_hash, recovery_email, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, username.trim(), passwordHash, recoveryEmail.trim() || null, now, now);

  return { success: true };
}

export async function loginOwner(username: string, passwordPlain: string, rememberDevice = false, userAgent = '', ipAddress = ''): Promise<{ success: boolean; token?: string; error?: string }> {
  const rateLimit = checkRateLimit(`login_${username.toLowerCase()}_${ipAddress}`);
  if (!rateLimit.allowed) {
    return { success: false, error: 'Too many failed login attempts. Please wait 15 minutes before trying again.' };
  }

  const row = db.prepare('SELECT * FROM owner WHERE LOWER(username) = LOWER(?)').get(username) as { id: string; password_hash: string } | undefined;
  if (!row) {
    return { success: false, error: 'Invalid username or password.' };
  }

  const isValid = await verifyPassword(passwordPlain, row.password_hash);
  if (!isValid) {
    return { success: false, error: 'Invalid username or password.' };
  }

  resetRateLimit(`login_${username.toLowerCase()}_${ipAddress}`);

  // Create session
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = 'sess_' + crypto.randomUUID();
  const now = new Date();
  const days = rememberDevice ? SESSION_MAX_AGE_DAYS : 1;
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  db.prepare(`
    INSERT INTO sessions (id, owner_id, token, user_agent, ip_address, expires_at, created_at, last_active_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, row.id, token, userAgent, ipAddress, expiresAt, nowIso, nowIso);

  return { success: true, token };
}

export function verifySession(token: string): { isValid: boolean; owner?: OwnerRecord; sessionId?: string } {
  if (!token) return { isValid: false };

  const session = db.prepare(`
    SELECT s.id as session_id, s.expires_at, o.id as owner_id, o.username, o.recovery_email, o.created_at
    FROM sessions s
    JOIN owner o ON s.owner_id = o.id
    WHERE s.token = ?
  `).get(token) as { session_id: string; expires_at: string; owner_id: string; username: string; recovery_email: string | null; created_at: string } | undefined;

  if (!session) return { isValid: false };

  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(session.session_id);
    return { isValid: false };
  }

  // Update last active
  db.prepare('UPDATE sessions SET last_active_at = ? WHERE id = ?').run(new Date().toISOString(), session.session_id);

  return {
    isValid: true,
    sessionId: session.session_id,
    owner: {
      id: session.owner_id,
      username: session.username,
      recovery_email: session.recovery_email,
      created_at: session.created_at,
    },
  };
}

export function revokeSession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function revokeAllOtherSessions(ownerId: string, currentToken: string): void {
  db.prepare('DELETE FROM sessions WHERE owner_id = ? AND token != ?').run(ownerId, currentToken);
}

export function getActiveSessions(ownerId: string): SessionRecord[] {
  return db.prepare(`
    SELECT * FROM sessions WHERE owner_id = ? ORDER BY last_active_at DESC
  `).all(ownerId) as unknown as SessionRecord[];
}
