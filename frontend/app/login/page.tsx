'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, LoginFormValues } from '@/lib/validations';
import { authService } from '@/services/auth.service';
export default function LoginPage() {
  const router = useRouter(); const [show, setShow] = useState(false); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (v: LoginFormValues) => { setLoading(true); setError(''); try { await authService.login(v.email, v.password); router.push('/dashboard'); router.refresh(); } catch (e: any) { setError(e.message || 'Login failed'); } finally { setLoading(false); } };
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="items-center text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Layers className="h-6 w-6" /></span>
          <CardTitle className="text-2xl mt-2">Welcome to SubFlow</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to manage your subscriptions</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
            <div><Label>Email</Label><Input type="email" placeholder="admin@company.com" {...register('email')} className="mt-1.5" />{errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}</div>
            <div><Label>Password</Label><div className="relative mt-1.5"><Input type={show ? 'text' : 'password'} placeholder="••••••••" {...register('password')} /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle password visibility">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}</div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign In'}</Button>
            <p className="text-center text-xs text-muted-foreground">Single-admin access. No public registration.</p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
