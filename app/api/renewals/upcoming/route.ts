import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { upcomingRenewals } from '@/lib/dashboard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10) || 30;
    return ok(await upcomingRenewals(days));
  });
}
