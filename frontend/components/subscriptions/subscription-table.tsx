'use client';
import Link from 'next/link';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatDate, pastelFor } from '@/lib/utils';
import type { Subscription } from '@/types';
const cycleLabel: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', half_yearly: 'Half-Yearly', yearly: 'Yearly', custom: 'Custom' };
const HEADERS = ['Name', 'Category', 'Account Email', 'Price', 'Cycle', 'Auto-Pay', 'Payment', 'Renewal', 'Status', ''];
const thClass = 'whitespace-nowrap px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground';
const tdClass = 'whitespace-nowrap px-5 py-3 align-middle';
const iconBtn = 'flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground';
export function SubscriptionTable({ items, onDelete }: { items: Subscription[]; onDelete: (s: Subscription) => void }) {
  if (!items.length) return <p className="py-10 text-center text-sm text-muted-foreground">No subscriptions found.</p>;
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse text-[13px]">
        <thead>
          <tr className="bg-secondary/60">
            {HEADERS.map((h, i) => <th key={i} className={thClass}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} className="border-t border-border/70 transition-colors hover:bg-accent/40">
              <td className={tdClass}>
                <div className="flex items-center gap-2.5">
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold', pastelFor(s.name))}>{s.name.charAt(0).toUpperCase()}</span>
                  <Link href={`/dashboard/subscriptions/${s.id}`} className="font-medium text-foreground hover:underline">{s.name}</Link>
                </div>
              </td>
              <td className={tdClass}>{s.category_name || '—'}</td>
              <td className={tdClass}>{s.account_email}</td>
              <td className={cn(tdClass, 'font-medium')}>{formatCurrency(s.total_amount, s.currency)}</td>
              <td className={tdClass}>{cycleLabel[s.billing_cycle] || s.billing_cycle}{s.billing_cycle === 'custom' && s.custom_billing_days ? ` (${s.custom_billing_days}d)` : ''}</td>
              <td className={tdClass}>{s.auto_pay_enabled ? <Badge>Yes</Badge> : <span className="text-muted-foreground">No</span>}</td>
              <td className={tdClass}><Badge>{s.payment_status}</Badge></td>
              <td className={tdClass}>{formatDate(s.next_renewal_date)}</td>
              <td className={tdClass}><Badge>{s.status}</Badge></td>
              <td className={tdClass}>
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/subscriptions/${s.id}`} className={iconBtn} aria-label={`View ${s.name}`}><Eye className="h-4 w-4" /></Link>
                  <Link href={`/dashboard/subscriptions/${s.id}/edit`} className={iconBtn} aria-label={`Edit ${s.name}`}><Pencil className="h-4 w-4" /></Link>
                  <button onClick={() => onDelete(s)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50" aria-label={`Delete ${s.name}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
