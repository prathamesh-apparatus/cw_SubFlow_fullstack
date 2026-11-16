'use client';
import { Menu, User } from 'lucide-react';
export function Header({ title, email, onMenu }: { title: string; email?: string; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden rounded p-2 hover:bg-accent" onClick={onMenu} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <div><p className="text-xs text-muted-foreground">SubFlow / {title}</p><h1 className="text-lg font-semibold leading-tight">{title}</h1></div>
      </div>
      <div className="flex items-center gap-2 text-sm"><span className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><User className="h-4 w-4" /></span><span className="hidden md:block text-muted-foreground">{email || 'Admin'}</span></div>
    </header>
  );
}
