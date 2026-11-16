'use client';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/utils';
const COLORS = ['#059669', '#2563EB', '#D97706', '#7C3AED', '#E11D48', '#0891B2', '#65A30D', '#DB2777', '#475569', '#EA580C'];
const tooltipStyle = { borderRadius: 14, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', boxShadow: '0 12px 32px -12px rgba(28,25,23,0.18)', fontSize: 12, padding: '8px 12px' } as const;
const tickStyle = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' };
export function ExpensesChart({ data }: { data: { label: string; total: number }[] }) {
  if (!data.length) return <p className="py-10 text-center text-sm text-muted-foreground">No expense data yet.</p>;
  return <ResponsiveContainer width="100%" height={280}><AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="0" /><XAxis dataKey="label" tick={tickStyle} tickLine={false} axisLine={false} dy={8} /><YAxis tick={tickStyle} tickLine={false} axisLine={false} width={48} /><Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'hsl(var(--border))' }} formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Expenses']} /><Area type="monotone" dataKey="total" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="hsl(var(--chart-1))" fillOpacity={0.08} activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }} /></AreaChart></ResponsiveContainer>;
}
export function CategoryDonut({ data }: { data: { name: string; monthly_expense: number }[] }) {
  const filtered = data.filter((d) => Number(d.monthly_expense) > 0);
  if (!filtered.length) return <p className="py-10 text-center text-sm text-muted-foreground">No category expenses yet. Add subscriptions to see the breakdown.</p>;
  const total = filtered.reduce((a, d) => a + Number(d.monthly_expense), 0);
  return <><div className="relative"><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={filtered} dataKey="monthly_expense" nameKey="name" innerRadius={74} outerRadius={90} paddingAngle={0} cornerRadius={0} stroke="none">{filtered.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}/mo`, 'Monthly']} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><p className="text-base font-medium text-foreground">{formatCurrency(total)}</p><p className="text-[11px] text-muted-foreground">per month</p></div></div><div className="mt-3 space-y-2">{filtered.map((d, i) => <div key={d.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2.5 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{d.name}</span><span className="font-semibold text-foreground">₹{Number(d.monthly_expense).toLocaleString('en-IN', { maximumFractionDigits: 0 })}/mo</span></div>)}</div></>;
}
