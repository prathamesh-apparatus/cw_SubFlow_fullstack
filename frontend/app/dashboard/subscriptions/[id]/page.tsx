'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/dialog';
import { subscriptionService } from '@/services/subscription.service';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import type { Subscription } from '@/types';
export const dynamic = 'force-dynamic';
export default function SubscriptionDetailsPage() {
  const params = useParams(); const id = String(params.id); const router = useRouter(); const { toast } = useToast();
  const [sub, setSub] = useState<Subscription | null>(null); const [confirm, setConfirm] = useState(false);
  useEffect(() => { subscriptionService.get(id).then(setSub).catch((e) => toast({ title: e.message, variant: 'error' })); }, [id]);
  if (!sub) return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  const days = daysUntil(sub.next_renewal_date);
  const row = (l: string, v: React.ReactNode) => <div className="flex justify-between gap-4 py-2 border-b last:border-0 text-sm"><span className="text-muted-foreground">{l}</span><span className="font-medium text-right">{v ?? '—'}</span></div>;
  const section = (title: string, rows: React.ReactNode) => <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{rows}</CardContent></Card>;
  const onDelete = async () => { try { await subscriptionService.remove(id); toast({ title: 'Subscription deleted' }); router.push('/dashboard/subscriptions'); } catch (e: any) { toast({ title: e.message, variant: 'error' }); } };
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-2xl font-bold">{sub.name}</h2><p className="mt-1 text-sm text-muted-foreground">{sub.category_name} · Created {formatDate(sub.created_at)} · Updated {formatDate(sub.updated_at)}</p>{days !== null && <p className={`mt-2 text-sm font-medium ${days < 0 ? 'text-destructive' : days <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>{days < 0 ? `Renewal overdue by ${Math.abs(days)} day(s)` : days === 0 ? 'Renews today' : `Renews in ${days} day(s)`} — {formatDate(sub.next_renewal_date)}</p>}</div><div className="flex gap-2"><Link href={`/dashboard/subscriptions/${id}/edit`}><Button variant="outline"><Pencil className="h-4 w-4" /> Edit</Button></Link><Button variant="destructive" onClick={() => setConfirm(true)}><Trash2 className="h-4 w-4" /> Delete</Button></div></div>
      <div className="grid gap-5 lg:grid-cols-2">
        {section('Basic Information', <>{row('Name', sub.name)}{row('Category', sub.category_name)}{row('Description', sub.description || '—')}{row('Website', sub.website_url ? <a href={sub.website_url} target="_blank" rel="noreferrer" className="text-primary underline">{sub.website_url}</a> : '—')}</>)}
        {section('Account Information', <>{row('Account Email', sub.account_email)}{row('Account Username', sub.account_username || '—')}</>)}
        {section('Pricing Details', <>{row('Price', formatCurrency(sub.price, sub.currency))}{row('Tax', formatCurrency(sub.tax_amount, sub.currency))}{row('Total Amount', formatCurrency(sub.total_amount, sub.currency))}{row('Billing Cycle', sub.billing_cycle)}{sub.billing_cycle === 'custom' && row('Custom Days', sub.custom_billing_days)}</>)}
        {section('Payment Information', <>{row('Payment Method', (sub.payment_method || '—').replace('_', ' '))}{row('Auto-Pay', sub.auto_pay_enabled ? 'Yes' : 'No')}{row('Payment Status', <Badge>{sub.payment_status}</Badge>)}{row('Payment Notes', sub.payment_notes || '—')}</>)}
        {section('Renewal Information', <>{row('Start Date', formatDate(sub.start_date))}{row('Last Payment', formatDate(sub.last_payment_date))}{row('Next Renewal', formatDate(sub.next_renewal_date))}{row('End Date', formatDate(sub.end_date))}{row('Reminder', sub.renewal_reminder ? `Yes — ${sub.reminder_days_before} days before` : 'No')}</>)}
        {section('Subscription Status', <>{row('Status', <Badge>{sub.status}</Badge>)}{row('Auto-Renewal', sub.auto_renewal_enabled ? 'Yes' : 'No')}</>)}
      </div>
      {section('Internal Notes', <p className="text-sm">{sub.notes || 'No internal notes.'}</p>)}
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={onDelete} title="Delete subscription?" description={`Delete "${sub.name}" permanently? This cannot be undone.`} />
    </div>
  );
}
