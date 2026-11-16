import { clsx, type ClassValue } from 'clsx';
export function cn(...inputs: ClassValue[]) { return clsx(inputs); }
export function formatCurrency(value: number | string, currency = 'INR') {
  const n = Number(value) || 0;
  try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n); }
  catch { return `${currency} ${n.toFixed(2)}`; }
}
export function formatDate(d?: string | null) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
export function daysUntil(d?: string | null) { if (!d) return null; const t = new Date(d); t.setHours(0,0,0,0); const now = new Date(); now.setHours(0,0,0,0); return Math.round((t.getTime() - now.getTime()) / 86400000); }
const PASTELS = ['bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700', 'bg-indigo-100 text-indigo-700'];
export function pastelFor(name: string) { let h = 0; for (const ch of name || '') h += ch.charCodeAt(0); return PASTELS[h % PASTELS.length]; }
export function monthlyAmount(s: { total_amount: number | string; billing_cycle: string; custom_billing_days?: number | null }) {
  const amt = Number(s.total_amount) || 0;
  switch (s.billing_cycle) { case 'monthly': return amt; case 'quarterly': return amt / 3; case 'half_yearly': return amt / 6; case 'yearly': return amt / 12; case 'custom': return s.custom_billing_days ? (amt * 30.4375) / s.custom_billing_days : amt; default: return amt; }
}
