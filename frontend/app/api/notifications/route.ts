import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { listNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    return ok(await listNotifications());
  });
}
