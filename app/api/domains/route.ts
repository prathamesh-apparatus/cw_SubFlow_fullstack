import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { createDomain, listDomains } from '@/lib/domains';
import { createDomainSpec, validateBody } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    const q: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      q[key] = value;
    });
    return ok(await listDomains(q));
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const dto = validateBody(body, createDomainSpec);
    return ok(await createDomain(dto));
  });
}
