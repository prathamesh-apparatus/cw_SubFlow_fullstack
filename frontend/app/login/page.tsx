'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Layers, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, LoginFormValues } from '@/lib/validations';
import { authService } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (v: LoginFormValues) => {
    setLoading(true);
    try {
      await authService.login(v.email, v.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
    } catch (e: any) {
      const msg: string = e?.message || 'Login failed';
      const isNetwork = e?.status === 0 || /failed to fetch|network|fetch/i.test(msg);
      if (isNetwork) toast.error('Cannot reach the server — please make sure the backend is running.');
      else if (e?.status === 401) toast.error(msg || 'Invalid email or password');
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-backdrop flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md rounded-[1.5rem] border bg-card p-8 shadow-[0_24px_64px_-20px_rgba(28,25,23,0.28)] sm:p-10">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-md">
            <Layers className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-[26px] font-bold leading-tight tracking-tight text-foreground">Welcome to SubFlow</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to manage your subscriptions</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input type="email" placeholder="admin@company.com" {...register('email')} className="mt-1.5" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
            <div className="relative mt-1.5">
              <Input type={show ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className="pr-11" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground" aria-label="Toggle password visibility">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={loading} className="h-11 w-full text-[15px]">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign In'}
          </Button>
          <p className="pt-1 text-center text-xs text-muted-foreground">Single-admin access. No public registration.</p>
        </form>
      </div>
    </main>
  );
}
