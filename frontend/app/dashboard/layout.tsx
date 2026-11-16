'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { authService } from '@/services/auth.service';
const titles: Record<string, string> = { '/dashboard': 'Dashboard', '/dashboard/categories': 'Categories', '/dashboard/subscriptions': 'All Subscriptions', '/dashboard/subscriptions/new': 'Add Subscription', '/dashboard/renewals': 'Upcoming Renewals', '/dashboard/settings': 'Settings' };
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false); const [email, setEmail] = useState(''); const pathname = usePathname();
  useEffect(() => { authService.me().then((a) => setEmail(a.email)).catch(() => {}); }, []);
  const title = titles[pathname] || (pathname.includes('/categories/') ? 'Category Details' : pathname.includes('/subscriptions/') ? 'Subscription Details' : 'Dashboard');
  return <div className="min-h-screen"><Sidebar open={open} onClose={() => setOpen(false)} /><div className="lg:pl-72"><Header title={title} email={email} onMenu={() => setOpen(true)} /><main className="px-4 pb-6 pt-5 sm:px-6 lg:px-10">{children}</main></div></div>;
}
