import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
const M = `CASE s.billing_cycle WHEN 'monthly' THEN s.total_amount WHEN 'quarterly' THEN s.total_amount/3 WHEN 'half_yearly' THEN s.total_amount/6 WHEN 'yearly' THEN s.total_amount/12 WHEN 'custom' THEN s.total_amount * 30.4375 / NULLIF(s.custom_billing_days,0) ELSE s.total_amount END`;
@Injectable()
export class DashboardService {
  constructor(private db: DatabaseService) {}
  async overview() {
    const { rows } = await this.db.query(`SELECT (SELECT COUNT(*)::int FROM categories) AS total_categories, COUNT(s.id)::int AS total_subscriptions, COUNT(s.id) FILTER (WHERE s.status='active')::int AS active_subscriptions, COUNT(s.id) FILTER (WHERE s.status='inactive')::int AS inactive_subscriptions, COALESCE(SUM(${M}) FILTER (WHERE s.status NOT IN ('cancelled','expired')),0) AS monthly_recurring, COALESCE(SUM(${M}) FILTER (WHERE s.status NOT IN ('cancelled','expired')),0)*12 AS yearly_recurring, COUNT(s.id) FILTER (WHERE s.auto_pay_enabled)::int AS auto_pay_enabled, COUNT(s.id) FILTER (WHERE s.next_renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' AND s.status NOT IN ('cancelled','expired'))::int AS upcoming_renewals FROM subscriptions s`);
    return rows[0];
  }
  async expenses() {
    const { rows } = await this.db.query(`SELECT to_char(date_trunc('month', payment_date),'YYYY-MM') AS month, COALESCE(SUM(amount),0) AS total FROM payment_history WHERE payment_date >= (date_trunc('month', CURRENT_DATE) - INTERVAL '11 months') GROUP BY 1 ORDER BY 1`);
    const map = new Map(rows.map((r: any) => [r.month, Number(r.total)]));
    const out: any[] = []; const now = new Date();
    for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); out.push({ month: key, label: d.toLocaleString('en',{month:'short'})+' '+d.getFullYear(), total: map.get(key) || 0 }); }
    return out;
  }
  async categoryBreakdown() {
    const { rows } = await this.db.query(`SELECT c.id, c.name, COALESCE(SUM(${M}) FILTER (WHERE s.status NOT IN ('cancelled','expired')),0) AS monthly_expense, COUNT(s.id)::int AS subscription_count FROM categories c LEFT JOIN subscriptions s ON s.category_id=c.id GROUP BY c.id ORDER BY monthly_expense DESC`);
    return rows.map((r: any) => ({ ...r, monthly_expense: Number(r.monthly_expense) }));
  }
  async recent() { const { rows } = await this.db.query(`SELECT s.*, c.name AS category_name FROM subscriptions s JOIN categories c ON c.id=s.category_id ORDER BY s.created_at DESC LIMIT 5`); return rows; }
}
