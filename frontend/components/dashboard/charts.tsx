'use client';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
const COLORS = ['hsl(var(--chart-1))','hsl(var(--chart-2))','hsl(var(--chart-3))','hsl(var(--chart-4))','hsl(var(--chart-5))','#64748b','#0ea5e9','#f59e0b'];
export function ExpensesChart({ data }: { data: { label: string; total: number }[] }) {
  if (!data.length) return <p className="py-10 text-center text-sm text-muted-foreground">No expense data yet.</p>;
  return <ResponsiveContainer width="100%" height={280}><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Expenses']} /><Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} /></AreaChart></ResponsiveContainer>;
}
export function CategoryDonut({ data }: { data: { name: string; monthly_expense: number }[] }) {
  const filtered = data.filter((d) => Number(d.monthly_expense) > 0);
  if (!filtered.length) return <p className="py-10 text-center text-sm text-muted-foreground">No category expenses yet. Add subscriptions to see the breakdown.</p>;
  return <><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={filtered} dataKey="monthly_expense" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>{filtered.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}/mo`, 'Monthly']} /></PieChart></ResponsiveContainer><div className="mt-2 space-y-1">{filtered.map((d, i) => <div key={d.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{d.name}</span><span className="font-medium">₹{Number(d.monthly_expense).toLocaleString('en-IN', { maximumFractionDigits: 0 })}/mo</span></div>)}</div></>;
}
