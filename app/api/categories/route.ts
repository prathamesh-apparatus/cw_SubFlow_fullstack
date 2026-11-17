import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';
import { createCategory, findAllCategories } from '@/lib/categories';
import { createCategorySpec, validateBody } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    const search = req.nextUrl.searchParams.get('search') ?? '';
    const sort = req.nextUrl.searchParams.get('sort') ?? 'name_asc';
    return ok(await findAllCategories(search, sort));
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const dto = validateBody(body, createCategorySpec);
    return ok(await createCategory(dto));
  });
}
