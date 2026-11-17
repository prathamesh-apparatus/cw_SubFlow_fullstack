'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { dashboardService } from '@/services/dashboard.service';
import { cn, daysUntil, formatCurrency, formatDate, pastelFor } from '@/lib/utils';
import type { Subscription } from '@/types';
export const dynamic = 'force-dynamic';
const PAGE_SIZE = 10;

type Bucket = 'overdue' | 'd7' | 'd15' | 'd30';
type Filter = 'all' | Bucket;
type Row = Subscription & { bucket: Bucket };

const BUCKET_META: Record<Bucket, { chipLabel: string; filterLabel: string; dot: string; chip: string }> = {
  overdue: { chipLabel: 'Overdue', filterLabel: 'Overdue', dot: 'bg-red-500', chip: 'bg-red-50 text-red-700 ring-red-600/15' },
  d7: { chipLabel: '≤ 7 days', filterLabel: 'Next 7 days', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  d15: { chipLabel: '≤ 15 days', filterLabel: 'Next 15 days', dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700 ring-sky-600/15' },
  d30: { chipLabel: '≤ 30 days', filterLabel: 'Next 30 days', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' },
};

function relativeLabel(d?: string | null): string {
  const days = daysUntil(d);
  if (days === null) return '';
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'today';
  if (days === 1) return 'in 1 day';
  return `in ${days} days`;
}

const TH = 'px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground';

export default function RenewalsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  useEffect(() => { dashboardService.renewalsGrouped().then(setData).catch(() => {}); }, []);

  // The API groups are cumulative (within15 includes within7, etc.) — flatten
  // them so each subscription appears exactly once, in its SMALLEST bucket.
  const rows: Row[] = useMemo(() => {
    if (!data) return [];
    const seen = new Map<string, Row>();
    const add = (items: Subscription[] | undefined, bucket: Bucket) => {
      (items || []).forEach((s) => { if (!seen.has(s.id)) seen.set(s.id, { ...s, bucket }); });
    };
    add(data.overdue, 'overdue');
    add(data.within7, 'd7');
    add(data.within15, 'd15');
    add(data.within30, 'd30');
    return Array.from(seen.values()).sort((a, b) => String(a.next_renewal_date || '9999').localeCompare(String(b.next_renewal_date || '9999')));
  }, [data]);

  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { overdue: 0, d7: 0, d15: 0, d30: 0 };
    rows.forEach((r) => { c[r.bucket] += 1; });
    return c;
  }, [rows]);

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.bucket === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { setPage(1); }, [filter]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!data) return <p className="py-12 text-center text-muted-foreground">Loading…</p>;

  const chips: { key: Filter; label: string; count: number; dot?: string }[] = [
    { key: 'all', label: 'All', count: rows.length },
    { key: 'overdue', label: BUCKET_META.overdue.filterLabel, count: counts.overdue, dot: BUCKET_META.overdue.dot },
    { key: 'd7', label: BUCKET_META.d7.filterLabel, count: counts.d7, dot: BUCKET_META.d7.dot },
    { key: 'd15', label: BUCKET_META.d15.filterLabel, count: counts.d15, dot: BUCKET_META.d15.dot },
    { key: 'd30', label: BUCKET_META.d30.filterLabel, count: counts.d30, dot: BUCKET_META.d30.dot },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Management</p>
        <h2 className="mt-1.5 text-xl font-medium tracking-tight text-foreground">Upcoming Renewals</h2>
        <p className="mt-1 text-sm text-muted-foreground">Stay ahead of every charge — overdue first, then what&apos;s coming up.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = filter === chip.key;
          return (
            <button key={chip.key} onClick={() => setFilter(chip.key)} className={cn('flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs shadow-sm transition', active ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-foreground/25')}>
              {chip.dot && <span className={cn('h-2 w-2 rounded-full', active ? 'bg-primary-foreground' : chip.dot)} />}
              <span className={active ? '' : 'text-muted-foreground'}>{chip.label}</span>
              <span className="font-medium">{chip.count}</span>
            </button>
          );
        })}
      </div>
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No upcoming renewals — nothing is overdue or due in the next 30 days.</p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No renewals in this window.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead>
                <tr className="bg-secondary/60">
                  <th className={cn(TH, 'py-2.5 pl-5 pr-3')}>Subscription</th>
                  <th className={TH}>Category</th>
                  <th className={TH}>Renewal</th>
                  <th className={TH}>Window</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Auto-Pay</th>
                  <th className={cn(TH, 'py-2.5 pl-3 pr-5')}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((s) => (
                  <tr key={s.id} onClick={() => router.push(`/dashboard/subscriptions?open=${s.id}`)} className="cursor-pointer border-t border-border/60 text-[13px] transition hover:bg-secondary/40">
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-semibold', pastelFor(s.name))}>{s.name.charAt(0).toUpperCase()}</span>
                        <div className="min-w-0">
                          <Link href={`/dashboard/subscriptions?open=${s.id}`} className="font-medium text-foreground hover:underline" onClick={(e) => e.stopPropagation()}>{s.name}</Link>
                          <p className="truncate text-[11px] text-muted-foreground">{s.account_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{s.category_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-medium text-foreground">{formatDate(s.next_renewal_date)}</span>
                      <span className="text-muted-foreground"> · {relativeLabel(s.next_renewal_date)}</span>
                    </td>
                    <td className="px-3 py-3"><span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', BUCKET_META[s.bucket].chip)}>{BUCKET_META[s.bucket].chipLabel}</span></td>
                    <td className="px-3 py-3 font-medium text-foreground">{formatCurrency(s.total_amount, s.currency)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{s.auto_pay_enabled ? 'Yes' : 'No'}</td>
                    <td className="py-3 pl-3 pr-5"><Badge>{s.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} alwaysShow />
    </div>
  );
}
