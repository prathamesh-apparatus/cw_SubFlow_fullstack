'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { changePasswordSchema, ChangePasswordValues, profileEmailSchema, ProfileEmailValues } from '@/lib/validations';
import toast from 'react-hot-toast';
export const dynamic = 'force-dynamic';

function PasswordField({ label, show, onToggle, error, helper, children }: { label: string; show: boolean; onToggle: () => void; error?: string; helper?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1.5">
        {children}
        <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground" aria-label="Toggle password visibility">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {helper && !error && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailForm = useForm<ProfileEmailValues>({ resolver: zodResolver(profileEmailSchema), defaultValues: { email: '' } });
  const pwForm = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  useEffect(() => { authService.me().then((a) => { setEmail(a.email); emailForm.reset({ email: a.email }); }).catch(() => {}); }, []);

  const onEmailSubmit = async (v: ProfileEmailValues) => {
    try { const updated = await authService.updateProfile(v.email); setEmail(updated.email); emailForm.reset({ email: updated.email }); toast.success('Email updated'); }
    catch (e: any) { toast.error(e.message || 'Failed to update email'); }
  };
  const onPasswordSubmit = async (v: ChangePasswordValues) => {
    try { await authService.changePassword(v.currentPassword, v.newPassword); toast.success('Password changed successfully'); pwForm.reset(); setShowCurrent(false); setShowNew(false); setShowConfirm(false); }
    catch (e: any) { toast.error(e.message || 'Failed to change password'); }
  };
  const logout = async () => { try { await authService.logout(); } catch {} router.push('/login'); };

  return (
    <div className="space-y-5">
      <div>
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />System</p>
        <h2 className="mt-1.5 text-xl font-medium tracking-tight text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and security.</p>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">{(email || 'A').charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{email || 'Loading…'}</p>
                <p className="text-[11px] text-muted-foreground">Administrator</p>
              </div>
              <span className="rounded-md bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700">ADMIN</span>
            </div>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="mt-5 space-y-3">
              <div>
                <Label>Admin email</Label>
                <Input type="email" {...emailForm.register('email')} placeholder="admin@company.com" className="mt-1.5" />
                {emailForm.formState.errors.email ? <p className="mt-1 text-xs text-destructive">{emailForm.formState.errors.email.message}</p> : <p className="mt-1 text-xs text-muted-foreground">This email is used to sign in to SubFlow.</p>}
              </div>
              <Button type="submit" size="sm" disabled={emailForm.formState.isSubmitting}>{emailForm.formState.isSubmitting ? 'Saving…' : 'Save'}</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Security</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <PasswordField label="Current password" show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} error={pwForm.formState.errors.currentPassword?.message}>
                <Input type={showCurrent ? 'text' : 'password'} {...pwForm.register('currentPassword')} placeholder="••••••••" className="pr-11" autoComplete="current-password" />
              </PasswordField>
              <PasswordField label="New password" show={showNew} onToggle={() => setShowNew(!showNew)} error={pwForm.formState.errors.newPassword?.message} helper="At least 8 characters.">
                <Input type={showNew ? 'text' : 'password'} {...pwForm.register('newPassword')} placeholder="••••••••" className="pr-11" autoComplete="new-password" />
              </PasswordField>
              <PasswordField label="Confirm new password" show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} error={pwForm.formState.errors.confirmPassword?.message}>
                <Input type={showConfirm ? 'text' : 'password'} {...pwForm.register('confirmPassword')} placeholder="••••••••" className="pr-11" autoComplete="new-password" />
              </PasswordField>
              <Button type="submit" size="sm" disabled={pwForm.formState.isSubmitting}>{pwForm.formState.isSubmitting ? 'Changing…' : 'Change Password'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">Signed in as {email || '…'}</p>
        <Button variant="outline" size="sm" onClick={logout} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"><LogOut className="h-4 w-4" /> Logout</Button>
      </div>
    </div>
  );
}
