'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Menu, Search } from 'lucide-react';
export function Header({ title, email, onMenu }: { title: string; email?: string; onMenu: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const onSearch = (e: React.FormEvent) => { e.preventDefault(); router.push(`/dashboard/subscriptions?q=${encodeURIComponent(query)}`); };
  return (
    <header className="sticky top-3 z-30 mt-3 px-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 rounded-2xl border bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.12)]">
        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white text-muted-foreground shadow-sm transition hover:text-foreground lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu className="h-4 w-4" /></button>
        <nav className="flex shrink-0 items-center gap-1.5" aria-label="Breadcrumb">
          <span className="text-[13px] text-muted-foreground">SubFlow</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[13px] font-semibold text-emerald-700">{title}</span>
        </nav>
        <form onSubmit={onSearch} className="relative ml-auto hidden w-full max-w-md flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search subscriptions…" className="h-9 w-full rounded-lg bg-secondary pl-9 pr-3 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:bg-accent/60 focus:ring-2 focus:ring-emerald-600/25" />
        </form>
        <div className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 md:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Admin session</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">{(email || 'A').charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
}
