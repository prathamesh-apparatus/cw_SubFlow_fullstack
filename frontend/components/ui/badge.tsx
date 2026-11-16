import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
const map: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  yes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  trial: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  inactive: 'bg-stone-100 text-stone-600 ring-stone-500/15',
  failed: 'bg-red-50 text-red-700 ring-red-600/15',
  cancelled: 'bg-red-50 text-red-700 ring-red-600/15',
  expired: 'bg-red-50 text-red-700 ring-red-600/15',
};
export function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const key = typeof children === 'string' ? children.toLowerCase() : '';
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset', map[key] || 'bg-secondary text-secondary-foreground ring-border', className)} {...props}>{children}</span>;
}
