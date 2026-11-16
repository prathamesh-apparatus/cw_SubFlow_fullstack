'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, ConfirmDialog } from '@/components/ui/dialog';
import { categoryService } from '@/services/category.service';
import { categorySchema, CategoryFormValues } from '@/lib/validations';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Category } from '@/types';
export const dynamic = 'force-dynamic';
export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(''); const [sort, setSort] = useState('name_asc');
  const [dialog, setDialog] = useState(false); const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null); const [delLoading, setDelLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema) });
  const load = useCallback(() => { setLoading(true); categoryService.list(search, sort).then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, [search, sort]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  const openCreate = () => { setEditing(null); reset({ name: '', description: '' }); setDialog(true); };
  const openEdit = (c: Category) => { setEditing(c); reset({ name: c.name, description: c.description || '' }); setDialog(true); };
  const onSubmit = async (v: CategoryFormValues) => { try { if (editing) { await categoryService.update(editing.id, v); toast.success('Category updated'); } else { await categoryService.create(v); toast.success('Category created'); } setDialog(false); load(); } catch (e: any) { toast.error(e.message); } };
  const onDelete = async () => { if (!deleting) return; setDelLoading(true); try { await categoryService.remove(deleting.id); toast.success('Category deleted'); setDeleting(null); load(); } catch (e: any) { toast.error(e.message); setDeleting(null); } finally { setDelLoading(false); } };
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Management</p><h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">Categories</h2><p className="mt-1 text-sm text-muted-foreground">Organise subscriptions by team and track what each one spends.</p></div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Category</Button>
      </div>
      <div className="flex flex-col gap-3 rounded-[1.25rem] border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search categories…" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-full border-transparent bg-secondary/70 pl-11 shadow-none focus:bg-card" /></div>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full sm:w-48"><option value="name_asc">Name A–Z</option><option value="name_desc">Name Z–A</option><option value="created_desc">Newest first</option><option value="expense_desc">Highest expense</option></Select>
      </div>
      {loading ? <p className="py-12 text-center text-muted-foreground">Loading…</p> : items.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No categories found. Create one to organise subscriptions by team.</CardContent></Card> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => <Card key={c.id} className="transition hover:shadow-[0_20px_44px_-16px_rgba(28,25,23,0.18)]"><CardContent className="pt-5">
            <div className="flex items-start justify-between"><Link href={`/dashboard/categories/${c.id}`} className="text-lg font-semibold hover:underline">{c.name}</Link><div className="flex gap-1"><button onClick={() => openEdit(c)} className="flex h-9 w-9 items-center justify-center rounded-full border bg-card shadow-sm transition hover:bg-accent" aria-label="Edit"><Pencil className="h-4 w-4" /></button><button onClick={() => setDeleting(c)} className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-destructive shadow-sm transition hover:bg-accent" aria-label="Delete"><Trash2 className="h-4 w-4" /></button></div></div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description || 'No description'}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm"><div className="rounded-2xl bg-secondary p-2.5"><p className="font-semibold">{c.subscription_count ?? 0}</p><p className="text-[11px] text-muted-foreground">Subscriptions</p></div><div className="rounded-2xl bg-secondary p-2.5"><p className="font-semibold">{formatCurrency(c.total_monthly_expense || 0)}</p><p className="text-[11px] text-muted-foreground">Monthly</p></div><div className="rounded-2xl bg-secondary p-2.5"><p className="font-semibold text-xs pt-1">{formatDate(c.created_at)}</p><p className="text-[11px] text-muted-foreground">Created</p></div></div>
            <Link href={`/dashboard/categories/${c.id}`} className="mt-4 flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline"><Eye className="h-4 w-4" /> View subscriptions</Link>
          </CardContent></Card>)}
        </div>)}
      <Dialog open={dialog} onClose={() => setDialog(false)} title={editing ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><Label>Category Name *</Label><Input {...register('name')} placeholder="Development Team" className="mt-1.5" />{errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}</div>
          <div><Label>Description</Label><Input {...register('description')} placeholder="What this team uses…" className="mt-1.5" /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Category'}</Button></div>
        </form>
      </Dialog>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={onDelete} loading={delLoading} title="Delete category?" description={`Delete "${deleting?.name}"? Categories with subscriptions cannot be deleted — you will get an error and must reassign or delete those subscriptions first.`} />
    </div>
  );
}
