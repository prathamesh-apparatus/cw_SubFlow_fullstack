'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/dialog';
import { SubscriptionTable } from '@/components/subscriptions/subscription-table';
import { categoryService } from '@/services/category.service';
import { subscriptionService } from '@/services/subscription.service';
import { formatCurrency, monthlyAmount } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import type { Category, Subscription } from '@/types';
export const dynamic = 'force-dynamic';
export default function CategoryDetailsPage() {
  const params = useParams(); const id = String(params.id); const { toast } = useToast();
  const [cat, setCat] = useState<Category | null>(null); const [subs, setSubs] = useState<Subscription[]>([]); const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Subscription | null>(null);
  const load = () => { Promise.all([categoryService.get(id), categoryService.subscriptions(id)]).then(([c, s]) => { setCat(c); setSubs(s.items); }).catch((e) => toast({ title: e.message, variant: 'error' })).finally(() => setLoading(false)); };
  useEffect(load, [id]);
  if (loading) return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  if (!cat) return <p className="py-12 text-center text-muted-foreground">Category not found.</p>;
  const active = subs.filter((s) => s.status === 'active');
  const monthly = subs.filter((s) => !['cancelled','expired'].includes(s.status)).reduce((a, s) => a + monthlyAmount(s), 0);
  const onDelete = async () => { if (!deleting) return; try { await subscriptionService.remove(deleting.id); toast({ title: 'Subscription deleted' }); setDeleting(null); load(); } catch (e: any) { toast({ title: e.message, variant: 'error' }); } };
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-2xl font-bold">{cat.name}</h2><p className="mt-1 text-sm text-muted-foreground">{cat.description || 'No description'}</p></div><Link href={`/dashboard/subscriptions/new?category=${id}`}><Button><Plus className="h-4 w-4" /> Add Subscription</Button></Link></div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[['Total Subscriptions', subs.length], ['Active Subscriptions', active.length], ['Monthly Expenses', formatCurrency(monthly)], ['Yearly Expenses', formatCurrency(monthly * 12)]].map(([l, v]) => <Card key={String(l)}><CardContent className="pt-5"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></CardContent></Card>)}
      </div>
      <Card><CardContent className="p-0"><SubscriptionTable items={subs} onDelete={setDeleting} /></CardContent></Card>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={onDelete} title="Delete subscription?" description={`Delete "${deleting?.name}" permanently?`} />
    </div>
  );
}
