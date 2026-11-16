'use client';
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
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname(); const router = useRouter();
  const logout = async () => { try { await authService.logout(); } catch {} router.push('/login'); };
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={cn('sidebar-bg fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Layers className="h-5 w-5" /></span>SubFlow</Link>
          <button className="lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {links.map((l) => { const active = l.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(l.href); const Icon = l.icon; return <Link key={l.href} href={l.href} onClick={onClose} className={cn('flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium opacity-80 hover:bg-white/10 hover:opacity-100', active && 'bg-white/10 opacity-100')}><Icon className="h-4 w-4" />{l.label}</Link>; })}
        </nav>
        <div className="p-3 border-t border-white/10"><button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium opacity-80 hover:bg-white/10 hover:opacity-100"><LogOut className="h-4 w-4" />Logout</button></div>
      </aside>
    </>
  );
}
