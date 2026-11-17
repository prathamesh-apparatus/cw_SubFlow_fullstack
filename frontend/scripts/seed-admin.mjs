// Seed / update the single admin account from env (ADMIN_EMAIL / ADMIN_PASSWORD).
// Run via:  npm run seed        (package.json passes --env-file=.env)
// Mirrors the old NestJS backend seed: bcrypt hash (cost 12), idempotent upsert.
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  database: process.env.DATABASE_NAME || 'subflow',
  user: process.env.DATABASE_USER || 'subflow',
  password: process.env.DATABASE_PASSWORD || '',
});

try {
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    'INSERT INTO admins (email, password_hash) VALUES ($1,$2) ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, updated_at=NOW()',
    [email, hash],
  );
  console.log(`Admin seeded: ${email}`);
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await pool.end();
}
