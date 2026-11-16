import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn('flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50', className)} {...props}>{children}</select>
));
Select.displayName = 'Select';
