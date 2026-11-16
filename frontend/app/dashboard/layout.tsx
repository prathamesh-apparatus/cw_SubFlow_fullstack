'use client';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { authService } from '@/services/auth.service';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false); const [email, setEmail] = useState('');
  useEffect(() => { authService.me().then((a) => setEmail(a.email)).catch(() => {}); }, []);
  return <div className="min-h-screen"><Sidebar open={open} onClose={() => setOpen(false)} /><div className="lg:pl-72"><Header email={email} onMenu={() => setOpen(true)} /><main className="p-3 sm:p-4 lg:p-5">{children}</main></div></div>;
}
