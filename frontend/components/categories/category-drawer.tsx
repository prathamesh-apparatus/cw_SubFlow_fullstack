'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, CalendarClock, CircleDollarSign, FolderOpen, Layers, Pencil, Trash2, Wallet, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categoryService } from '@/services/category.service';
import { cn, formatCurrency, formatDate, monthlyAmount, pastelFor } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Category, Subscription } from '@/types';

const cycleLabel: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', half_yearly: 'Half-Yearly', yearly: 'Yearly', custom: 'Custom' };
const textareaClass = 'flex w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5 disabled:opacity-50';

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="flex shrink-0 items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0" />{label}</span>
      <span className="min-w-0 break-all text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <p className="border-b px-4 py-3 text-[13px] font-medium text-foreground">{title}</p>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  );
}

export function CategoryDrawer({ categoryId, onClose, onChanged }: { categoryId: string; onClose: () => void; onChanged: () => void }) {
  const router = useRouter();
  const [cat, setCat] = useState<Category | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const fetchCat = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([categoryService.get(categoryId), categoryService.subscriptions(categoryId)])
      .then(([c, s]) => { setCat(c); setSubs(s.items); })
      .catch((e) => { toast.error(e.message || 'Failed to load category'); if (!silent) onClose(); })
      .finally(() => { if (!silent) setLoading(false); });
  }, [categoryId, onClose]);

  useEffect(() => { fetchCat(); }, [fetchCat]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const openEdit = () => { if (!cat) return; setName(cat.name); setDescription(cat.description || ''); setMode('edit'); };

  const onSave = async () => {
    if (!cat) return;
    if (!name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      await categoryService.update(cat.id, { name: name.trim(), description: description.trim() || null });
      toast.success('Category updated');
      onChanged();
      setMode('view');
      fetchCat(true);
    } catch (e: any) { toast.error(e.message || 'Failed to update category'); }
    finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!cat) return; setDelLoading(true);
    try { await categoryService.remove(cat.id); toast.success('Category deleted'); setConfirm(false); onChanged(); onClose(); }
    catch (e: any) { toast.error(e.message || 'Failed to delete category'); setConfirm(false); }
    finally { setDelLoading(false); }
  };

  const active = subs.filter((s) => s.status === 'active').length;
  const monthly = subs.filter((s) => !['cancelled', 'expired'].includes(s.status)).reduce((a, s) => a + monthlyAmount(s), 0);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/40" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-background shadow-2xl">
        <div className="flex shrink-0 items-center justify-between px-5 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{mode === 'edit' ? 'Edit Category' : 'Category Details'}</p>
          <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        {loading || !cat ? (
          <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading…</p>
        ) : mode === 'edit' ? (
          <div className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
            <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
              <div>
                <Label>Category Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Development Team" className="mt-1.5" />
              </div>
              <div>
                <Label>Description</Label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this team uses…" rows={3} className={cn(textareaClass, 'mt-1.5 resize-none')} />
              </div>
              <div className="flex w-full gap-3 pt-1">
                <Button className="h-10 min-w-0 flex-1 text-sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button variant="ghost" className="h-10 shrink-0 px-5 text-sm" onClick={() => setMode('view')} disabled={saving}>Cancel</Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
              <div className="flex items-start gap-3.5">
                <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', pastelFor(cat.name))}><FolderOpen className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate text-base font-medium text-foreground">{cat.name}</p>
                  <p className="break-words text-xs text-muted-foreground">{cat.description || 'No description'}</p>
                </div>
              </div>

              <Section title="Overview">
                <Row icon={Layers} label="Total subscriptions" value={subs.length} />
                <Row icon={Activity} label="Active subscriptions" value={active} />
                <Row icon={Wallet} label="Monthly expenses" value={formatCurrency(monthly)} />
                <Row icon={CircleDollarSign} label="Yearly expenses" value={formatCurrency(monthly * 12)} />
                <Row icon={CalendarClock} label="Created" value={formatDate(cat.created_at)} />
              </Section>

              <Section title="Subscriptions">
                {subs.length === 0 ? (
                  <p className="px-4 py-4 text-[13px] text-muted-foreground">No subscriptions in this category yet.</p>
                ) : subs.map((s) => (
                  <button key={s.id} onClick={() => { onClose(); router.push(`/dashboard/subscriptions/${s.id}`); }} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-accent/40">
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-medium', pastelFor(s.name))}>{s.name.charAt(0).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-foreground">{s.name}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{s.account_email}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[13px] font-medium text-foreground">{formatCurrency(s.total_amount, s.currency)}</span>
                      <span className="block text-[11px] text-muted-foreground">{s.billing_cycle === 'custom' && s.custom_billing_days ? `Custom (${s.custom_billing_days}d)` : (cycleLabel[s.billing_cycle] || s.billing_cycle)}</span>
                    </span>
                    <Badge className="shrink-0">{s.status}</Badge>
                  </button>
                ))}
              </Section>
            </div>
            <div className="shrink-0 border-t bg-card px-5 py-4">
              <div className="flex w-full items-center gap-3">
                <Button className="h-11 min-w-0 flex-1 text-sm font-medium" onClick={openEdit}><Pencil className="h-4 w-4 shrink-0" /> Edit</Button>
                <Button variant="outline" onClick={() => setConfirm(true)} className="h-11 w-[128px] shrink-0 whitespace-nowrap border-red-200 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4 shrink-0" /> Delete</Button>
              </div>
            </div>
          </>
        )}
      </aside>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={onDelete} loading={delLoading} title="Delete category?" description={`Delete "${cat?.name}" permanently? This cannot be undone.`} />
    </>
  );
}
