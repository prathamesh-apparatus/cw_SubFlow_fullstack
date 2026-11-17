'use client';
import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { DomainTable } from '@/components/domains/domain-table';
import { DomainDrawer } from '@/components/domains/domain-drawer';
import { domainsService } from '@/services/domains.service';
import toast from 'react-hot-toast';
import type { Domain, DomainFacets } from '@/types';
export const dynamic = 'force-dynamic';

const SORT_MAP: Record<string, { sort: string; order: string }> = {
  expiry_asc: { sort: 'expiry_date', order: 'asc' },
  expiry_desc: { sort: 'expiry_date', order: 'desc' },
  cost_asc: { sort: 'purchase_cost', order: 'asc' },
  cost_desc: { sort: 'purchase_cost', order: 'desc' },
  name_asc: { sort: 'domain_name', order: 'asc' },
  name_desc: { sort: 'domain_name', order: 'desc' },
  created_desc: { sort: 'created_at', order: 'desc' },
};

export default function DomainsPage() {
  const [items, setItems] = useState<Domain[]>([]);
  const [total, setTotal] = useState(0); const [totalPages, setTotalPages] = useState(1); const [loading, setLoading] = useState(true);
  const [facets, setFacets] = useState<DomainFacets>({ projects: [], registrars: [], managers: [] });
  const [deleting, setDeleting] = useState<Domain | null>(null); const [delLoading, setDelLoading] = useState(false);
  const [drawer, setDrawer] = useState<{ id: string; mode: 'view' | 'edit' } | null>(null);
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ search: '', type: '', project: '', registrar: '', manager: '', status: '', sort: 'expiry_asc', page: '1', limit: '10' });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v, page: k === 'page' ? v : '1' }));

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    Object.entries(f).forEach(([k, v]) => { if (v && k !== 'sort') params[k] = v; });
    const s = SORT_MAP[f.sort] || SORT_MAP.expiry_asc;
    params.sort = s.sort; params.order = s.order;
    domainsService.list(params).then((r) => { setItems(r.items); setTotal(r.total); setTotalPages(r.totalPages); }).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, [f]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const loadFacets = useCallback(() => {
    domainsService.facets().then(setFacets).catch(() => {});
  }, []);
  useEffect(() => { loadFacets(); }, [loadFacets]);

  const clear = () => setF({ search: '', type: '', project: '', registrar: '', manager: '', status: '', sort: 'expiry_asc', page: '1', limit: '10' });
  const onDelete = async () => { if (!deleting) return; setDelLoading(true); try { await domainsService.remove(deleting.id); toast.success('Domain deleted'); setDeleting(null); load(); loadFacets(); } catch (e: any) { toast.error(e.message); } finally { setDelLoading(false); } };
  const onChanged = () => { load(); loadFacets(); };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Management</p><h2 className="mt-1.5 text-xl font-medium tracking-tight text-foreground">Domains</h2><p className="mt-1 text-sm text-muted-foreground">Every organisation domain — where it was bought, who manages it, and when it expires.</p></div>
        <Button className="w-full sm:w-auto" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Add Domain</Button>
      </div>

      <div className="space-y-3 rounded-[1.25rem] border bg-card p-3 shadow-sm">
        <div className="relative w-full"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search domain name…" value={f.search} onChange={(e) => set('search', e.target.value)} className="h-10 rounded-full border-transparent bg-secondary/70 pl-11 shadow-none focus:bg-card" /></div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          <Select className="h-9 rounded-full text-[13px]" value={f.type} onChange={(e) => set('type', e.target.value)}><option value="">Type: All</option><option value="internal">Internal</option><option value="external">External</option></Select>
          <Select className="h-9 rounded-full text-[13px]" value={f.project} onChange={(e) => set('project', e.target.value)}><option value="">Project: All</option>{facets.projects.map((p) => <option key={p} value={p}>{p}</option>)}</Select>
          <Select className="h-9 rounded-full text-[13px]" value={f.registrar} onChange={(e) => set('registrar', e.target.value)}><option value="">Registrar: All</option>{facets.registrars.map((r) => <option key={r} value={r}>{r}</option>)}</Select>
          <Select className="h-9 rounded-full text-[13px]" value={f.manager} onChange={(e) => set('manager', e.target.value)}><option value="">Managed by: All</option>{facets.managers.map((m) => <option key={m} value={m}>{m}</option>)}</Select>
          <Select className="h-9 rounded-full text-[13px]" value={f.status} onChange={(e) => set('status', e.target.value)}><option value="">Status: All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="expired">Expired</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option></Select>
          <Select className="h-9 rounded-full text-[13px]" value={f.sort} onChange={(e) => set('sort', e.target.value)}><option value="expiry_asc">Expiry: Soonest</option><option value="expiry_desc">Expiry: Latest</option><option value="cost_desc">Cost: High → Low</option><option value="cost_asc">Cost: Low → High</option><option value="name_asc">Name: A → Z</option><option value="name_desc">Name: Z → A</option><option value="created_desc">Newest</option></Select>
        </div>
      </div>
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{total} domain(s)</p><Button variant="ghost" size="sm" onClick={clear}><X className="h-4 w-4" /> Clear all filters</Button></div>
      <Card className="overflow-hidden"><CardContent className="p-0">{loading ? <p className="py-12 text-center text-muted-foreground">Loading…</p> : <DomainTable items={items} onDelete={setDeleting} onView={(d) => setDrawer({ id: d.id, mode: 'view' })} onEdit={(d) => setDrawer({ id: d.id, mode: 'edit' })} />}</CardContent></Card>
      <Pagination page={Number(f.page)} totalPages={totalPages} alwaysShow onPageChange={(p) => set('page', String(p))} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={onDelete} loading={delLoading} title="Delete domain?" description={`Delete "${deleting?.domain_name}" permanently? This cannot be undone.`} />
      <DomainDrawer domainId={drawer?.id ?? null} initialMode={drawer?.mode ?? 'view'} createOpen={creating} onClose={() => { setDrawer(null); setCreating(false); }} onChanged={onChanged} />
    </div>
  );
}
