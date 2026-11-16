'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/dialog';
import { SubscriptionTable } from '@/components/subscriptions/subscription-table';
import { subscriptionService } from '@/services/subscription.service';
import { categoryService } from '@/services/category.service';
import toast from 'react-hot-toast';
import type { Category, Subscription } from '@/types';
export const dynamic = 'force-dynamic';
function Inner() {
  const [items, setItems] = useState<Subscription[]>([]); const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0); const [totalPages, setTotalPages] = useState(1); const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Subscription | null>(null); const [delLoading, setDelLoading] = useState(false);
  const [f, setF] = useState({ search: '', category_id: '', billing_cycle: '', payment_status: '', status: '', auto_pay_enabled: '', sort: 'created_desc', page: '1', limit: '10' });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v, page: k === 'page' ? v : '1' }));
  const sp = useSearchParams();
  useEffect(() => { const q = sp.get('q'); if (q !== null) setF((p) => (p.search === q ? p : { ...p, search: q, page: '1' })); }, [sp]);
  const load = useCallback(() => { setLoading(true); const params: Record<string, string> = {}; Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; }); subscriptionService.list(params).then((r) => { setItems(r.items); setTotal(r.total); setTotalPages(r.totalPages); }).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, [f]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { categoryService.list().then(setCategories).catch(() => {}); }, []);
  const clear = () => setF({ search: '', category_id: '', billing_cycle: '', payment_status: '', status: '', auto_pay_enabled: '', sort: 'created_desc', page: '1', limit: '10' });
  const onDelete = async () => { if (!deleting) return; setDelLoading(true); try { await subscriptionService.remove(deleting.id); toast.success('Subscription deleted'); setDeleting(null); load(); } catch (e: any) { toast.error(e.message); } finally { setDelLoading(false); } };
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Management</p><h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">All Subscriptions</h2><p className="mt-1 text-sm text-muted-foreground">Every plan across every team, in one place.</p></div>
        <Link href="/dashboard/subscriptions/new"><Button className="w-full sm:w-auto"><Plus className="h-4 w-4" /> Add Subscription</Button></Link>
      </div>
      <div className="space-y-3 rounded-[1.25rem] border bg-card p-3 shadow-sm">
        <div className="relative w-full"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search name or account email…" value={f.search} onChange={(e) => set('search', e.target.value)} className="rounded-full border-transparent bg-secondary/70 pl-11 shadow-none focus:bg-card" /></div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        <Select className="rounded-full" value={f.category_id} onChange={(e) => set('category_id', e.target.value)}><option value="">All Categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Select className="rounded-full" value={f.billing_cycle} onChange={(e) => set('billing_cycle', e.target.value)}><option value="">All Cycles</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="half_yearly">Half-Yearly</option><option value="yearly">Yearly</option><option value="custom">Custom</option></Select>
        <Select className="rounded-full" value={f.payment_status} onChange={(e) => set('payment_status', e.target.value)}><option value="">Payment: All</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option></Select>
        <Select className="rounded-full" value={f.status} onChange={(e) => set('status', e.target.value)}><option value="">Status: All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="cancelled">Cancelled</option><option value="expired">Expired</option><option value="trial">Trial</option></Select>
        <Select className="rounded-full" value={f.auto_pay_enabled} onChange={(e) => set('auto_pay_enabled', e.target.value)}><option value="">Auto-Pay: All</option><option value="true">Enabled</option><option value="false">Disabled</option></Select>
        <Select className="rounded-full" value={f.sort} onChange={(e) => set('sort', e.target.value)}><option value="created_desc">Newest</option><option value="price_desc">Price: High → Low</option><option value="price_asc">Price: Low → High</option><option value="renewal_asc">Renewal: Soonest</option><option value="renewal_desc">Renewal: Latest</option></Select>
        </div>
      </div>
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{total} subscription(s)</p><Button variant="ghost" size="sm" onClick={clear}><X className="h-4 w-4" /> Clear all filters</Button></div>
      <Card><CardContent className="p-0">{loading ? <p className="py-12 text-center text-muted-foreground">Loading…</p> : <SubscriptionTable items={items} onDelete={setDeleting} />}</CardContent></Card>
      <div className="flex items-center justify-between"><Button variant="outline" size="sm" disabled={Number(f.page) <= 1} onClick={() => set('page', String(Number(f.page) - 1))}>Previous</Button><span className="text-sm text-muted-foreground">Page {f.page} of {totalPages}</span><Button variant="outline" size="sm" disabled={Number(f.page) >= totalPages} onClick={() => set('page', String(Number(f.page) + 1))}>Next</Button></div>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={onDelete} loading={delLoading} title="Delete subscription?" description={`Delete "${deleting?.name}" permanently? This cannot be undone.`} />
    </div>
  );
}
export default function SubscriptionsPage() { return <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading…</p>}><Inner /></Suspense>; }
