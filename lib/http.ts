// Server-only: response envelope identical to the old NestJS backend —
// success: { success: true, data } · error: { success: false, statusCode, message, data: null }
// (mirrors the Nest AllExceptionsFilter + controller return shapes 1:1).
import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(public status: number, message: string | string[]) {
    super(Array.isArray(message) ? message.join(', ') : message);
    this.messages = message;
  }
  messages: string | string[];
}

export function ok(data: unknown, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { success: false, statusCode: err.status, message: err.messages, data: null },
      { status: err.status },
    );
  }
  const status = 500;
  const message = (err as Error)?.message || 'Internal server error';
  return NextResponse.json({ success: false, statusCode: status, message, data: null }, { status });
}

/** Wrap a route handler body so thrown ApiErrors / unexpected errors become the standard envelope. */
export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (!(err instanceof ApiError)) console.error('[api] unhandled error:', err);
    return fail(err);
  }
}
