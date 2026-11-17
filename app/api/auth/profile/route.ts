import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { requireAdmin, setSessionCookie, updateEmail } from '@/lib/auth';
import { updateProfileSpec, validateBody } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  return handle(async () => {
    const admin = await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const dto = validateBody(body, updateProfileSpec);
    const { token, admin: updated } = await updateEmail(admin.sub, dto.email);
    const res = ok(updated);
    setSessionCookie(res, token);
    return res;
  });
}
