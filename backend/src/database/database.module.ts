import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from './database.constants';
import { DatabaseService } from './database.service';
@Global()
@Module({
  providers: [
    { provide: DATABASE_POOL, useFactory: () => new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      database: process.env.DATABASE_NAME || 'subflow',
      user: process.env.DATABASE_USER || 'subflow',
      password: process.env.DATABASE_PASSWORD || '',
      max: 10,
    })},
    DatabaseService,
  ],
  exports: [DatabaseService, DATABASE_POOL],
})
export class DatabaseModule {}
