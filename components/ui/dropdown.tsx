'use client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  return <div ref={ref} className="relative"><button onClick={() => setOpen((o) => !o)} className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></button>{open && <div className="absolute right-0 z-40 mt-2 w-44 rounded-2xl border bg-card p-1.5 shadow-[0_16px_40px_-12px_rgba(28,25,23,0.25)]" onClick={() => setOpen(false)}>{children}</div>}</div>;
}
export function DropdownItem({ children, onClick, danger }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-accent ${danger ? 'text-destructive' : ''}`}>{children}</button>;
}
