import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
const map: Record<string, string> = { active: 'bg-green-100 text-green-800', paid: 'bg-green-100 text-green-800', trial: 'bg-blue-100 text-blue-800', pending: 'bg-yellow-100 text-yellow-800', inactive: 'bg-gray-100 text-gray-700', failed: 'bg-red-100 text-red-800', cancelled: 'bg-red-100 text-red-800', expired: 'bg-red-100 text-red-800' };
export function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const key = typeof children === 'string' ? children.toLowerCase() : '';
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', map[key] || 'bg-secondary text-secondary-foreground', className)} {...props}>{children}</span>;
}
