import { handle, ok } from '@/lib/http';
import { clearSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  return handle(async () => {
    const res = ok(null);
    clearSessionCookie(res);
    return res;
  });
}
