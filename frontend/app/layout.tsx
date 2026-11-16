import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
export const metadata: Metadata = { title: 'SubFlow — Subscription Management', description: 'Manage all your organisation SaaS subscriptions in one place.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'calc(var(--radius) + 2px)',
              boxShadow: '0 12px 32px rgba(6, 32, 27, 0.14)',
              fontSize: '14px',
              fontWeight: 500,
              padding: '12px 14px',
            },
            success: { iconTheme: { primary: 'hsl(var(--success))', secondary: '#ffffff' } },
            error: { iconTheme: { primary: 'hsl(var(--destructive))', secondary: '#ffffff' } },
          }}
        />
      </body>
    </html>
  );
}
