'use client';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, EXPIRY_BAND_CLS, expiryBand, expiryChipText, formatCurrency, formatDate, pastelFor } from '@/lib/utils';
import type { Domain } from '@/types';
const HEADERS = ['Domain', 'Project', 'Purchased From', 'Managed By', 'Expiry', 'Purchase Cost', 'Status', ''];
const thClass = 'whitespace-nowrap px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground';
const tdClass = 'whitespace-nowrap px-5 py-3 align-middle';
const iconBtn = 'flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground';
export function DomainTable({ items, onDelete, onView, onEdit }: { items: Domain[]; onDelete: (d: Domain) => void; onView: (d: Domain) => void; onEdit: (d: Domain) => void }) {
  if (!items.length) return <p className="py-10 text-center text-sm text-muted-foreground">No domains found.</p>;
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse text-[13px]">
        <thead>
          <tr className="bg-secondary/60">
            {HEADERS.map((h, i) => <th key={i} className={thClass}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((d) => {
            const days = d.days_remaining ?? null;
            const band = expiryBand(days);
            return (
              <tr key={d.id} className="border-t border-border/70 transition-colors hover:bg-accent/40">
                <td className={tdClass}>
                  <div className="flex items-center gap-2.5">
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold', pastelFor(d.domain_name))}>{d.domain_name.charAt(0).toUpperCase()}</span>
                    <div className="min-w-0">
                      <button onClick={() => onView(d)} className="block font-medium text-foreground hover:underline">{d.domain_name}</button>
                      <span className={cn('mt-0.5 inline-flex items-center rounded-full px-2 py-px text-[10px] font-medium capitalize ring-1 ring-inset', d.domain_type === 'internal' ? 'bg-sky-50 text-sky-700 ring-sky-600/15' : 'bg-violet-50 text-violet-700 ring-violet-600/15')}>{d.domain_type}</span>
                    </div>
                  </div>
                </td>
                <td className={tdClass}>{d.project_name || '—'}</td>
                <td className={tdClass}>{d.purchased_from || '—'}</td>
                <td className={tdClass}>{d.managed_by || '—'}</td>
                <td className={tdClass}>
                  <div className="flex items-center gap-2">
                    <span>{formatDate(d.expiry_date)}</span>
                    {d.expiry_date && <span className={cn('inline-flex items-center rounded-full px-2 py-px text-[10px] font-medium ring-1 ring-inset', EXPIRY_BAND_CLS[band])}>{expiryChipText(days)}</span>}
                  </div>
                </td>
                <td className={cn(tdClass, 'font-medium')}>{d.purchase_cost != null ? formatCurrency(d.purchase_cost, d.currency) : '—'}</td>
                <td className={tdClass}><Badge>{d.status}</Badge></td>
                <td className={tdClass}>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onView(d)} className={iconBtn} aria-label={`View ${d.domain_name}`}><Eye className="h-4 w-4" /></button>
                    <button onClick={() => onEdit(d)} className={iconBtn} aria-label={`Edit ${d.domain_name}`}><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(d)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50" aria-label={`Delete ${d.domain_name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
