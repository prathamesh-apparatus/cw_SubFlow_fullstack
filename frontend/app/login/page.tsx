'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { BarChart3, BellRing, Eye, EyeOff, Layers, Loader2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, LoginFormValues } from '@/lib/validations';
import { authService } from '@/services/auth.service';

const features = [
  { icon: Wallet, text: 'Every team subscription and recurring cost, tracked in one place' },
  { icon: BellRing, text: 'Renewal reminders before a charge ever surprises you' },
  { icon: BarChart3, text: 'Monthly and yearly spend analytics per category' },
];

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
    <main className="flex min-h-screen bg-background">
      {/* Branding panel — desktop only */}
      <aside className="sidebar-bg hidden w-[42%] flex-col justify-between p-10 lg:flex xl:p-14">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Layers className="h-6 w-6" />
          </span>
          <span className="text-xl font-bold tracking-tight">SubFlow</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">Every subscription.<br />One dashboard.</h1>
          <p className="mt-4 text-base opacity-70">The calm, central way to manage your organisation&apos;s SaaS tools, renewals and recurring spend.</p>
          <ul className="mt-10 space-y-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.text} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm leading-relaxed opacity-85">{f.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-xs opacity-50">Single-admin access · Secured with JWT in an HTTP-only cookie</p>
      </aside>

      {/* Sign-in form */}
      <section className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="items-center pt-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md lg:hidden">
              <Layers className="h-6 w-6" />
            </span>
            <CardTitle className="mt-2 text-2xl font-bold tracking-tight">Welcome to SubFlow</CardTitle>
            <p className="text-sm text-muted-foreground">Sign in to manage your subscriptions</p>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="admin@company.com" {...register('email')} className="mt-1.5" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative mt-1.5">
                  <Input type={show ? 'text' : 'password'} placeholder="••••••••" {...register('password')} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password visibility">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full shadow-sm">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign In'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Single-admin access. No public registration.</p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
