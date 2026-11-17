// Server-only: notifications — ported from the old NestJS NotificationsService.
// The notifications table is bootstrapped lazily (CREATE TABLE IF NOT EXISTS,
// try/catch — never fails the request), replacing Nest's OnModuleInit hook.
// sync() generates renewal_overdue / renewal_upcoming / payment_failed rows with
// the same dedupe keys and emails only the newly inserted ones via Brevo.
import { query } from './db';
import { sendNotificationEmail } from './mail';

interface Candidate {
  subscription_id: string;
  type: string;
  title: string;
  message: string;
  dedupe_key: string;
  sub: any;
}

let bootstrapPromise: Promise<void> | null = null;

function ensureNotificationsTable(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      try {
        await query(`CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          dedupe_key TEXT UNIQUE NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
        await query('CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at DESC)');
      } catch (e) {
        console.error('[notifications] table bootstrap failed:', e);
      }
    })();
  }
  return bootstrapPromise;
}

function fmtDate(d: any): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function dateKey(d: any): string {
  if (!d) return 'none';
  if (typeof d === 'string') return d.slice(0, 10);
  const date = d instanceof Date ? d : new Date(d);
  return isNaN(date.getTime()) ? 'none' : date.toISOString().slice(0, 10);
}

function fmtAmount(amount: any, currency?: string | null): string {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${currency || 'INR'} ${n.toFixed(2)}`;
  }
}

async function candidates(): Promise<Candidate[]> {
  const cols = 's.id, s.name, s.total_amount, s.currency, s.next_renewal_date, s.status, s.payment_status, s.updated_at, c.name AS category_name';
  const join = 'FROM subscriptions s JOIN categories c ON c.id = s.category_id';
  const [overdue, upcoming, failed] = await Promise.all([
    query(`SELECT ${cols} ${join} WHERE s.status = 'active' AND s.next_renewal_date < CURRENT_DATE`),
    query(`SELECT ${cols} ${join} WHERE s.status NOT IN ('cancelled','expired') AND s.next_renewal_date >= CURRENT_DATE AND ((s.renewal_reminder = TRUE AND s.next_renewal_date <= CURRENT_DATE + (s.reminder_days_before || ' days')::interval) OR s.next_renewal_date = CURRENT_DATE)`),
    query(`SELECT ${cols} ${join} WHERE s.payment_status = 'failed' AND s.status NOT IN ('cancelled','expired')`),
  ]);
  const out: Candidate[] = [];
  for (const s of overdue.rows) {
    out.push({
      subscription_id: s.id,
      type: 'renewal_overdue',
      title: 'Renewal overdue',
      message: `${s.name} was due on ${fmtDate(s.next_renewal_date)} and is now overdue.`,
      dedupe_key: `renewal_overdue:${s.id}:${dateKey(s.next_renewal_date)}`,
      sub: s,
    });
  }
  for (const s of upcoming.rows) {
    out.push({
      subscription_id: s.id,
      type: 'renewal_upcoming',
      title: 'Renewal coming up',
      message: `${s.name} renews on ${fmtDate(s.next_renewal_date)} (${fmtAmount(s.total_amount, s.currency)}).`,
      dedupe_key: `renewal_upcoming:${s.id}:${dateKey(s.next_renewal_date)}`,
      sub: s,
    });
  }
  for (const s of failed.rows) {
    out.push({
      subscription_id: s.id,
      type: 'payment_failed',
      title: 'Payment failed',
      message: `The last payment for ${s.name} failed. Please review it.`,
      dedupe_key: `payment_failed:${s.id}:${dateKey(s.updated_at)}`,
      sub: s,
    });
  }
  return out;
}

/** Generate notifications from live subscription data; email only the newly created ones. */
export async function syncNotifications(): Promise<void> {
  await ensureNotificationsTable();
  try {
    const list = await candidates();
    for (const c of list) {
      const { rows } = await query(
        'INSERT INTO notifications (subscription_id, type, title, message, dedupe_key) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (dedupe_key) DO NOTHING RETURNING *',
        [c.subscription_id, c.type, c.title, c.message, c.dedupe_key],
      );
      if (rows.length) {
        sendNotificationEmail(rows[0], c.sub).catch((e) => console.error('[notifications] email failed:', e));
      }
    }
  } catch (e) {
    console.error('[notifications] sync failed:', e);
  }
}

export async function listNotifications() {
  await syncNotifications();
  const [{ rows }, count] = await Promise.all([
    query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'),
    query('SELECT COUNT(*)::int AS unread FROM notifications WHERE is_read = FALSE'),
  ]);
  return { items: rows, unread: count.rows[0]?.unread ?? 0 };
}

export async function unreadCount() {
  await syncNotifications();
  const { rows } = await query('SELECT COUNT(*)::int AS unread FROM notifications WHERE is_read = FALSE');
  return { unread: rows[0]?.unread ?? 0 };
}

export async function markRead(id: string) {
  await ensureNotificationsTable();
  if (/^[0-9a-fA-F-]{36}$/.test(id)) {
    await query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
  }
  return { id, is_read: true };
}

export async function markAllRead() {
  await ensureNotificationsTable();
  const r = await query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE');
  return { updated: r.rowCount ?? 0 };
}
