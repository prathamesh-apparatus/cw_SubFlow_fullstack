'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, IndianRupee, CalendarClock, Zap, TrendingUp, RefreshCw, Plus, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExpensesChart, CategoryDonut } from '@/components/dashboard/charts';
import { dashboardService } from '@/services/dashboard.service';
import { domainsService } from '@/services/domains.service';
import toast from 'react-hot-toast';
import { cn, EXPIRY_BAND_CLS, expiryBand, expiryChipText, formatCurrency, formatDate, pastelFor } from '@/lib/utils';
import type { DomainStatistics, Overview, Subscription } from '@/types';
export const dynamic = 'force-dynamic';
const cycleLabels: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', half_yearly: 'Half-Yearly', yearly: 'Yearly', custom: 'Custom' };
export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [recent, setRecent] = useState<Subscription[]>([]);
  const [renewals, setRenewals] = useState<any>(null);
  const [domainStats, setDomainStats] = useState<DomainStatistics | null>(null);
  const [tab, setTab] = useState<7 | 15 | 30>(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(() => Promise.all([dashboardService.overview(), dashboardService.expenses(), dashboardService.breakdown(), dashboardService.recent(), dashboardService.renewalsGrouped()]).then(([o, e, b, r, g]) => { setOverview(o); setExpenses(e); setBreakdown(b); setRecent(r); setRenewals(g); }).catch((e) => toast.error(e.message || 'Failed to load dashboard — make sure the backend is running.')), []);
  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);
  useEffect(() => { domainsService.statistics().then(setDomainStats).catch(() => {}); }, []);
  const onRefresh = async () => { setRefreshing(true); try { await load(); } finally { setRefreshing(false); } };
  if (loading) return <p className="py-16 text-center text-muted-foreground">Loading dashboard…</p>;
  const overviewStats = [
    { label: 'Total Categories', value: overview?.total_categories ?? 0, sub: 'Organised by team' },
    { label: 'Total Subscriptions', value: overview?.total_subscriptions ?? 0, sub: 'All tracked plans' },
    { label: 'Active Subscriptions', value: overview?.active_subscriptions ?? 0, sub: 'Currently running' },
    { label: 'Inactive Subscriptions', value: overview?.inactive_subscriptions ?? 0, sub: 'Paused or ended' },
  ];
  const miniCards = [
    { label: 'Monthly Expenses', value: formatCurrency(overview?.monthly_recurring || 0), sub: 'Per month, normalised', icon: IndianRupee, tint: 'bg-gradient-to-br from-white to-sky-50', iconTint: 'bg-sky-100 text-sky-700' },
    { label: 'Yearly Expenses', value: formatCurrency(overview?.yearly_recurring || 0), sub: 'Per year, normalised', icon: TrendingUp, tint: 'bg-gradient-to-br from-white to-violet-50', iconTint: 'bg-violet-100 text-violet-700' },
    { label: 'Auto-Pay Enabled', value: overview?.auto_pay_enabled ?? 0, sub: 'Subscriptions on auto-pay', icon: Zap, tint: 'bg-gradient-to-br from-white to-amber-50', iconTint: 'bg-amber-100 text-amber-700' },
    { label: 'Upcoming Renewals', value: overview?.upcoming_renewals ?? 0, sub: 'In the next 30 days', icon: CalendarClock, tint: 'bg-gradient-to-br from-white to-rose-50', iconTint: 'bg-rose-100 text-rose-700' },
  ];
  const renewalList: Subscription[] = renewals ? (tab === 7 ? renewals.within7 : tab === 15 ? renewals.within15 : renewals.within30) : [];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />SubFlow Overview</p>
          <h2 className="mt-1.5 text-xl font-medium tracking-tight text-foreground">Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}><RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} /> Refresh</Button>
          <Link href="/dashboard/subscriptions/new"><Button size="sm"><Plus className="h-3.5 w-3.5" /> Add Subscription</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-1"><CardTitle>Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
            {overviewStats.map((s, i) => (
              <div key={s.label} className={cn(i > 0 && 'lg:border-l lg:pl-8')}>
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <p className="mt-2 text-2xl font-medium leading-none tracking-tight text-foreground">{s.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {miniCards.map((c) => { const Icon = c.icon; return (
          <Card key={c.label} className={c.tint}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', c.iconTint)}><Icon className="h-4 w-4" /></span>
              </div>
              <p className="mt-3 text-xl font-medium tracking-tight text-foreground">{c.value}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{c.sub}</p>
            </CardContent>
          </Card>
        ); })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Expenses</CardTitle><p className="text-sm text-muted-foreground">Last 12 months · normalised monthly spend</p></CardHeader>
          <CardContent><ExpensesChart data={expenses} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Category-wise Expenses</CardTitle><p className="text-sm text-muted-foreground">Where the money goes, by team</p></CardHeader>
          <CardContent><CategoryDonut data={breakdown} /></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Upcoming Renewals</CardTitle>
              <div className="inline-flex rounded-full bg-secondary p-1">
                {([7, 15, 30] as const).map((d) => <button key={d} onClick={() => setTab(d)} className={cn('rounded-full px-3.5 py-1.5 text-xs font-medium transition', tab === d ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{d} days</button>)}
              </div>
            </div>
          </CardHeader>
          <CardContent>{renewalList.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No renewals in the next {tab} days.</p> : <div className="divide-y divide-border/70">{renewalList.map((s) => <div key={s.id} className="flex items-center gap-3.5 py-3.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground"><CreditCard className="h-4 w-4" /></span><div className="min-w-0 flex-1"><Link href={`/dashboard/subscriptions?open=${s.id}`} className="font-semibold text-foreground hover:underline">{s.name}</Link><p className="truncate text-xs text-muted-foreground">{s.category_name}</p></div><div className="text-right"><p className="font-semibold text-foreground">{formatCurrency(s.total_amount, s.currency)}</p><p className="text-xs text-muted-foreground">{formatDate(s.next_renewal_date)}</p></div></div>)}</div>}</CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Recent Subscriptions</CardTitle>
                <p className="text-sm text-muted-foreground">Latest plans added across categories</p>
              </div>
              <Link href="/dashboard/subscriptions" className="text-[13px] font-medium text-emerald-700 hover:underline">View all →</Link>
            </div>
          </CardHeader>
          {recent.length === 0 ? (
            <CardContent><p className="py-6 text-center text-sm text-muted-foreground">No subscriptions yet.</p></CardContent>
          ) : (
            <div className="overflow-x-auto pb-2">
              <table className="w-full min-w-[620px]">
                <thead>
                  <tr className="bg-secondary/60">
                    <th className="py-2.5 pl-5 pr-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Subscription</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Category</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Amount</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Cycle</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="py-2.5 pl-3 pr-5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Renewal</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((s) => (
                    <tr key={s.id} className="border-t border-border/60 text-[13px]">
                      <td className="py-3 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-semibold', pastelFor(s.name))}>{s.name.charAt(0).toUpperCase()}</span>
                          <div className="min-w-0">
                            <Link href={`/dashboard/subscriptions?open=${s.id}`} className="font-medium text-foreground hover:underline">{s.name}</Link>
                            <p className="truncate text-[11px] text-muted-foreground">{s.account_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{s.category_name}</td>
                      <td className="px-3 py-3 font-medium text-foreground">{formatCurrency(s.total_amount, s.currency)}</td>
                      <td className="px-3 py-3 text-muted-foreground">{cycleLabels[s.billing_cycle] || s.billing_cycle}</td>
                      <td className="px-3 py-3"><Badge>{s.status}</Badge></td>
                      <td className="py-3 pl-3 pr-5 text-muted-foreground">{formatDate(s.next_renewal_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Domains</p>
          <h3 className="mt-1.5 text-lg font-medium tracking-tight text-foreground">Domain Overview</h3>
        </div>
        <Link href="/dashboard/domains" className="text-[13px] font-medium text-emerald-700 hover:underline">View all domains →</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Domains', value: domainStats?.total ?? 0, sub: 'All registered domains' },
          { label: 'Internal Domains', value: domainStats?.internal ?? 0, sub: 'Organisation-owned' },
          { label: 'External Domains', value: domainStats?.external ?? 0, sub: 'Client / third-party' },
          { label: 'Active Domains', value: domainStats?.active ?? 0, sub: 'Currently active' },
          { label: 'Expired Domains', value: domainStats?.expired ?? 0, sub: 'Past their expiry date' },
          { label: 'Expiring Soon', value: domainStats?.expiringSoon ?? 0, sub: 'Within the next 30 days' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <p className="text-[13px] font-medium text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-xl font-medium tracking-tight text-foreground">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Domain Costs</CardTitle><p className="text-sm text-muted-foreground">Totals per currency — currencies are never combined</p></CardHeader>
          <CardContent>
            {!domainStats || domainStats.costs.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">No domain costs yet.</p> : (
              <div className="divide-y divide-border/70">
                {domainStats.costs.map((c) => (
                  <div key={c.currency} className="flex items-center justify-between gap-3 py-3 text-[13px]">
                    <span className="font-medium text-foreground">{c.currency}</span>
                    <span className="text-right text-muted-foreground">Purchase <span className="font-medium text-foreground">{formatCurrency(c.totalPurchase, c.currency)}</span> · Renewal <span className="font-medium text-foreground">{formatCurrency(c.totalRenewal, c.currency)}</span> · Yearly <span className="font-medium text-foreground">{formatCurrency(c.yearlyCost, c.currency)}</span></span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Upcoming Domain Renewals</CardTitle><p className="text-sm text-muted-foreground">Next renewals and expiries, soonest first</p></CardHeader>
          <CardContent>
            {!domainStats || domainStats.upcomingRenewals.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">No domain renewals in the next 60 days.</p> : (
              <div className="divide-y divide-border/70">
                {domainStats.upcomingRenewals.map((d) => (
                  <div key={d.id} className="flex items-center gap-3.5 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground"><Globe className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <Link href="/dashboard/domains" className="font-semibold text-foreground hover:underline">{d.domain_name}</Link>
                      <p className="truncate text-xs text-muted-foreground">{d.project_name || 'No project'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-medium text-foreground">{formatDate(d.next_renewal_date || d.expiry_date)}</p>
                      <span className={cn('mt-0.5 inline-flex items-center rounded-full px-2 py-px text-[10px] font-medium ring-1 ring-inset', EXPIRY_BAND_CLS[expiryBand(d.days_remaining)])}>{expiryChipText(d.days_remaining)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
