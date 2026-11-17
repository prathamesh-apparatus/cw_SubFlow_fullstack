// Server-only: native `pg` Pool (no ORM). Singleton cached on globalThis so
// Next.js dev HMR doesn't leak a new pool on every reload.
import { Pool } from 'pg';

const globalForDb = globalThis as unknown as { subflowPool?: Pool };

export const pool: Pool =
  globalForDb.subflowPool ??
  new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'subflow',
    user: process.env.DATABASE_USER || 'subflow',
    password: process.env.DATABASE_PASSWORD || '',
  });

if (process.env.NODE_ENV !== 'production') globalForDb.subflowPool = pool;

export function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number | null }> {
  return pool.query(text, params) as any;
}
