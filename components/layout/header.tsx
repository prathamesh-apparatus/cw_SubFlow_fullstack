'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronRight, Menu, Search } from 'lucide-react';
import { notificationsService } from '@/services/notifications.service';
const segmentLabels: Record<string, string> = {
  categories: 'Categories',
  subscriptions: 'All Subscriptions',
  renewals: 'Upcoming Renewals',
  notifications: 'Notifications',
  settings: 'Settings',
  new: 'Add Subscription',
  edit: 'Edit',
};
export function Header({ email, onMenu }: { email?: string; onMenu: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () => { notificationsService.unreadCount().then((r) => { if (alive) setUnread(r.unread || 0); }).catch(() => {}); };
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, [pathname]);
  const onSearch = (e: React.FormEvent) => { e.preventDefault(); router.push(`/dashboard/subscriptions?q=${encodeURIComponent(query)}`); };
  const rest = pathname.split('/').filter(Boolean).slice(1);
  const crumbs: { label: string; href: string }[] = [{ label: 'SubFlow', href: '/dashboard' }];
  if (rest.length === 0) {
    crumbs.push({ label: 'Dashboard', href: '/dashboard' });
  } else {
    rest.forEach((seg, i) => {
      crumbs.push({ label: segmentLabels[seg] || 'Details', href: '/dashboard/' + rest.slice(0, i + 1).join('/') });
    });
  }
  return (
    <header className="sticky top-3 z-30 mt-3 px-3 sm:top-4 sm:mt-4 sm:px-4 lg:top-5 lg:mt-5 lg:px-5">
      <div className="flex items-center gap-3 rounded-2xl border bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.12)]">
        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white text-muted-foreground shadow-sm transition hover:text-foreground lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu className="h-4 w-4" /></button>
        <nav className="flex min-w-0 shrink-0 items-center gap-1.5" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c.label + c.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              <Link href={c.href} className={i === crumbs.length - 1 ? 'whitespace-nowrap text-[13px] font-medium text-emerald-700' : 'whitespace-nowrap text-[13px] text-muted-foreground transition hover:text-foreground'}>{c.label}</Link>
            </span>
          ))}
        </nav>
        <form onSubmit={onSearch} className="relative ml-auto hidden w-full max-w-md flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search subscriptions…" className="h-9 w-full rounded-lg bg-secondary pl-9 pr-3 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:bg-accent/60 focus:ring-2 focus:ring-emerald-600/25" />
        </form>
        <div className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 md:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Admin session</span>
          <Link href="/dashboard/notifications" aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full border bg-white text-muted-foreground shadow-sm transition hover:text-foreground">
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">{unread > 9 ? '9+' : unread}</span>}
          </Link>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">{(email || 'A').charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
}
