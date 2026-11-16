import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Dialog({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={cn('w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-card shadow-xl', className)} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-5"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-accent"><X className="h-5 w-5" /></button></div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
export function ConfirmDialog({ open, onClose, onConfirm, title, description, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; loading?: boolean }) {
  return <Dialog open={open} onClose={onClose} title={title}><p className="text-sm text-muted-foreground">{description}</p><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button><button onClick={onConfirm} disabled={loading} className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground disabled:opacity-50">{loading ? 'Deleting…' : 'Delete'}</button></div></Dialog>;
}
