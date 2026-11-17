'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { domainSchema, DomainFormValues } from '@/lib/validations';
import { CURRENCIES, currencyLabel } from '@/lib/currencies';
import { domainsService } from '@/services/domains.service';
import toast from 'react-hot-toast';
import type { Domain } from '@/types';

const PURCHASED_FROM = ['GoDaddy', 'Namecheap', 'Hostinger', 'Cloudflare Registrar', 'Other'];
const MANAGED_BY = ['Cloudflare', 'GoDaddy', 'AWS Route 53', 'Hostinger', 'Other'];

const empty: DomainFormValues = {
  domain_name: '', domain_type: 'external', description: '', project_name: '',
  purchased_from: '', purchase_date: '', purchase_cost: null, currency: 'INR',
  billing_cycle: 'yearly', custom_billing_days: null, invoice_reference: '',
  managed_by: '', management_platform: '', account_email: '', responsible_person: '', nameservers: '',
  registration_date: '', expiry_date: '', next_renewal_date: '', renewal_cost: null,
  auto_renewal_enabled: false, renewal_reminder_enabled: true, reminder_days_before: 7,
  status: 'active', notes: '',
};
function toDate(v?: string | null) { return v ? String(v).slice(0, 10) : ''; }
const numOrNull = (v: unknown) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));

export function DomainForm({ initial, onSaved, onCancel }: { initial?: Domain; onSaved?: (d: Domain) => void; onCancel?: () => void }) {
  const router = useRouter();
  const [projects, setProjects] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<DomainFormValues>({
    resolver: zodResolver(domainSchema),
    defaultValues: initial
      ? {
          ...empty,
          ...initial,
          purchase_cost: initial.purchase_cost != null ? Number(initial.purchase_cost) : null,
          renewal_cost: initial.renewal_cost != null ? Number(initial.renewal_cost) : null,
          custom_billing_days: initial.custom_billing_days ?? null,
          purchase_date: toDate(initial.purchase_date),
          registration_date: toDate(initial.registration_date),
          expiry_date: toDate(initial.expiry_date),
          next_renewal_date: toDate(initial.next_renewal_date),
          description: initial.description || '', project_name: initial.project_name || '',
          purchased_from: initial.purchased_from || '', invoice_reference: initial.invoice_reference || '',
          managed_by: initial.managed_by || '', management_platform: initial.management_platform || '',
          account_email: initial.account_email || '', responsible_person: initial.responsible_person || '',
          nameservers: initial.nameservers || '', notes: initial.notes || '',
        } as DomainFormValues
      : empty,
  });
  const { register, handleSubmit, watch, formState: { errors } } = form;
  const cycle = watch('billing_cycle'); const currency = watch('currency');
  const purchasedFrom = watch('purchased_from'); const managedBy = watch('managed_by');
  useEffect(() => { domainsService.facets().then((f) => setProjects(f.projects)).catch(() => {}); }, []);
  const err = (m?: string) => (m ? <p className="mt-1 text-xs text-destructive">{m}</p> : null);
  const field = (label: string, el: React.ReactNode, e?: string) => <div><Label>{label}</Label><div className="mt-1.5">{el}</div>{err(e)}</div>;
  const onSubmit = async (values: DomainFormValues) => {
    if (submitting) return; setSubmitting(true);
    const payload: any = { ...values, domain_name: values.domain_name.trim().toLowerCase() };
    ['description','project_name','purchased_from','purchase_date','invoice_reference','managed_by','management_platform','account_email','responsible_person','nameservers','registration_date','expiry_date','next_renewal_date','notes'].forEach((k) => { if (!payload[k]) payload[k] = null; });
    if (payload.billing_cycle !== 'custom') payload.custom_billing_days = null;
    try {
      if (initial) { const saved = await domainsService.update(initial.id, payload); toast.success('Domain updated'); if (onSaved) { onSaved(saved); return; } router.push('/dashboard/domains'); }
      else { const created = await domainsService.create(payload); toast.success('Domain created'); if (onSaved) { onSaved(created); return; } router.push('/dashboard/domains'); }
      router.refresh();
    } catch (e: any) { toast.error(e.message || 'Failed to save domain'); }
    finally { setSubmitting(false); }
  };
  const section = (title: string, children: React.ReactNode) => <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2">{children}</div></CardContent></Card>;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {section('A. Basic Domain Information', <>
        {field('Domain Name *', <Input {...register('domain_name')} placeholder="example.com" />, errors.domain_name?.message)}
        {field('Domain Type', <Select {...register('domain_type')}><option value="internal">Internal</option><option value="external">External</option></Select>)}
        {field('Associated Project', <><Input {...register('project_name')} placeholder="Optional — pick or type a project" list="domain-projects" /><datalist id="domain-projects">{projects.map((p) => <option key={p} value={p} />)}</datalist></>)}
        {field('Domain Status', <Select {...register('status')}><option value="active">Active</option><option value="inactive">Inactive</option><option value="expired">Expired</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option></Select>)}
        {field('Description', <Input {...register('description')} placeholder="Optional description" />)}
      </>)}
      {section('B. Purchase Information', <>
        {field('Purchased From', <Select {...register('purchased_from')}><option value="">Select…</option>{purchasedFrom && !PURCHASED_FROM.includes(purchasedFrom) && <option value={purchasedFrom}>{purchasedFrom}</option>}{PURCHASED_FROM.map((r) => <option key={r} value={r}>{r}</option>)}</Select>)}
        {field('Purchase Date', <Input type="date" {...register('purchase_date')} />)}
        {field('Purchase Cost', <Input type="number" step="0.01" min="0" {...register('purchase_cost', { setValueAs: numOrNull })} placeholder="0.00" />, errors.purchase_cost?.message)}
        {field('Currency', <select {...register('currency')} className="flex h-11 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5 disabled:opacity-50">{currency && !CURRENCIES.some((c) => c.code === currency) && <option value={currency}>{currency}</option>}{CURRENCIES.map((c) => <option key={c.code} value={c.code}>{currencyLabel(c)}</option>)}</select>)}
        {field('Billing Cycle', <Select {...register('billing_cycle')}><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="custom">Custom</option></Select>)}
        {cycle === 'custom' ? field('Custom Billing Interval (days) *', <Input type="number" min="1" {...register('custom_billing_days', { setValueAs: numOrNull })} />, errors.custom_billing_days?.message) : null}
        {field('Invoice / Purchase Reference', <Input {...register('invoice_reference')} placeholder="Optional" />)}
      </>)}
      {section('C. Domain Management Information', <>
        {field('Managed By', <Select {...register('managed_by')}><option value="">Select…</option>{managedBy && !MANAGED_BY.includes(managedBy) && <option value={managedBy}>{managedBy}</option>}{MANAGED_BY.map((m) => <option key={m} value={m}>{m}</option>)}</Select>)}
        {field('Management Platform', <Input {...register('management_platform')} placeholder="e.g. Cloudflare Dashboard" />)}
        {field('Account Email', <Input type="email" {...register('account_email')} placeholder="domains@company.com" />, errors.account_email?.message)}
        {field('Responsible Person / Team', <Input {...register('responsible_person')} placeholder="Optional" />)}
        {field('Nameservers', <Input {...register('nameservers')} placeholder="ns1.example.com, ns2.example.com" />)}
      </>)}
      {section('D. Expiry and Renewal Information', <>
        {field('Start / Registration Date', <Input type="date" {...register('registration_date')} />)}
        {field('Expiry Date', <Input type="date" {...register('expiry_date')} />)}
        {field('Next Renewal Date', <Input type="date" {...register('next_renewal_date')} />)}
        {field('Renewal Cost', <Input type="number" step="0.01" min="0" {...register('renewal_cost', { setValueAs: numOrNull })} placeholder="0.00" />, errors.renewal_cost?.message)}
        <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="domain-autorenew" {...register('auto_renewal_enabled')} className="h-4 w-4 accent-emerald-600" /><Label htmlFor="domain-autorenew">Auto-Renewal Enabled</Label></div>
        <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="domain-reminder" {...register('renewal_reminder_enabled')} className="h-4 w-4 accent-emerald-600" /><Label htmlFor="domain-reminder">Renewal Reminder Enabled</Label></div>
        {field('Reminder Before Expiry', <Select {...register('reminder_days_before')}><option value={3}>3 days</option><option value={7}>7 days</option><option value={15}>15 days</option><option value={30}>30 days</option></Select>)}
      </>)}
      {section('E. Additional Information', <>
        {field('Notes', <Input {...register('notes')} placeholder="Internal notes" />)}
      </>)}
      <div className="flex gap-2"><Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : initial ? 'Update Domain' : 'Create Domain'}</Button><Button type="button" variant="outline" onClick={() => (onCancel ? onCancel() : router.back())}>Cancel</Button></div>
    </form>
  );
}
