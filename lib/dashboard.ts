// Server-only: dashboard + renewals — SQL ported verbatim from the old NestJS
// DashboardService (including the LIVE generate_series monthly-expenses
// computation) and RenewalsService.
import { query } from './db';
import { DOMAIN_MONTHLY, DOMAIN_YEARLY, ensureDomainsTable } from './domains';

const M = `CASE s.billing_cycle WHEN 'monthly' THEN s.total_amount WHEN 'quarterly' THEN s.total_amount/3 WHEN 'half_yearly' THEN s.total_amount/6 WHEN 'yearly' THEN s.total_amount/12 WHEN 'custom' THEN s.total_amount * 30.4375 / NULLIF(s.custom_billing_days,0) ELSE s.total_amount END`;

// Domain expenses are part of the dashboard expense figures. Fail-soft: the
// domains table is bootstrapped first, and any failure contributes 0 rather
// than breaking the dashboard.
async function domainTotals(): Promise<{ monthly: number; yearly: number }> {
  try {
    await ensureDomainsTable();
    const { rows } = await query(
      `SELECT COALESCE(SUM(${DOMAIN_MONTHLY}),0) AS monthly, COALESCE(SUM(${DOMAIN_YEARLY}),0) AS yearly FROM domains d WHERE d.status NOT IN ('cancelled','expired')`,
    );
    return { monthly: Number(rows[0].monthly) || 0, yearly: Number(rows[0].yearly) || 0 };
  } catch (e) {
    console.error('[dashboard] domain expense totals failed:', e);
    return { monthly: 0, yearly: 0 };
  }
}

async function domainMonthlySeries(): Promise<Map<string, number>> {
  try {
    await ensureDomainsTable();
    const { rows } = await query(
      `SELECT to_char(m.month,'YYYY-MM') AS month, COALESCE(SUM(${DOMAIN_MONTHLY}),0) AS total FROM generate_series(date_trunc('month', CURRENT_DATE) - INTERVAL '11 months', date_trunc('month', CURRENT_DATE), INTERVAL '1 month') AS m(month) LEFT JOIN domains d ON COALESCE(d.purchase_date, d.created_at::date) < m.month + INTERVAL '1 month' AND d.status NOT IN ('cancelled','expired') GROUP BY 1 ORDER BY 1`,
    );
    return new Map(rows.map((r: any) => [r.month, Number(r.total)]));
  } catch (e) {
    console.error('[dashboard] domain expense series failed:', e);
    return new Map();
  }
}

export async function overview() {
  const [{ rows }, dom] = await Promise.all([
    query(
      `SELECT (SELECT COUNT(*)::int FROM categories) AS total_categories, COUNT(s.id)::int AS total_subscriptions, COUNT(s.id) FILTER (WHERE s.status='active')::int AS active_subscriptions, COUNT(s.id) FILTER (WHERE s.status='inactive')::int AS inactive_subscriptions, COALESCE(SUM(${M}) FILTER (WHERE s.status NOT IN ('cancelled','expired')),0) AS monthly_recurring, COALESCE(SUM(${M}) FILTER (WHERE s.status NOT IN ('cancelled','expired')),0)*12 AS yearly_recurring, COUNT(s.id) FILTER (WHERE s.auto_pay_enabled)::int AS auto_pay_enabled, COUNT(s.id) FILTER (WHERE s.next_renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' AND s.status NOT IN ('cancelled','expired'))::int AS upcoming_renewals FROM subscriptions s`,
    ),
    domainTotals(),
  ]);
  const r = rows[0];
  return {
    ...r,
    monthly_recurring: Number(r.monthly_recurring) + dom.monthly,
    yearly_recurring: Number(r.yearly_recurring) + dom.yearly,
  };
}

export async function expenses() {
  const [{ rows }, domMap] = await Promise.all([
    query(
      `SELECT to_char(m.month,'YYYY-MM') AS month, COALESCE(SUM(${M}),0) AS total FROM generate_series(date_trunc('month', CURRENT_DATE) - INTERVAL '11 months', date_trunc('month', CURRENT_DATE), INTERVAL '1 month') AS m(month) LEFT JOIN subscriptions s ON s.created_at < m.month + INTERVAL '1 month' AND s.status NOT IN ('cancelled','expired') GROUP BY 1 ORDER BY 1`,
    ),
    domainMonthlySeries(),
  ]);
  const map = new Map(rows.map((r: any) => [r.month, Number(r.total)]));
  const out: any[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    out.push({ month: key, label: d.toLocaleString('en', { month: 'short' }) + ' ' + d.getFullYear(), total: (map.get(key) || 0) + (domMap.get(key) || 0) });
  }
  return out;
}

export async function categoryBreakdown() {
  const { rows } = await query(
    `SELECT c.id, c.name, COALESCE(SUM(${M}) FILTER (WHERE s.status NOT IN ('cancelled','expired')),0) AS monthly_expense, COUNT(s.id)::int AS subscription_count FROM categories c LEFT JOIN subscriptions s ON s.category_id=c.id GROUP BY c.id ORDER BY monthly_expense DESC`,
  );
  return rows.map((r: any) => ({ ...r, monthly_expense: Number(r.monthly_expense) }));
}

export async function recentSubscriptions() {
  const { rows } = await query(
    `SELECT s.*, c.name AS category_name FROM subscriptions s JOIN categories c ON c.id=s.category_id ORDER BY s.created_at DESC LIMIT 5`,
  );
  return rows;
}

// ---- Renewals ----

export async function upcomingRenewals(days = 30) {
  const { rows } = await query(
    `SELECT s.*, c.name AS category_name FROM subscriptions s JOIN categories c ON c.id=s.category_id WHERE s.next_renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ($1 || ' days')::interval AND s.status NOT IN ('cancelled','expired') ORDER BY s.next_renewal_date ASC`,
    [String(days)],
  );
  return rows;
}

export async function overdueRenewals() {
  const { rows } = await query(
    `SELECT s.*, c.name AS category_name FROM subscriptions s JOIN categories c ON c.id=s.category_id WHERE s.next_renewal_date < CURRENT_DATE AND s.status NOT IN ('cancelled','expired') ORDER BY s.next_renewal_date ASC`,
  );
  return rows;
}

export async function groupedRenewals() {
  const [overdue, w7, w15, w30] = await Promise.all([
    overdueRenewals(),
    upcomingRenewals(7),
    upcomingRenewals(15),
    upcomingRenewals(30),
  ]);
  return { overdue, within7: w7, within15: w15, within30: w30 };
}
