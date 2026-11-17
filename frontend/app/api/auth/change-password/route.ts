import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { changePassword, requireAdmin } from '@/lib/auth';
import { changePasswordSpec, validateBody } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  return handle(async () => {
    const admin = await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const dto = validateBody(body, changePasswordSpec);
    await changePassword(admin.sub, dto.currentPassword, dto.newPassword);
    return ok(null);
  });
}
