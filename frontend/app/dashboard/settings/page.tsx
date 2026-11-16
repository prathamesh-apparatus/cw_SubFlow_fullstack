'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import type { Admin } from '@/types';
export const dynamic = 'force-dynamic';
export default function SettingsPage() {
  const router = useRouter(); const [admin, setAdmin] = useState<Admin | null>(null);
  useEffect(() => { authService.me().then(setAdmin).catch(() => {}); }, []);
  const logout = async () => { try { await authService.logout(); } catch {} router.push('/login'); };
  return (
    <div className="space-y-5">
      <div>
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />System</p>
        <h2 className="mt-1.5 text-xl font-medium tracking-tight text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your admin account and application details.</p>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">{(admin?.email || 'A').charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{admin?.email || 'Loading…'}</p>
                <p className="text-[11px] text-muted-foreground">Administrator</p>
              </div>
              <span className="rounded-md bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700">ADMIN</span>
            </div>
            <div className="mt-4 text-[13px]">
              <div className="flex justify-between gap-4 border-b py-2.5"><span className="text-muted-foreground">Admin Email</span><span className="truncate font-medium">{admin?.email || 'Loading…'}</span></div>
              <div className="flex justify-between gap-4 border-b py-2.5"><span className="text-muted-foreground">Role</span><span className="font-medium">Administrator (single-admin system)</span></div>
              <div className="flex justify-between gap-4 py-2.5"><span className="text-muted-foreground">Authentication</span><span className="flex items-center gap-1 font-medium"><ShieldCheck className="h-4 w-4 text-emerald-700" /> JWT in HTTP-only cookie</span></div>
            </div>
            <p className="mt-3 rounded-lg bg-secondary/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">To change the admin email or password, update ADMIN_EMAIL / ADMIN_PASSWORD in your environment and re-run <code className="rounded bg-card px-1">npm run seed</code> in the backend — the seed upserts the single admin securely with bcrypt. There is no public registration.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Application</CardTitle></CardHeader>
          <CardContent>
            <div className="text-[13px]">
              <div className="flex justify-between gap-4 border-b py-2.5"><span className="text-muted-foreground">Application</span><span className="font-medium">SubFlow</span></div>
              <div className="flex justify-between gap-4 border-b py-2.5"><span className="text-muted-foreground">Stack</span><span className="font-medium">Next.js · NestJS · PostgreSQL (native pg)</span></div>
              <div className="flex justify-between gap-4 py-2.5"><span className="text-muted-foreground">Appearance</span><span className="font-medium">Edit design tokens in app/globals.css</span></div>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"><LogOut className="h-4 w-4" /> Logout</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
