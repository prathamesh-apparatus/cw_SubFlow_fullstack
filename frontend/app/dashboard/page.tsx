'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderOpen, CreditCard, CheckCircle2, XCircle, IndianRupee, CalendarClock, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpensesChart, CategoryDonut } from '@/components/dashboard/charts';
import { dashboardService } from '@/services/dashboard.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Overview, Subscription } from '@/types';
export const dynamic = 'force-dynamic';
export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [recent, setRecent] = useState<Subscription[]>([]);
  const [renewals, setRenewals] = useState<any>(null);
  const [tab, setTab] = useState<7 | 15 | 30>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { Promise.all([dashboardService.overview(), dashboardService.expenses(), dashboardService.breakdown(), dashboardService.recent(), dashboardService.renewalsGrouped()]).then(([o, e, b, r, g]) => { setOverview(o); setExpenses(e); setBreakdown(b); setRecent(r); setRenewals(g); }).catch((e) => setError(e.message || 'Failed to load dashboard')).finally(() => setLoading(false)); }, []);
  if (loading) return <p className="py-16 text-center text-muted-foreground">Loading dashboard…</p>;
  if (error) return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error} — make sure the backend is running.</div>;
  const cards = [
    { label: 'Total Categories', value: overview?.total_categories ?? 0, icon: FolderOpen },
    { label: 'Total Subscriptions', value: overview?.total_subscriptions ?? 0, icon: CreditCard },
    { label: 'Active Subscriptions', value: overview?.active_subscriptions ?? 0, icon: CheckCircle2 },
    { label: 'Inactive Subscriptions', value: overview?.inactive_subscriptions ?? 0, icon: XCircle },
    { label: 'Monthly Recurring', value: formatCurrency(overview?.monthly_recurring || 0), icon: IndianRupee },
    { label: 'Yearly Recurring', value: formatCurrency(overview?.yearly_recurring || 0), icon: TrendingUp },
    { label: 'Auto-Pay Enabled', value: overview?.auto_pay_enabled ?? 0, icon: Zap },
    { label: 'Upcoming Renewals (30d)', value: overview?.upcoming_renewals ?? 0, icon: CalendarClock },
  ];
  const renewalList: Subscription[] = renewals ? (tab === 7 ? renewals.within7 : tab === 15 ? renewals.within15 : renewals.within30) : [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((c) => { const Icon = c.icon; return <Card key={c.label}><CardContent className="flex items-start justify-between pt-5"><div><p className="text-xs font-medium text-muted-foreground">{c.label}</p><p className="mt-1 text-2xl font-bold">{c.value}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary"><Icon className="h-5 w-5" /></span></CardContent></Card>; })}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3"><CardHeader><CardTitle>Monthly Expenses (last 12 months, from payment history)</CardTitle></CardHeader><CardContent><ExpensesChart data={expenses} /></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Category-wise Expenses</CardTitle></CardHeader><CardContent><CategoryDonut data={breakdown} /></CardContent></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><div className="flex items-center justify-between"><CardTitle>Upcoming Renewals</CardTitle><div className="flex gap-1">{([7,15,30] as const).map((d) => <button key={d} onClick={() => setTab(d)} className={`rounded-md px-2.5 py-1 text-xs font-medium ${tab === d ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{d} days</button>)}</div></div></CardHeader>
          <CardContent>{renewalList.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No renewals in the next {tab} days.</p> : <div className="divide-y">{renewalList.map((s) => <div key={s.id} className="flex items-center justify-between py-3"><div><Link href={`/dashboard/subscriptions/${s.id}`} className="font-medium hover:underline">{s.name}</Link><p className="text-xs text-muted-foreground">{s.category_name}</p></div><div className="text-right"><p className="font-medium">{formatCurrency(s.total_amount, s.currency)}</p><p className="text-xs text-muted-foreground">{formatDate(s.next_renewal_date)}</p></div></div>)}</div>}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recently Added Subscriptions</CardTitle></CardHeader>
          <CardContent>{recent.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No subscriptions yet. <Link href="/dashboard/subscriptions/new" className="text-primary underline">Add your first one</Link></p> : <div className="divide-y">{recent.map((s) => <div key={s.id} className="flex items-center justify-between py-3"><div><Link href={`/dashboard/subscriptions/${s.id}`} className="font-medium hover:underline">{s.name}</Link><p className="text-xs text-muted-foreground">{s.category_name} · {formatDate(s.created_at)}</p></div><Badge>{s.status}</Badge></div>)}</div>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
