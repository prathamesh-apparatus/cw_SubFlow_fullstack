import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
@Injectable()
export class SubscriptionsService {
  constructor(private db: DatabaseService) {}
  private cols(dto: any) {
    const total = Number(dto.price || 0) + Number(dto.tax_amount || 0);
    return [dto.category_id, dto.name, dto.description || null, dto.website_url || null, dto.account_email, dto.account_username || null, dto.price, dto.currency || 'INR', dto.billing_cycle, dto.custom_billing_days || null, dto.tax_amount || 0, total, dto.payment_method || null, !!dto.auto_pay_enabled, dto.payment_status || 'pending', dto.payment_notes || null, dto.start_date || null, dto.last_payment_date || null, dto.next_renewal_date || null, dto.end_date || null, dto.renewal_reminder !== false, dto.reminder_days_before || 7, dto.status || 'active', !!dto.auto_renewal_enabled, dto.notes || null];
  }
  async create(dto: any) {
    const client = await this.db.pool.connect();
    try {
      await client.query('BEGIN');
      const vals = this.cols(dto);
      const { rows } = await client.query(`INSERT INTO subscriptions (category_id,name,description,website_url,account_email,account_username,price,currency,billing_cycle,custom_billing_days,tax_amount,total_amount,payment_method,auto_pay_enabled,payment_status,payment_notes,start_date,last_payment_date,next_renewal_date,end_date,renewal_reminder,reminder_days_before,status,auto_renewal_enabled,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) RETURNING *`, vals);
      const sub = rows[0];
      if (sub.last_payment_date) await client.query('INSERT INTO payment_history (subscription_id,amount,currency,payment_date,payment_method,payment_status) VALUES ($1,$2,$3,$4,$5,$6)', [sub.id, sub.total_amount, sub.currency, sub.last_payment_date, sub.payment_method, sub.payment_status]);
      await client.query('COMMIT');
      return this.findOne(sub.id);
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }
  async findAll(q: any = {}) {
    const page = Math.max(1, parseInt(q.page || '1', 10)); const limit = Math.min(100, Math.max(1, parseInt(q.limit || '10', 10)));
    const where: string[] = []; const params: any[] = [];
    const add = (cond: string, val: any) => { params.push(val); where.push(cond.replace('?', `$${params.length}`)); };
    if (q.search) { params.push(`%${q.search}%`); where.push(`(s.name ILIKE $${params.length} OR s.account_email ILIKE $${params.length})`); }
    if (q.category_id) add('s.category_id = ?', q.category_id);
    if (q.billing_cycle) add('s.billing_cycle = ?', q.billing_cycle);
    if (q.payment_status) add('s.payment_status = ?', q.payment_status);
    if (q.status) add('s.status = ?', q.status);
    if (q.auto_pay_enabled !== undefined && q.auto_pay_enabled !== '') add('s.auto_pay_enabled = ?', q.auto_pay_enabled === 'true' || q.auto_pay_enabled === true);
    const sortMap: Record<string,string> = { price_asc: 's.total_amount ASC', price_desc: 's.total_amount DESC', renewal_asc: 's.next_renewal_date ASC NULLS LAST', renewal_desc: 's.next_renewal_date DESC NULLS LAST', created_desc: 's.created_at DESC', created_asc: 's.created_at ASC' };
    const order = sortMap[q.sort] || 's.created_at DESC';
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const totalRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM subscriptions s ${whereSql}`, params);
    const offset = (page - 1) * limit;
    const { rows } = await this.db.query(`SELECT s.*, c.name AS category_name FROM subscriptions s JOIN categories c ON c.id=s.category_id ${whereSql} ORDER BY ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
    return { items: rows, total: totalRes.rows[0].total, page, limit, totalPages: Math.ceil(totalRes.rows[0].total / limit) || 1 };
  }
  async findOne(id: string) {
    const { rows } = await this.db.query('SELECT s.*, c.name AS category_name FROM subscriptions s JOIN categories c ON c.id=s.category_id WHERE s.id=$1', [id]);
    if (!rows[0]) throw new NotFoundException('Subscription not found');
    return rows[0];
  }
  async update(id: string, dto: any) {
    const old = await this.findOne(id);
    const vals = this.cols(dto);
    const { rows } = await this.db.query(`UPDATE subscriptions SET category_id=$1,name=$2,description=$3,website_url=$4,account_email=$5,account_username=$6,price=$7,currency=$8,billing_cycle=$9,custom_billing_days=$10,tax_amount=$11,total_amount=$12,payment_method=$13,auto_pay_enabled=$14,payment_status=$15,payment_notes=$16,start_date=$17,last_payment_date=$18,next_renewal_date=$19,end_date=$20,renewal_reminder=$21,reminder_days_before=$22,status=$23,auto_renewal_enabled=$24,notes=$25,updated_at=NOW() WHERE id=$26 RETURNING *`, [...vals, id]);
    const sub = rows[0];
    const oldDate = old.last_payment_date ? new Date(old.last_payment_date).toISOString().slice(0,10) : null;
    const newDate = sub.last_payment_date ? new Date(sub.last_payment_date).toISOString().slice(0,10) : null;
    if (newDate && newDate !== oldDate) await this.db.query('INSERT INTO payment_history (subscription_id,amount,currency,payment_date,payment_method,payment_status) VALUES ($1,$2,$3,$4,$5,$6)', [sub.id, sub.total_amount, sub.currency, sub.last_payment_date, sub.payment_method, sub.payment_status]);
    return this.findOne(id);
  }
  async remove(id: string) { await this.findOne(id); await this.db.query('DELETE FROM subscriptions WHERE id=$1', [id]); return { deleted: true }; }
}
