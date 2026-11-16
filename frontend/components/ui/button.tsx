import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
const styles: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground shadow-sm hover:opacity-85',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
  outline: 'border border-input bg-card text-foreground shadow-sm hover:bg-accent',
  ghost: 'text-foreground hover:bg-accent',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:opacity-90',
};
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: 'sm' | 'default' | 'lg'; }
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'default', ...props }, ref) => (
  <button ref={ref} className={cn('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition disabled:opacity-50 disabled:pointer-events-none', size === 'sm' ? 'h-8 px-3.5 text-xs' : size === 'lg' ? 'h-10 px-6 text-sm' : 'h-9 px-4 text-sm', styles[variant], className)} {...props} />
));
Button.displayName = 'Button';
