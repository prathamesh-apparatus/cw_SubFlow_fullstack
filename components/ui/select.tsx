import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn('flex h-11 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5 disabled:opacity-50', className)} {...props}>{children}</select>
));
Select.displayName = 'Select';
