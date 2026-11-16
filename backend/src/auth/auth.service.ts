import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const { rows } = await this.db.query('SELECT password_hash FROM admins WHERE id=$1', [adminId]);
    const admin = rows[0];
    if (!admin || !(await bcrypt.compare(currentPassword, admin.password_hash))) throw new UnauthorizedException('Current password is incorrect');
    if (await bcrypt.compare(newPassword, admin.password_hash)) throw new BadRequestException('New password must be different from the current password');
    const hash = await bcrypt.hash(newPassword, 12);
    await this.db.query('UPDATE admins SET password_hash=$1 WHERE id=$2', [hash, adminId]);
    return true;
  }
  async updateEmail(adminId: string, email: string) {
    const { rows: existing } = await this.db.query('SELECT id FROM admins WHERE lower(email)=lower($1) AND id <> $2', [email, adminId]);
    if (existing.length) throw new ConflictException('This email is already in use');
    const { rows } = await this.db.query('UPDATE admins SET email=$1 WHERE id=$2 RETURNING id, email', [email, adminId]);
    const admin = rows[0];
    const token = await this.jwt.signAsync({ sub: admin.id, email: admin.email });
    return { admin: { id: admin.id, email: admin.email }, token };
  }
}
