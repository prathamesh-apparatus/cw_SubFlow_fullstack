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
    <div className="space-y-5 max-w-2xl">
      <Card><CardHeader><CardTitle>Account</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
        <div className="flex justify-between border-b py-2"><span className="text-muted-foreground">Admin Email</span><span className="font-medium">{admin?.email || 'Loading…'}</span></div>
        <div className="flex justify-between border-b py-2"><span className="text-muted-foreground">Role</span><span className="font-medium">Administrator (single-admin system)</span></div>
        <div className="flex justify-between py-2"><span className="text-muted-foreground">Authentication</span><span className="flex items-center gap-1 font-medium"><ShieldCheck className="h-4 w-4 text-green-600" /> JWT in HTTP-only cookie</span></div>
        <p className="text-xs text-muted-foreground">To change the admin email or password, update ADMIN_EMAIL / ADMIN_PASSWORD in your environment and re-run <code className="rounded bg-secondary px-1">npm run seed</code> in the backend — the seed upserts the single admin securely with bcrypt. There is no public registration.</p>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Application</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
        <div className="flex justify-between border-b py-2"><span className="text-muted-foreground">Application</span><span className="font-medium">SubFlow</span></div>
        <div className="flex justify-between border-b py-2"><span className="text-muted-foreground">Stack</span><span className="font-medium">Next.js · NestJS · PostgreSQL (native pg)</span></div>
        <div className="flex justify-between py-2"><span className="text-muted-foreground">Appearance</span><span className="font-medium">Edit design tokens in app/globals.css</span></div>
        <Button variant="destructive" onClick={logout}><LogOut className="h-4 w-4" /> Logout</Button>
      </CardContent></Card>
    </div>
  );
}
