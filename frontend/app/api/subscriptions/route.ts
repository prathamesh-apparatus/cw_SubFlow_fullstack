import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { createSubscription, findAllSubscriptions } from '@/lib/subscriptions';
import { subscriptionSpec, validateBody } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    const q: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      q[key] = value;
    });
    return ok(await findAllSubscriptions(q));
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const dto = validateBody(body, subscriptionSpec);
    return ok(await createSubscription(dto));
  });
}
