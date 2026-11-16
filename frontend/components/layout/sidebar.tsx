'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderOpen, CreditCard, CalendarClock, Settings, LogOut, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { authService } from '@/services/auth.service';
import { cn } from '@/lib/utils';
const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/categories', label: 'Categories', icon: FolderOpen },
  { href: '/dashboard/subscriptions', label: 'All Subscriptions', icon: CreditCard },
  { href: '/dashboard/renewals', label: 'Upcoming Renewals', icon: CalendarClock },
];
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname(); const router = useRouter();
  const [email, setEmail] = useState('');
  useEffect(() => { authService.me().then((a) => setEmail(a.email)).catch(() => {}); }, []);
  const logout = async () => { try { await authService.logout(); } catch {} router.push('/login'); };
  const settingsActive = pathname.startsWith('/dashboard/settings');
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" onClick={onClose} />}
      <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-white p-4 shadow-[10px_0_36px_-16px_rgba(16,24,40,0.18)] transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-start justify-between gap-2 px-1 pt-1">
          <Link href="/dashboard" aria-label="SubFlow — Dashboard">
            <Logo />
          </Link>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition hover:text-foreground lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-4 w-4" /></button>
        </div>
        <nav className="mt-6 flex-1 overflow-y-auto">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Menu</p>
          <div className="space-y-0.5">
            {links.map((l) => { const active = l.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(l.href); const Icon = l.icon; return <Link key={l.href} href={l.href} onClick={onClose} className={cn('flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[13px] transition', active ? 'bg-emerald-600/10 font-medium text-emerald-800' : 'text-zinc-600 hover:bg-secondary hover:text-foreground')}><Icon className={cn('h-[18px] w-[18px]', active && 'text-emerald-700')} />{l.label}</Link>; })}
          </div>
        </nav>
        <div className="pt-4">
          <div className="rounded-2xl border bg-background p-3 shadow-sm">
            <div className="flex items-center gap-2.5 px-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">{(email || 'A').charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium leading-tight text-foreground">{email || 'Admin'}</p>
                <p className="text-[11px] text-muted-foreground">Administrator</p>
              </div>
            </div>
            <div className="my-2.5 border-t border-border" />
            <Link href="/dashboard/settings" onClick={onClose} className={cn('flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition', settingsActive ? 'font-medium text-emerald-800' : 'text-zinc-600 hover:bg-white hover:text-foreground')}><Settings className={cn('h-4 w-4', settingsActive && 'text-emerald-700')} />Settings</Link>
            <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] text-zinc-600 transition hover:bg-white hover:text-foreground"><LogOut className="h-4 w-4" />Log out</button>
          </div>
        </div>
      </aside>
    </>
  );
}
