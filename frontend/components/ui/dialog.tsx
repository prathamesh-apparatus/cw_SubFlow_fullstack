import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Dialog({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div className={cn('w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-card shadow-[0_24px_64px_-16px_rgba(28,25,23,0.35)]', className)} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5"><h2 className="text-lg font-semibold tracking-tight">{title}</h2><button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground"><X className="h-4 w-4" /></button></div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
export function ConfirmDialog({ open, onClose, onConfirm, title, description, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; loading?: boolean }) {
  return <Dialog open={open} onClose={onClose} title={title}><p className="text-sm leading-relaxed text-muted-foreground">{description}</p><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="h-10 rounded-full border border-input bg-card px-5 text-sm font-medium shadow-sm transition hover:bg-accent">Cancel</button><button onClick={onConfirm} disabled={loading} className="h-10 rounded-full bg-destructive px-5 text-sm font-medium text-destructive-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50">{loading ? 'Deleting…' : 'Delete'}</button></div></Dialog>;
}
