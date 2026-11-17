import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { deleteNotifications, listNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    return ok(await listNotifications());
  });
}

export async function DELETE(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    return ok({ deleted: await deleteNotifications(ids) });
  });
}
