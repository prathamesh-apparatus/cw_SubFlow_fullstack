import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Public liveness probe — no auth, same raw body the Nest HealthController returned.
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'subflow-backend', timestamp: new Date().toISOString() });
}
