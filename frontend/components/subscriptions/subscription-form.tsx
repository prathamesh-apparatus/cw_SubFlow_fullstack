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
import { subscriptionSchema, SubscriptionFormValues } from '@/lib/validations';
import { categoryService } from '@/services/category.service';
import { subscriptionService } from '@/services/subscription.service';
import toast from 'react-hot-toast';
import type { Category, Subscription } from '@/types';

const empty: SubscriptionFormValues = { name: '', category_id: '', description: '', website_url: '', account_email: '', account_username: '', price: 0, currency: 'INR', billing_cycle: 'monthly', custom_billing_days: null, tax_amount: 0, payment_method: '', auto_pay_enabled: false, payment_status: 'pending', payment_notes: '', start_date: '', last_payment_date: '', next_renewal_date: '', end_date: '', renewal_reminder: true, reminder_days_before: 7, status: 'active', auto_renewal_enabled: false, notes: '' };
function toDate(v?: string | null) { return v ? String(v).slice(0, 10) : ''; }
export function SubscriptionForm({ initial, defaultCategoryId }: { initial?: Subscription; defaultCategoryId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<SubscriptionFormValues>({ resolver: zodResolver(subscriptionSchema), defaultValues: initial ? { ...empty, ...initial, price: Number(initial.price), tax_amount: Number(initial.tax_amount), start_date: toDate(initial.start_date), last_payment_date: toDate(initial.last_payment_date), next_renewal_date: toDate(initial.next_renewal_date), end_date: toDate(initial.end_date), payment_method: initial.payment_method || '', description: initial.description || '', website_url: initial.website_url || '', account_username: initial.account_username || '', payment_notes: initial.payment_notes || '', notes: initial.notes || '' } as SubscriptionFormValues : { ...empty, category_id: defaultCategoryId || '' } });
  const { register, handleSubmit, watch, formState: { errors } } = form;
  const price = watch('price'); const tax = watch('tax_amount'); const cycle = watch('billing_cycle');
  const total = (Number(price) || 0) + (Number(tax) || 0);
  useEffect(() => { categoryService.list().then(setCategories).catch(() => {}); }, []);
  const err = (m?: string) => m ? <p className="mt-1 text-xs text-destructive">{m}</p> : null;
  const field = (label: string, el: React.ReactNode, e?: string) => <div><Label>{label}</Label><div className="mt-1.5">{el}</div>{err(e)}</div>;
  const onSubmit = async (values: SubscriptionFormValues) => {
    if (submitting) return; setSubmitting(true);
    const payload: any = { ...values };
    ['description','website_url','account_username','payment_method','payment_notes','notes','start_date','last_payment_date','next_renewal_date','end_date'].forEach((k) => { if (!payload[k]) payload[k] = null; });
    if (payload.billing_cycle !== 'custom') payload.custom_billing_days = null;
    try {
      if (initial) { await subscriptionService.update(initial.id, payload); toast.success('Subscription updated'); router.push(`/dashboard/subscriptions/${initial.id}`); }
      else { const created = await subscriptionService.create(payload); toast.success('Subscription created'); router.push(`/dashboard/subscriptions/${created.id}`); }
      router.refresh();
    } catch (e: any) { toast.error(e.message || 'Failed to save subscription'); }
    finally { setSubmitting(false); }
  };
  const section = (title: string, children: React.ReactNode) => <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2">{children}</div></CardContent></Card>;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {section('A. Basic Information', <>
        {field('Subscription Name *', <Input {...register('name')} placeholder="GitHub" />, errors.name?.message)}
        {field('Category *', <Select {...register('category_id')}><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>, errors.category_id?.message)}
        {field('Description', <Input {...register('description')} placeholder="Optional description" />)}
        {field('Website URL', <Input {...register('website_url')} placeholder="https://…" />, errors.website_url?.message)}
        {field('Account Email *', <Input type="email" {...register('account_email')} placeholder="team@company.com" />, errors.account_email?.message)}
        {field('Account Username', <Input {...register('account_username')} placeholder="Optional" />)}
      </>)}
      {section('B. Pricing Details', <>
        {field('Price *', <Input type="number" step="0.01" min="0" {...register('price')} />, errors.price?.message)}
        {field('Currency', <Input {...register('currency')} />)}
        {field('Billing Cycle', <Select {...register('billing_cycle')}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="half_yearly">Half-Yearly</option><option value="yearly">Yearly</option><option value="custom">Custom</option></Select>)}
        {cycle === 'custom' ? field('Custom Billing Interval (days) *', <Input type="number" min="1" {...register('custom_billing_days')} />, errors.custom_billing_days?.message) : null}
        {field('Tax Amount', <Input type="number" step="0.01" min="0" {...register('tax_amount')} />, errors.tax_amount?.message)}
        <div><Label>Total Amount (auto)</Label><div className="mt-1.5 flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-semibold">₹{total.toFixed(2)}</div></div>
      </>)}
      {section('C. Payment Details', <>
        {field('Payment Method', <Select {...register('payment_method')}><option value="">Select…</option><option value="credit_card">Credit Card</option><option value="debit_card">Debit Card</option><option value="upi">UPI</option><option value="net_banking">Net Banking</option><option value="other">Other</option></Select>)}
        {field('Payment Status', <Select {...register('payment_status')}><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option></Select>)}
        <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="autopay" {...register('auto_pay_enabled')} className="h-4 w-4" /><Label htmlFor="autopay">Auto-Pay Enabled</Label></div>
        {field('Payment Notes', <Input {...register('payment_notes')} placeholder="No card numbers — notes only" />)}
      </>)}
      {section('D. Renewal Information', <>
        {field('Start Date', <Input type="date" {...register('start_date')} />)}
        {field('Last Payment Date', <Input type="date" {...register('last_payment_date')} />)}
        {field('Next Renewal Date', <Input type="date" {...register('next_renewal_date')} />)}
        {field('End Date', <Input type="date" {...register('end_date')} />)}
        <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="reminder" {...register('renewal_reminder')} className="h-4 w-4" /><Label htmlFor="reminder">Renewal Reminder</Label></div>
        {field('Reminder Days Before', <Select {...register('reminder_days_before')}><option value={3}>3 Days</option><option value={7}>7 Days</option><option value={15}>15 Days</option><option value={30}>30 Days</option></Select>)}
      </>)}
      {section('E. Subscription Status', <>
        {field('Status', <Select {...register('status')}><option value="active">Active</option><option value="inactive">Inactive</option><option value="cancelled">Cancelled</option><option value="expired">Expired</option><option value="trial">Trial</option></Select>)}
        <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="autorenew" {...register('auto_renewal_enabled')} className="h-4 w-4" /><Label htmlFor="autorenew">Auto-Renewal Enabled</Label></div>
        {field('Internal Notes', <Input {...register('notes')} placeholder="Internal notes" />)}
      </>)}
      <div className="flex gap-2"><Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : initial ? 'Update Subscription' : 'Create Subscription'}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
    </form>
  );
}
