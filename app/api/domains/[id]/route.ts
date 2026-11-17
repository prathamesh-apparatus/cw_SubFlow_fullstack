import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { deleteDomain, getDomain, updateDomain } from '@/lib/domains';
import { updateDomainSpec, validateBody } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin(req);
    return ok(await getDomain(params.id));
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const dto = validateBody(body, updateDomainSpec);
    return ok(await updateDomain(params.id, dto));
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin(req);
    return ok(await deleteDomain(params.id));
  });
}
