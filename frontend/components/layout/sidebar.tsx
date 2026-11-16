'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderOpen, CreditCard, CalendarClock, Settings, LogOut, Layers, X } from 'lucide-react';
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
      <aside className={cn('sidebar-bg fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-6 pb-2 pt-7">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-sm"><Layers className="h-5 w-5" /></span>
            <span className="text-xl font-bold tracking-tight">SubFlow</span>
          </Link>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition hover:text-foreground lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-4 w-4" /></button>
        </div>
        <p className="px-7 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Menu</p>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {links.map((l) => { const active = l.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(l.href); const Icon = l.icon; return <Link key={l.href} href={l.href} onClick={onClose} className={cn('flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition', active ? 'border bg-card font-semibold text-foreground shadow-sm' : 'border border-transparent font-medium text-muted-foreground hover:bg-white/70 hover:text-foreground')}><Icon className="h-[18px] w-[18px]" />{l.label}</Link>; })}
        </nav>
        <div className="p-4">
          <div className="rounded-3xl border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-3 px-2 pb-2 pt-1">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{(email || 'A').charAt(0).toUpperCase()}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-foreground">{email || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Link href="/dashboard/settings" onClick={onClose} className={cn('flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition hover:bg-accent', settingsActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}><Settings className="h-[18px] w-[18px]" />Settings</Link>
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"><LogOut className="h-[18px] w-[18px]" />Log out</button>
          </div>
        </div>
      </aside>
    </>
  );
}
