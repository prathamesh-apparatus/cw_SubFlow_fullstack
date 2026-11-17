'use client';
import { useCallback, useEffect, useState } from 'react';
import { Activity, AlarmClock, Building2, CalendarClock, CalendarDays, CalendarX, CircleDollarSign, Clock, FolderOpen, Globe, History, Mail, Pencil, Receipt, Repeat, Server, Tag, Trash2, UserRound, X, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { DomainForm } from '@/components/domains/domain-form';
import { domainsService } from '@/services/domains.service';
import { cn, EXPIRY_BAND_CLS, EXPIRY_BAND_LABEL, expiryBand, expiryChipText, formatCurrency, formatDate, pastelFor } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Domain } from '@/types';

const cycleLabel: Record<string, string> = { monthly: 'Monthly', yearly: 'Yearly', custom: 'Custom' };

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

export function DomainDrawer({ domainId, initialMode, createOpen, onClose, onChanged }: { domainId: string | null; initialMode: 'view' | 'edit'; createOpen?: boolean; onClose: () => void; onChanged: () => void }) {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const open = !!domainId || !!createOpen;

  const fetchDomain = useCallback((id: string, silent = false) => {
    if (!silent) setLoading(true);
    domainsService.get(id).then(setDomain).catch((e) => { toast.error(e.message || 'Failed to load domain'); if (!silent) onClose(); }).finally(() => { if (!silent) setLoading(false); });
  }, [onClose]);

  useEffect(() => {
    if (!domainId) { setDomain(null); return; }
    setMode(initialMode);
    setDomain(null);
    fetchDomain(domainId);
  }, [domainId, initialMode, fetchDomain]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open ]);

  if (!open) return null;

  const onDelete = async () => {
    if (!domain) return; setDelLoading(true);
    try { await domainsService.remove(domain.id); toast.success('Domain deleted'); setConfirm(false); onChanged(); onClose(); }
    catch (e: any) { toast.error(e.message || 'Failed to delete domain'); }
    finally { setDelLoading(false); }
  };

  const creating = !!createOpen && !domainId;
  const band = expiryBand(domain?.days_remaining);
  const editing = !creating && mode === 'edit';

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/40" onClick={onClose} />
      <aside className={cn('fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-background shadow-2xl', editing || creating ? 'max-w-[560px]' : 'max-w-[440px]')}>
        <div className="flex shrink-0 items-center justify-between px-5 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{creating ? 'Add Domain' : editing ? 'Edit Domain' : 'Domain Details'}</p>
          <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        {creating ? (
          <div className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
            <DomainForm onSaved={() => { onChanged(); onClose(); }} onCancel={onClose} />
          </div>
        ) : loading || !domain ? (
          <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading…</p>
        ) : editing ? (
          <div className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
            <DomainForm initial={domain} onSaved={() => { onChanged(); setMode('view'); fetchDomain(domain.id, true); }} onCancel={() => setMode('view')} />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
              <div className="flex items-start gap-3.5">
                <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-medium', pastelFor(domain.domain_name))}>{domain.domain_name.charAt(0).toUpperCase()}</span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate text-base font-medium text-foreground">{domain.domain_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{domain.project_name || 'No project'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge>{domain.status}</Badge>
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset', domain.domain_type === 'internal' ? 'bg-sky-50 text-sky-700 ring-sky-600/15' : 'bg-violet-50 text-violet-700 ring-violet-600/15')}>{domain.domain_type}</span>
                    {domain.expiry_date && <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', EXPIRY_BAND_CLS[band])}>{EXPIRY_BAND_LABEL[band]}</span>}
                  </div>
                </div>
              </div>

              <Section title="Basic Information">
                <Row icon={Globe} label="Domain name" value={domain.domain_name} />
                <Row icon={Tag} label="Domain type" value={<span className="capitalize">{domain.domain_type}</span>} />
                <Row icon={Activity} label="Status" value={<span className="capitalize">{domain.status}</span>} />
                <Row icon={FolderOpen} label="Associated project" value={domain.project_name || '—'} />
                {domain.description && (
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="mt-0.5 break-words text-[13px] text-foreground">{domain.description}</p>
                  </div>
                )}
              </Section>

              <Section title="Purchase Information">
                <Row icon={Building2} label="Purchased from" value={domain.purchased_from || '—'} />
                <Row icon={CalendarDays} label="Purchase date" value={formatDate(domain.purchase_date)} />
                <Row icon={CircleDollarSign} label="Purchase cost" value={domain.purchase_cost != null ? formatCurrency(domain.purchase_cost, domain.currency) : '—'} />
                <Row icon={Tag} label="Currency" value={domain.currency} />
                <Row icon={Repeat} label="Billing cycle" value={domain.billing_cycle === 'custom' ? `Custom (${domain.custom_billing_days ?? '—'} days)` : (cycleLabel[domain.billing_cycle] || domain.billing_cycle)} />
                <Row icon={Receipt} label="Invoice reference" value={domain.invoice_reference || '—'} />
              </Section>

              <Section title="Management">
                <Row icon={Server} label="Managed by" value={domain.managed_by || '—'} />
                <Row icon={Globe} label="Management platform" value={domain.management_platform || '—'} />
                <Row icon={Mail} label="Account email" value={domain.account_email || '—'} />
                <Row icon={UserRound} label="Responsible person / team" value={domain.responsible_person || '—'} />
                <Row icon={Server} label="Nameservers" value={domain.nameservers || '—'} />
              </Section>

              <Section title="Expiry & Renewal">
                <Row icon={CalendarClock} label="Registration date" value={formatDate(domain.registration_date)} />
                <Row icon={CalendarX} label="Expiry date" value={formatDate(domain.expiry_date)} valueClass={band === 'expired' || band === 'd7' ? 'text-red-600' : undefined} />
                <Row icon={Clock} label="Days remaining" value={domain.expiry_date ? expiryChipText(domain.days_remaining) : '—'} />
                <Row icon={CircleDollarSign} label="Renewal cost" value={domain.renewal_cost != null ? formatCurrency(domain.renewal_cost, domain.currency) : '—'} />
                <Row icon={Zap} label="Auto-renewal" value={domain.auto_renewal_enabled ? 'Yes' : 'No'} />
                <Row icon={AlarmClock} label="Renewal reminder" value={domain.renewal_reminder_enabled ? `Yes — ${domain.reminder_days_before} days before` : 'No'} />
                <Row icon={Clock} label="Added on" value={formatDate(domain.created_at)} />
                <Row icon={History} label="Last updated" value={formatDate(domain.updated_at)} />
              </Section>

              {domain.notes && (
                <Section title="Notes">
                  <div className="px-4 py-3">
                    <p className="break-words text-[13px] text-foreground">{domain.notes}</p>
                  </div>
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
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={onDelete} loading={delLoading} title="Delete domain?" description={`Delete "${domain?.domain_name}" permanently? This cannot be undone.`} />
    </>
  );
}
