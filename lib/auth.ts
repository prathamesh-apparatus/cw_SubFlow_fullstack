// Server-only: JWT (jose, HS256) + bcryptjs password hashing + session cookie helpers.
// Mirrors the old NestJS AuthService / JwtAuthGuard behaviour exactly:
//  - token payload { sub, email }, 7-day expiry, secret JWT_SECRET
//  - cookie `subflow_token` (httpOnly, sameSite lax, path /, 7-day maxAge)
//  - guard errors: no token → 401 'Authentication required'; bad token → 401 'Invalid or expired session'
// bcryptjs verifies the existing bcrypt $2b$ hashes created before the Next.js migration.
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import type { NextRequest, NextResponse } from 'next/server';
import { query } from './db';
import { ApiError } from './http';
import { logActivity } from './notifications';

export const SESSION_COOKIE = 'subflow_token';
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_change_me_32_chars_long');
}

function expiresIn(): string | number {
  const raw = process.env.JWT_EXPIRES_IN || '7d';
  return /^\d+$/.test(raw) ? parseInt(raw, 10) : raw;
}

export interface AdminTokenPayload {
  sub: string;
  email: string;
}

export async function signAdminToken(admin: { id: string; email: string }): Promise<string> {
  return new SignJWT({ email: admin.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime(expiresIn() as any)
    .sign(secretKey());
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SEVEN_DAYS_SECONDS,
    path: '/',
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
}

/** Read + verify the session (cookie first, then Bearer header — same as the Nest guard). Throws ApiError(401). */
export async function getCurrentAdmin(req: NextRequest): Promise<AdminTokenPayload> {
  const token =
    req.cookies.get(SESSION_COOKIE)?.value ||
    (req.headers.get('authorization') || '').replace('Bearer ', '');
  if (!token) throw new ApiError(401, 'Authentication required');
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    return { sub: String(payload.sub), email: String((payload as any).email) };
  } catch {
    throw new ApiError(401, 'Invalid or expired session');
  }
}

export const requireAdmin = getCurrentAdmin;

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

/**
 * First-run admin auto-seed (replaces the old Docker entrypoint seed): if the
 * admins table is empty and ADMIN_EMAIL / ADMIN_PASSWORD are configured, create
 * the admin so the very first login just works. Idempotent upsert, same as seed.ts.
 */
export async function ensureAdminSeeded(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  try {
    const { rows } = await query<{ c: number }>('SELECT COUNT(*)::int AS c FROM admins');
    if ((rows[0]?.c ?? 0) > 0) return;
    const hash = await hashPassword(password);
    await query(
      'INSERT INTO admins (email, password_hash) VALUES ($1,$2) ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, updated_at=NOW()',
      [email, hash],
    );
    console.log(`Admin seeded: ${email}`);
  } catch (e) {
    console.error('[auth] admin auto-seed failed:', e);
  }
}

export async function validateAdmin(email: string, password: string) {
  const { rows } = await query('SELECT id, email, password_hash FROM admins WHERE lower(email)=lower($1) LIMIT 1', [email]);
  const admin = rows[0];
  if (!admin || !(await comparePassword(password, admin.password_hash))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  return admin;
}

export async function login(email: string, password: string) {
  const admin = await validateAdmin(email, password);
  const token = await signAdminToken({ id: admin.id, email: admin.email });
  return { token, admin: { id: admin.id, email: admin.email } };
}

export async function changePassword(adminId: string, currentPassword: string, newPassword: string) {
  const { rows } = await query('SELECT password_hash FROM admins WHERE id=$1', [adminId]);
  const admin = rows[0];
  if (!admin || !(await comparePassword(currentPassword, admin.password_hash))) {
    throw new ApiError(401, 'Current password is incorrect');
  }
  if (await comparePassword(newPassword, admin.password_hash)) {
    throw new ApiError(400, 'New password must be different from the current password');
  }
  const hash = await hashPassword(newPassword);
  await query('UPDATE admins SET password_hash=$1 WHERE id=$2', [hash, adminId]);
  await logActivity('settings_password_changed', 'Password changed', 'The admin account password was changed.');
  return true;
}

export async function updateEmail(adminId: string, email: string) {
  const { rows: existing } = await query('SELECT id FROM admins WHERE lower(email)=lower($1) AND id <> $2', [email, adminId]);
  if (existing.length) throw new ApiError(409, 'This email is already in use');
  const { rows } = await query('UPDATE admins SET email=$1 WHERE id=$2 RETURNING id, email', [email, adminId]);
  const admin = rows[0];
  await logActivity('settings_email_changed', 'Email changed', `Admin email changed to ${admin.email}.`);
  const token = await signAdminToken({ id: admin.id, email: admin.email });
  return { admin: { id: admin.id, email: admin.email }, token };
}
