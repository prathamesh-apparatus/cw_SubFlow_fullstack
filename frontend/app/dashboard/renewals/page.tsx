'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { dashboardService } from '@/services/dashboard.service';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Subscription } from '@/types';
export const dynamic = 'force-dynamic';
const PAGE_SIZE = 10;

function RenewalGroup({ title, items, dot }: { title: string; items: Subscription[]; dot: string }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <section>
      <div className="flex items-center gap-2.5 px-5 py-3.5">
        <span className={cn('h-2 w-2 rounded-full', dot)} />
        <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="px-5 pb-3.5 text-xs text-muted-foreground">No renewals in this window.</p>
      ) : (
        <>
          <div className="divide-y divide-border/60 border-t border-border/60">
            {pageItems.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-[13px]">
                <div>
                  <Link href={`/dashboard/subscriptions/${s.id}`} className="font-medium text-foreground hover:underline">{s.name}</Link>
                  <p className="text-xs text-muted-foreground">{s.category_name} · {s.account_email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span>{formatDate(s.next_renewal_date)}</span>
                  <span className="font-medium">{formatCurrency(s.total_amount, s.currency)}</span>
                  <span className="text-xs text-muted-foreground">Auto-Pay: {s.auto_pay_enabled ? 'Yes' : 'No'}</span>
                  <Badge>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && <div className="px-5 pb-3"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>}
        </>
      )}
    </section>
  );
}

export default function RenewalsPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { dashboardService.renewalsGrouped().then(setData).catch(() => {}); }, []);
  if (!data) return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  const groups: { title: string; short: string; items: Subscription[]; dot: string }[] = [
    { title: 'Overdue', short: 'Overdue', items: data.overdue || [], dot: 'bg-red-500' },
    { title: 'Renewing in the next 7 days', short: 'Next 7 days', items: data.within7 || [], dot: 'bg-amber-500' },
    { title: 'Renewing in the next 15 days', short: 'Next 15 days', items: data.within15 || [], dot: 'bg-sky-500' },
    { title: 'Renewing in the next 30 days', short: 'Next 30 days', items: data.within30 || [], dot: 'bg-emerald-500' },
  ];
  return (
    <div className="space-y-4">
      <div>
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Management</p>
        <h2 className="mt-1.5 text-xl font-medium tracking-tight text-foreground">Upcoming Renewals</h2>
        <p className="mt-1 text-sm text-muted-foreground">Stay ahead of every charge — overdue first, then what&apos;s coming up.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <span key={g.title} className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs shadow-sm">
            <span className={cn('h-2 w-2 rounded-full', g.dot)} />
            <span className="text-muted-foreground">{g.short}</span>
            <span className="font-medium text-foreground">{g.items.length}</span>
          </span>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {groups.map((g) => (
            <RenewalGroup key={g.title} title={g.title} items={g.items} dot={g.dot} />
          ))}
        </div>
      </Card>
    </div>
  );
}
