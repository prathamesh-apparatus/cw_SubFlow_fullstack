'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, IndianRupee, CalendarClock, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpensesChart, CategoryDonut } from '@/components/dashboard/charts';
import { dashboardService } from '@/services/dashboard.service';
import toast from 'react-hot-toast';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
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
  useEffect(() => { Promise.all([dashboardService.overview(), dashboardService.expenses(), dashboardService.breakdown(), dashboardService.recent(), dashboardService.renewalsGrouped()]).then(([o, e, b, r, g]) => { setOverview(o); setExpenses(e); setBreakdown(b); setRecent(r); setRenewals(g); }).catch((e) => toast.error(e.message || 'Failed to load dashboard — make sure the backend is running.')).finally(() => setLoading(false)); }, []);
  if (loading) return <p className="py-16 text-center text-muted-foreground">Loading dashboard…</p>;
  const overviewStats = [
    { label: 'Total Categories', value: overview?.total_categories ?? 0, sub: 'Organised by team' },
    { label: 'Total Subscriptions', value: overview?.total_subscriptions ?? 0, sub: 'All tracked plans' },
    { label: 'Active Subscriptions', value: overview?.active_subscriptions ?? 0, sub: 'Currently running' },
    { label: 'Inactive Subscriptions', value: overview?.inactive_subscriptions ?? 0, sub: 'Paused or ended' },
  ];
  const miniCards = [
    { label: 'Monthly Expenses', value: formatCurrency(overview?.monthly_recurring || 0), sub: 'Per month, normalised', icon: IndianRupee },
    { label: 'Yearly Expenses', value: formatCurrency(overview?.yearly_recurring || 0), sub: 'Per year, normalised', icon: TrendingUp },
    { label: 'Auto-Pay Enabled', value: overview?.auto_pay_enabled ?? 0, sub: 'Subscriptions on auto-pay', icon: Zap },
    { label: 'Upcoming Renewals', value: overview?.upcoming_renewals ?? 0, sub: 'In the next 30 days', icon: CalendarClock },
  ];
  const renewalList: Subscription[] = renewals ? (tab === 7 ? renewals.within7 : tab === 15 ? renewals.within15 : renewals.within30) : [];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back, Admin</h2>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">Here&apos;s what&apos;s happening across your subscriptions today.</p>
      </div>

      <Card>
        <CardHeader className="pb-1"><CardTitle>Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
            {overviewStats.map((s, i) => (
              <div key={s.label} className={cn(i > 0 && 'lg:border-l lg:pl-8')}>
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-foreground">{s.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {miniCards.map((c) => { const Icon = c.icon; return (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"><Icon className="h-4 w-4" /></span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{c.value}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{c.sub}</p>
            </CardContent>
          </Card>
        ); })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Expenses</CardTitle><p className="text-sm text-muted-foreground">Last 12 months, from payment history</p></CardHeader>
          <CardContent><ExpensesChart data={expenses} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Category-wise Expenses</CardTitle><p className="text-sm text-muted-foreground">Where the money goes, by team</p></CardHeader>
          <CardContent><CategoryDonut data={breakdown} /></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Upcoming Renewals</CardTitle>
              <div className="inline-flex rounded-full bg-secondary p-1">
                {([7, 15, 30] as const).map((d) => <button key={d} onClick={() => setTab(d)} className={cn('rounded-full px-3.5 py-1.5 text-xs font-medium transition', tab === d ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{d} days</button>)}
              </div>
            </div>
          </CardHeader>
          <CardContent>{renewalList.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No renewals in the next {tab} days.</p> : <div className="divide-y divide-border/70">{renewalList.map((s) => <div key={s.id} className="flex items-center gap-3.5 py-3.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground"><CreditCard className="h-4 w-4" /></span><div className="min-w-0 flex-1"><Link href={`/dashboard/subscriptions/${s.id}`} className="font-semibold text-foreground hover:underline">{s.name}</Link><p className="truncate text-xs text-muted-foreground">{s.category_name}</p></div><div className="text-right"><p className="font-semibold text-foreground">{formatCurrency(s.total_amount, s.currency)}</p><p className="text-xs text-muted-foreground">{formatDate(s.next_renewal_date)}</p></div></div>)}</div>}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recently Added</CardTitle></CardHeader>
          <CardContent>{recent.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No subscriptions yet. <Link href="/dashboard/subscriptions/new" className="font-medium text-emerald-700 underline">Add your first one</Link></p> : <div className="divide-y divide-border/70">{recent.map((s) => <div key={s.id} className="flex items-center gap-3.5 py-3.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-foreground">{s.name.charAt(0).toUpperCase()}</span><div className="min-w-0 flex-1"><Link href={`/dashboard/subscriptions/${s.id}`} className="font-semibold text-foreground hover:underline">{s.name}</Link><p className="truncate text-xs text-muted-foreground">{s.category_name} · {formatDate(s.created_at)}</p></div><Badge>{s.status}</Badge></div>)}</div>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
