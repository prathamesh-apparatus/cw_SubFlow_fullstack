import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
@Injectable()
export class RenewalsService {
  constructor(private db: DatabaseService) {}
  async upcoming(days = 30) { const { rows } = await this.db.query(`SELECT s.*, c.name AS category_name FROM subscriptions s JOIN categories c ON c.id=s.category_id WHERE s.next_renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ($1 || ' days')::interval AND s.status NOT IN ('cancelled','expired') ORDER BY s.next_renewal_date ASC`, [String(days)]); return rows; }
  async overdue() { const { rows } = await this.db.query(`SELECT s.*, c.name AS category_name FROM subscriptions s JOIN categories c ON c.id=s.category_id WHERE s.next_renewal_date < CURRENT_DATE AND s.status NOT IN ('cancelled','expired') ORDER BY s.next_renewal_date ASC`); return rows; }
  async grouped() { const [overdue, w7, w15, w30] = await Promise.all([this.overdue(), this.upcoming(7), this.upcoming(15), this.upcoming(30)]); return { overdue, within7: w7, within15: w15, within30: w30 }; }
  async all() { return this.grouped(); }
}
