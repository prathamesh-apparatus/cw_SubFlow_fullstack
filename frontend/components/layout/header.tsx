'use client';
import { Menu } from 'lucide-react';
export function Header({ title, email, onMenu }: { title: string; email?: string; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-10">
      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full border bg-card shadow-sm transition hover:bg-accent lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <div>
          <p className="text-xs font-medium text-muted-foreground">SubFlow / {title}</p>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-foreground">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-muted-foreground md:block">{email || 'Admin'}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-sm">{(email || 'A').charAt(0).toUpperCase()}</span>
      </div>
    </header>
  );
}
