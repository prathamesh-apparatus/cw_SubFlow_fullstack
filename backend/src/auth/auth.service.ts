import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
@Injectable()
export class AuthService {
  constructor(private db: DatabaseService, private jwt: JwtService) {}
  async validateAdmin(email: string, password: string) {
    const { rows } = await this.db.query('SELECT id, email, password_hash FROM admins WHERE lower(email)=lower($1) LIMIT 1', [email]);
    const admin = rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) throw new UnauthorizedException('Invalid email or password');
    return admin;
  }
  async login(email: string, password: string) {
    const admin = await this.validateAdmin(email, password);
    const token = await this.jwt.signAsync({ sub: admin.id, email: admin.email });
    return { token, admin: { id: admin.id, email: admin.email } };
  }
}
