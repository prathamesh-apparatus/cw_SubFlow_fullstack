'use client';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, FolderOpen, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, ConfirmDialog } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { CategoryDrawer } from '@/components/categories/category-drawer';
import { categoryService } from '@/services/category.service';
import { categorySchema, CategoryFormValues } from '@/lib/validations';
import { cn, formatCurrency, formatDate, pastelFor } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Category } from '@/types';
export const dynamic = 'force-dynamic';
const PAGE_SIZE = 10;
export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(''); const [sort, setSort] = useState('name_asc');
  const [dialog, setDialog] = useState(false); const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null); const [delLoading, setDelLoading] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema) });
  const load = useCallback(() => { setLoading(true); categoryService.list(search, sort).then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, [search, sort]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { setPage(1); }, [search, sort]);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const pagedItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = items.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, items.length);
  const openCreate = () => { setEditing(null); reset({ name: '', description: '' }); setDialog(true); };
  const openEdit = (c: Category) => { setEditing(c); reset({ name: c.name, description: c.description || '' }); setDialog(true); };
  const onSubmit = async (v: CategoryFormValues) => { try { if (editing) { await categoryService.update(editing.id, v); toast.success('Category updated'); } else { await categoryService.create(v); toast.success('Category created'); } setDialog(false); load(); } catch (e: any) { toast.error(e.message); } };
  const onDelete = async () => { if (!deleting) return; setDelLoading(true); try { await categoryService.remove(deleting.id); toast.success('Category deleted'); setDeleting(null); load(); } catch (e: any) { toast.error(e.message); setDeleting(null); } finally { setDelLoading(false); } };
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Management</p><h2 className="mt-1.5 text-xl font-medium tracking-tight text-foreground">Categories</h2><p className="mt-1 text-sm text-muted-foreground">Organise subscriptions by team and track what each one spends.</p></div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Category</Button>
      </div>
      <div className="flex flex-col gap-3 rounded-[1.25rem] border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search categories…" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-full border-transparent bg-secondary/70 pl-11 shadow-none focus:bg-card" /></div>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full sm:w-48"><option value="name_asc">Name A–Z</option><option value="name_desc">Name Z–A</option><option value="created_desc">Newest first</option><option value="expense_desc">Highest expense</option></Select>
      </div>
      {loading ? <p className="py-12 text-center text-muted-foreground">Loading…</p> : (
        <Card className="overflow-hidden"><CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[13px]">
              <thead>
                <tr className="bg-secondary/60">
                  <th className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Category</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Subscriptions</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Monthly expense</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Created</th>
                  <th className="whitespace-nowrap px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr className="border-t border-border/70"><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">No categories found.</td></tr>
                ) : pagedItems.map((c) => (
                  <tr key={c.id} className="border-t border-border/70 transition-colors hover:bg-accent/40">
                    <td className="px-5 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', pastelFor(c.name))}><FolderOpen className="h-4 w-4" /></span>
                        <div className="min-w-0">
                          <button onClick={() => setViewing(c.id)} className="text-[13px] font-medium text-foreground hover:underline">{c.name}</button>
                          <p className="max-w-[280px] truncate text-[11px] text-muted-foreground">{c.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 align-middle">{c.subscription_count ?? 0}</td>
                    <td className="whitespace-nowrap px-5 py-3 align-middle font-medium">{formatCurrency(c.total_monthly_expense || 0)}</td>
                    <td className="whitespace-nowrap px-5 py-3 align-middle">{formatDate(c.created_at)}</td>
                    <td className="whitespace-nowrap px-5 py-3 align-middle">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewing(c.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label={`View ${c.name}`}><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openEdit(c)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label={`Edit ${c.name}`}><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleting(c)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50" aria-label={`Delete ${c.name}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t px-4 py-2.5 text-[11px] text-muted-foreground">Showing {from}–{to} of {items.length} categories</p>
          {totalPages > 1 && <div className="px-4 pb-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>}
        </CardContent></Card>)}
      <Dialog open={dialog} onClose={() => setDialog(false)} title={editing ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><Label>Category Name *</Label><Input {...register('name')} placeholder="Development Team" className="mt-1.5" />{errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}</div>
          <div><Label>Description</Label><Input {...register('description')} placeholder="What this team uses…" className="mt-1.5" /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Category'}</Button></div>
        </form>
      </Dialog>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={onDelete} loading={delLoading} title="Delete category?" description={`Delete "${deleting?.name}"? Categories with subscriptions cannot be deleted — you will get an error and must reassign or delete those subscriptions first.`} />
      {viewing && <CategoryDrawer categoryId={viewing} onClose={() => setViewing(null)} onChanged={load} />}
    </div>
  );
}
