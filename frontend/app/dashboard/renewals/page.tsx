'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboardService } from '@/services/dashboard.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Subscription } from '@/types';
export const dynamic = 'force-dynamic';
export default function RenewalsPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { dashboardService.renewalsGrouped().then(setData).catch(() => {}); }, []);
  if (!data) return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  const groups: { title: string; items: Subscription[]; tone: string }[] = [
    { title: 'Overdue', items: data.overdue || [], tone: 'text-destructive' },
    { title: 'Renewing in the next 7 days', items: data.within7 || [], tone: 'text-amber-600' },
    { title: 'Renewing in the next 15 days', items: data.within15 || [], tone: '' },
    { title: 'Renewing in the next 30 days', items: data.within30 || [], tone: '' },
  ];
  return <div className="space-y-5"><div><h2 className="text-xl font-semibold tracking-tight text-foreground">Upcoming Renewals</h2><p className="mt-1 text-sm text-muted-foreground">Stay ahead of every charge — overdue first, then what&apos;s coming up.</p></div>{groups.map((g) => <Card key={g.title}><CardHeader><CardTitle className={g.tone}>{g.title} <span className="text-sm font-normal text-muted-foreground">({g.items.length})</span></CardTitle></CardHeader><CardContent>{g.items.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">Nothing here.</p> : <div className="divide-y">{g.items.map((s) => <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><div><Link href={`/dashboard/subscriptions/${s.id}`} className="font-medium hover:underline">{s.name}</Link><p className="text-xs text-muted-foreground">{s.category_name} · {s.account_email}</p></div><div className="flex items-center gap-3 text-sm"><span>{formatDate(s.next_renewal_date)}</span><span className="font-medium">{formatCurrency(s.total_amount, s.currency)}</span><span className="text-xs text-muted-foreground">Auto-Pay: {s.auto_pay_enabled ? 'Yes' : 'No'}</span><Badge>{s.status}</Badge></div></div>)}</div>}</CardContent></Card>)}</div>;
}
