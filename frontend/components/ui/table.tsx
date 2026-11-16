import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) { return <div className="w-full overflow-x-auto"><table className={cn('w-full text-sm', className)} {...props} /></div>; }
export function THead(props: HTMLAttributes<HTMLTableSectionElement>) { return <thead {...props} />; }
export function TBody(props: HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props} />; }
export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn('border-b border-border/70 last:border-0 transition-colors hover:bg-accent/50', className)} {...props} />; }
export function TH({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th className={cn('border-b px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap', className)} {...props} />; }
export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn('px-5 py-4 align-middle whitespace-nowrap', className)} {...props} />; }
