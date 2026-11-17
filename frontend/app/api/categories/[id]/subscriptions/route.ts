import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { findAllSubscriptions } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin(req);
    const q: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      q[key] = value;
    });
    return ok(await findAllSubscriptions({ ...q, category_id: params.id }));
  });
}
