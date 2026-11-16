import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from './database.constants';
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(@Inject(DATABASE_POOL) public readonly pool: Pool) {}
  query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number | null }> {
    return this.pool.query(text, params) as any;
  }
  async onModuleDestroy() { await this.pool.end(); }
}
