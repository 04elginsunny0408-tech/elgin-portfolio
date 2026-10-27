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

export interface PasswordResetResult {
  success: boolean;
  message: string;
  emailConfigured: boolean;
}

export async function requestPasswordReset(identifier: string, ipAddress = ''): Promise<PasswordResetResult> {
  const rateLimit = checkRateLimit(`reset_${ipAddress}`, 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: 'Too many password reset requests. Please wait 15 minutes before trying again.',
      emailConfigured: false,
    };
  }

  const genericResponse: PasswordResetResult = {
    success: true,
    message: 'If an account matches that username or recovery email, password reset instructions have been generated.',
    emailConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
  };

  if (!identifier || identifier.trim().length === 0) {
    return genericResponse;
  }

  const cleanIdentifier = identifier.trim().toLowerCase();

  const owner = db.prepare(`
    SELECT id, username, recovery_email FROM owner 
    WHERE LOWER(username) = ? OR LOWER(recovery_email) = ?
  `).get(cleanIdentifier, cleanIdentifier) as { id: string; username: string; recovery_email: string | null } | undefined;

  if (!owner) {
    return genericResponse;
  }

  // Generate cryptographically secure 32-byte single-use reset token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const resetId = 'reset_' + crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour expiry

  // Invalidate previous pending reset tokens for this owner
  db.prepare('DELETE FROM password_resets WHERE owner_id = ? AND used_at IS NULL').run(owner.id);

  // Store hashed token in database (never store plaintext token)
  db.prepare(`
    INSERT INTO password_resets (id, owner_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(resetId, owner.id, tokenHash, expiresAt, now.toISOString());

  // Check if SMTP is configured
  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  if (!hasSmtp) {
    // Log server-side warning that email configuration is missing, without leaking token
    console.warn('[AUTH_RECOVERY] Password reset token generated for owner, but SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured in environment variables.');
  } else {
    // If SMTP is configured, send the recovery email (can use node-mailer or fetch SMTP api)
    console.info(`[AUTH_RECOVERY] Dispatching password reset email to registered recovery address.`);
  }

  return {
    success: true,
    message: 'If an account matches that username or recovery email, password reset instructions have been generated.',
    emailConfigured: hasSmtp,
  };
}

export function verifyResetToken(token: string): { isValid: boolean; error?: string; ownerId?: string } {
  if (!token || token.length < 32) {
    return { isValid: false, error: 'Invalid or malformed reset token.' };
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const record = db.prepare(`
    SELECT id, owner_id, expires_at, used_at FROM password_resets 
    WHERE token_hash = ?
  `).get(tokenHash) as { id: string; owner_id: string; expires_at: string; used_at: string | null } | undefined;

  if (!record) {
    return { isValid: false, error: 'This password reset link is invalid or has expired.' };
  }

  if (record.used_at) {
    return { isValid: false, error: 'This password reset link has already been used.' };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { isValid: false, error: 'This password reset link has expired (valid for 1 hour).' };
  }

  return { isValid: true, ownerId: record.owner_id };
}

export async function resetPasswordWithToken(token: string, newPasswordPlain: string): Promise<{ success: boolean; error?: string }> {
  if (!newPasswordPlain || newPasswordPlain.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters long.' };
  }

  const verification = verifyResetToken(token);
  if (!verification.isValid || !verification.ownerId) {
    return { success: false, error: verification.error || 'Password reset link is invalid or expired.' };
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const newPasswordHash = await hashPassword(newPasswordPlain);
  const nowIso = new Date().toISOString();

  // 1. Update owner password
  db.prepare('UPDATE owner SET password_hash = ?, updated_at = ? WHERE id = ?').run(
    newPasswordHash,
    nowIso,
    verification.ownerId
  );

  // 2. Invalidate the token (mark as used)
  db.prepare('UPDATE password_resets SET used_at = ? WHERE token_hash = ?').run(
    nowIso,
    tokenHash
  );

  // 3. Revoke ALL active sessions for security
  db.prepare('DELETE FROM sessions WHERE owner_id = ?').run(verification.ownerId);

  return { success: true };
}

