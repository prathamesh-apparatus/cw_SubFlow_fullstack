import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) { return <div className="w-full overflow-x-auto"><table className={cn('w-full text-sm', className)} {...props} /></div>; }
export function THead(props: HTMLAttributes<HTMLTableSectionElement>) { return <thead className="border-b bg-muted/50" {...props} />; }
export function TBody(props: HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props} />; }
export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn('border-b last:border-0 hover:bg-muted/40', className)} {...props} />; }
export function TH({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th className={cn('px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap', className)} {...props} />; }
export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn('px-4 py-3 align-middle whitespace-nowrap', className)} {...props} />; }
