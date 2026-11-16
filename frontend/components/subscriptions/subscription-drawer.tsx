'use client';
import { useCallback, useEffect, useState } from 'react';
import { Activity, Bell, CalendarCheck, CalendarClock, CalendarX, CircleDollarSign, Clock, CreditCard, ExternalLink, FolderOpen, Globe, History, Pencil, Receipt, RefreshCw, Repeat, Tag, Trash2, Wallet, X, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { SubscriptionForm } from '@/components/subscriptions/subscription-form';
import { subscriptionService } from '@/services/subscription.service';
import { cn, daysUntil, formatCurrency, formatDate, pastelFor } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Subscription } from '@/types';

const cycleLabel: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', half_yearly: 'Half-Yearly', yearly: 'Yearly', custom: 'Custom' };

function Row({ icon: Icon, label, value, valueClass }: { icon: any; label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="flex shrink-0 items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0" />{label}</span>
      <span className={cn('min-w-0 break-all text-right font-medium text-foreground', valueClass)}>{value}</span>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <p className="border-b px-4 py-3 text-[13px] font-medium text-foreground">{title}</p>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  );
}

export function SubscriptionDrawer({ subscriptionId, initialMode, onClose, onChanged }: { subscriptionId: string | null; initialMode: 'view' | 'edit'; onClose: () => void; onChanged: () => void }) {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const fetchSub = useCallback((id: string, silent = false) => {
    if (!silent) setLoading(true);
    subscriptionService.get(id).then(setSub).catch((e) => { toast.error(e.message || 'Failed to load subscription'); if (!silent) onClose(); }).finally(() => { if (!silent) setLoading(false); });
  }, [onClose]);

  useEffect(() => {
    if (!subscriptionId) { setSub(null); return; }
    setMode(initialMode);
    setSub(null);
    fetchSub(subscriptionId);
  }, [subscriptionId, initialMode, fetchSub]);

  useEffect(() => {
    if (!subscriptionId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [subscriptionId, onClose]);

  useEffect(() => {
    if (!subscriptionId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [subscriptionId]);

  if (!subscriptionId) return null;

  const onDelete = async () => {
    if (!sub) return; setDelLoading(true);
    try { await subscriptionService.remove(sub.id); toast.success('Subscription deleted'); setConfirm(false); onChanged(); onClose(); }
    catch (e: any) { toast.error(e.message || 'Failed to delete subscription'); }
    finally { setDelLoading(false); }
  };

  const overdue = sub?.next_renewal_date && sub.status === 'active' ? (daysUntil(sub.next_renewal_date) ?? 0) < 0 : false;
  const hasMore = !!(sub && (sub.website_url || sub.description || sub.notes));

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/40" onClick={onClose} />
      <aside className={cn('fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-background shadow-2xl', mode === 'edit' ? 'max-w-[560px]' : 'max-w-[440px]')}>
        <div className="flex shrink-0 items-center justify-between px-5 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{mode === 'edit' ? 'Edit Subscription' : 'Subscription Details'}</p>
          <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        {loading || !sub ? (
          <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading…</p>
        ) : mode === 'edit' ? (
          <div className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
            <SubscriptionForm initial={sub} onSaved={() => { onChanged(); setMode('view'); fetchSub(sub.id, true); }} onCancel={() => setMode('view')} />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
              <div className="flex items-start gap-3.5">
                <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-medium', pastelFor(sub.name))}>{sub.name.charAt(0).toUpperCase()}</span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate text-base font-medium text-foreground">{sub.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{sub.account_email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge>{sub.status}</Badge>
                    {sub.auto_pay_enabled && <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/15"><Zap className="h-3 w-3" /> Auto-pay on</span>}
                  </div>
                </div>
              </div>

              <Section title="Plan details">
                <Row icon={FolderOpen} label="Category" value={sub.category_name || '—'} />
                <Row icon={Activity} label="Status" value={<span className="capitalize">{sub.status}</span>} />
                <Row icon={Wallet} label="Payment status" value={<span className="capitalize">{sub.payment_status}</span>} />
                <Row icon={Zap} label="Auto-pay" value={sub.auto_pay_enabled ? 'Yes' : 'No'} />
                <Row icon={RefreshCw} label="Auto-renewal" value={sub.auto_renewal_enabled ? 'Yes' : 'No'} />
                <Row icon={Bell} label="Renewal reminder" value={sub.renewal_reminder ? `${sub.reminder_days_before} days before` : 'Off'} />
              </Section>

              <Section title="Pricing & billing">
                <Row icon={Tag} label="Price" value={formatCurrency(sub.price, sub.currency)} />
                <Row icon={Receipt} label="Tax amount" value={formatCurrency(sub.tax_amount, sub.currency)} />
                <Row icon={CircleDollarSign} label="Total amount" value={formatCurrency(sub.total_amount, sub.currency)} />
                <Row icon={Repeat} label="Billing cycle" value={sub.billing_cycle === 'custom' ? `Custom (${sub.custom_billing_days ?? '—'} days)` : (cycleLabel[sub.billing_cycle] || sub.billing_cycle)} />
                <Row icon={CreditCard} label="Payment method" value={sub.payment_method ? <span className="capitalize">{sub.payment_method.replace(/_/g, ' ')}</span> : '—'} />
                <Row icon={Globe} label="Currency" value={sub.currency} />
              </Section>

              <Section title="Dates">
                <Row icon={CalendarClock} label="Start date" value={formatDate(sub.start_date)} />
                <Row icon={CalendarCheck} label="Last payment date" value={formatDate(sub.last_payment_date)} />
                <Row icon={CalendarClock} label="Next renewal date" value={formatDate(sub.next_renewal_date)} valueClass={overdue ? 'text-red-600' : undefined} />
                <Row icon={CalendarX} label="End date" value={formatDate(sub.end_date)} />
                <Row icon={Clock} label="Added on" value={formatDate(sub.created_at)} />
                <Row icon={History} label="Last updated" value={formatDate(sub.updated_at)} />
              </Section>

              {hasMore && (
                <Section title="More">
                  {sub.website_url && (
                    <div className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a href={sub.website_url} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 break-all text-[13px] font-medium text-emerald-700 hover:underline">{sub.website_url}<ExternalLink className="h-3 w-3 shrink-0" /></a>
                    </div>
                  )}
                  {sub.description && (
                    <div className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="mt-0.5 break-words text-[13px] text-foreground">{sub.description}</p>
                    </div>
                  )}
                  {sub.notes && (
                    <div className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="mt-0.5 break-words text-[13px] text-foreground">{sub.notes}</p>
                    </div>
                  )}
                </Section>
              )}
            </div>
            <div className="shrink-0 border-t bg-card px-5 py-4">
              <div className="flex w-full items-center gap-3">
                <Button className="h-11 min-w-0 flex-1 text-sm font-medium" onClick={() => setMode('edit')}><Pencil className="h-4 w-4 shrink-0" /> Edit</Button>
                <Button variant="outline" onClick={() => setConfirm(true)} className="h-11 w-[128px] shrink-0 whitespace-nowrap border-red-200 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4 shrink-0" /> Delete</Button>
              </div>
            </div>
          </>
        )}
      </aside>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={onDelete} loading={delLoading} title="Delete subscription?" description={`Delete "${sub?.name}" permanently? This cannot be undone.`} />
    </>
  );
}
