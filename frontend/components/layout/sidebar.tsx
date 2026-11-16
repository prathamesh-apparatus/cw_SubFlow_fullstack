'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderOpen, CreditCard, CalendarClock, Settings, LogOut, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { authService } from '@/services/auth.service';
import { cn } from '@/lib/utils';
const sections = [
  {
    label: 'Workspace',
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Management',
    links: [
      { href: '/dashboard/categories', label: 'Categories', icon: FolderOpen },
      { href: '/dashboard/subscriptions', label: 'All Subscriptions', icon: CreditCard },
      { href: '/dashboard/renewals', label: 'Upcoming Renewals', icon: CalendarClock },
    ],
  },
  {
    label: 'System',
    links: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname(); const router = useRouter();
  const [email, setEmail] = useState('');
  useEffect(() => { authService.me().then((a) => setEmail(a.email)).catch(() => {}); }, []);
  const logout = async () => { try { await authService.logout(); } catch {} router.push('/login'); };
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" onClick={onClose} />}
      <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-white p-4 shadow-[10px_0_36px_-16px_rgba(16,24,40,0.18)] transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="px-1 pt-1">
          <div className="flex items-start justify-between gap-2">
            <Link href="/dashboard" aria-label="SubFlow — Dashboard">
              <Logo />
            </Link>
            <div className="flex items-center gap-2 pt-1">
              <span className="rounded-md bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700">ADMIN</span>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition hover:text-foreground lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <p className="pl-1 pt-1.5 text-[11px] text-muted-foreground">Subscription Manager</p>
        </div>
        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
          {sections.map((s) => (
            <div key={s.label}>
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
              <div className="space-y-0.5">
                {s.links.map((l) => { const active = l.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(l.href); const Icon = l.icon; return <Link key={l.href} href={l.href} onClick={onClose} className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition', active ? 'bg-emerald-600/10 font-medium text-emerald-800' : 'text-zinc-600 hover:bg-secondary hover:text-foreground')}><Icon className={cn('h-[18px] w-[18px]', active && 'text-emerald-700')} />{l.label}</Link>; })}
              </div>
            </div>
          ))}
        </nav>
        <div className="pt-4">
          <div className="flex items-center gap-2.5 rounded-2xl border bg-background p-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">{(email || 'A').charAt(0).toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium leading-tight text-foreground">{email || 'Admin'}</p>
              <p className="text-[11px] text-muted-foreground">Administrator</p>
            </div>
            <button onClick={logout} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="Log out"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
