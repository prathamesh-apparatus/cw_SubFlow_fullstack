import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { ensureAdminSeeded, login, setSessionCookie } from '@/lib/auth';
import { loginSpec, validateBody } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handle(async () => {
    const body = await req.json().catch(() => ({}));
    const dto = validateBody(body, loginSpec);
    // First run: create the admin from env if none exists yet (replaces the Docker seed).
    await ensureAdminSeeded();
    const { token, admin } = await login(dto.email, dto.password);
    const res = ok(admin);
    setSessionCookie(res, token);
    return res;
  });
}
