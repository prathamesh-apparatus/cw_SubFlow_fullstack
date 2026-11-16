import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
const MONTHLY = `CASE s.billing_cycle WHEN 'monthly' THEN s.total_amount WHEN 'quarterly' THEN s.total_amount/3 WHEN 'half_yearly' THEN s.total_amount/6 WHEN 'yearly' THEN s.total_amount/12 WHEN 'custom' THEN s.total_amount * 30.4375 / NULLIF(s.custom_billing_days,0) ELSE s.total_amount END`;
@Injectable()
export class CategoriesService {
  constructor(private db: DatabaseService) {}
  async findAll(search = '', sort = 'name_asc') {
    const order: Record<string,string> = { name_asc: 'c.name ASC', name_desc: 'c.name DESC', created_desc: 'c.created_at DESC', created_asc: 'c.created_at ASC', expense_desc: 'total_monthly_expense DESC' };
    const { rows } = await this.db.query(`SELECT c.*, COUNT(s.id)::int AS subscription_count, COALESCE(SUM(${MONTHLY}) FILTER (WHERE s.status NOT IN ('cancelled','expired')),0) AS total_monthly_expense FROM categories c LEFT JOIN subscriptions s ON s.category_id=c.id WHERE ($1='' OR c.name ILIKE '%'||$1||'%' OR c.description ILIKE '%'||$1||'%') GROUP BY c.id ORDER BY ${order[sort] || 'c.name ASC'}`, [search]);
    return rows;
  }
  async findOne(id: string) {
    const { rows } = await this.db.query(`SELECT c.*, COUNT(s.id)::int AS subscription_count FROM categories c LEFT JOIN subscriptions s ON s.category_id=c.id WHERE c.id=$1 GROUP BY c.id`, [id]);
    if (!rows[0]) throw new NotFoundException('Category not found');
    return rows[0];
  }
  async create(dto: any) {
    try { const { rows } = await this.db.query('INSERT INTO categories (name, description) VALUES ($1,$2) RETURNING *', [dto.name, dto.description || null]); return rows[0]; }
    catch (e: any) { if (e.code === '23505') throw new ConflictException('Category with this name already exists'); throw e; }
  }
  async update(id: string, dto: any) {
    await this.findOne(id);
    const { rows } = await this.db.query('UPDATE categories SET name=COALESCE($2,name), description=COALESCE($3,description), updated_at=NOW() WHERE id=$1 RETURNING *', [id, dto.name ?? null, dto.description ?? null]);
    return rows[0];
  }
  async remove(id: string) {
    await this.findOne(id);
    const { rows } = await this.db.query('SELECT COUNT(*)::int AS count FROM subscriptions WHERE category_id=$1', [id]);
    if (rows[0].count > 0) throw new ConflictException(`Cannot delete category: ${rows[0].count} subscription(s) are associated. Reassign or delete them first.`);
    await this.db.query('DELETE FROM categories WHERE id=$1', [id]);
    return { deleted: true };
  }
}
