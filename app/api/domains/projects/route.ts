import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { domainFacets } from '@/lib/domains';

export const dynamic = 'force-dynamic';

/** Facet values for the Domains UI: distinct project names + registrars + managers. */
export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    return ok(await domainFacets());
  });
}
