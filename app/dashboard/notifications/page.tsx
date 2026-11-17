'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlarmClock, AlertOctagon, Bell, BellOff, CalendarClock, CalendarX, CheckCheck, CreditCard, FolderEdit, FolderPlus, FolderX, Globe, Loader2, Mail, Pencil, PlusCircle, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { notificationsService, type NotificationItem } from '@/services/notifications.service';
import { cn, formatDate } from '@/lib/utils';
export const dynamic = 'force-dynamic';
const PAGE_SIZE = 10;

const META: Record<string, { icon: typeof Bell; cls: string }> = {
  renewal_overdue: { icon: CalendarX, cls: 'bg-red-50 text-red-600' },
  renewal_upcoming: { icon: CalendarClock, cls: 'bg-amber-50 text-amber-600' },
  payment_failed: { icon: CreditCard, cls: 'bg-red-50 text-red-600' },
  subscription_created: { icon: PlusCircle, cls: 'bg-emerald-50 text-emerald-600' },
  subscription_updated: { icon: Pencil, cls: 'bg-blue-50 text-blue-600' },
  subscription_deleted: { icon: Trash2, cls: 'bg-rose-50 text-rose-600' },
  category_created: { icon: FolderPlus, cls: 'bg-violet-50 text-violet-600' },
  category_updated: { icon: FolderEdit, cls: 'bg-amber-50 text-amber-600' },
  category_deleted: { icon: FolderX, cls: 'bg-rose-50 text-rose-600' },
  settings_email_changed: { icon: Mail, cls: 'bg-slate-100 text-slate-600' },
  settings_password_changed: { icon: ShieldCheck, cls: 'bg-slate-100 text-slate-600' },
  domain_created: { icon: Globe, cls: 'bg-emerald-50 text-emerald-600' },
  domain_updated: { icon: Pencil, cls: 'bg-blue-50 text-blue-600' },
  domain_deleted: { icon: Trash2, cls: 'bg-rose-50 text-rose-600' },
  domain_expiry_upcoming: { icon: AlarmClock, cls: 'bg-amber-50 text-amber-600' },
  domain_expired: { icon: AlertOctagon, cls: 'bg-rose-50 text-rose-600' },
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(iso);
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<{ ids: string[]; title?: string } | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  const load = async (keepPage = false) => {
    try {
      const r = await notificationsService.list();
      const fresh = r.items || [];
      setItems(fresh);
      setUnread(r.unread || 0);
      setPage((p) => (keepPage ? Math.min(p, Math.max(1, Math.ceil(fresh.length / PAGE_SIZE))) : 1));
    } catch { toast.error('Could not load notifications'); }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  // Selection is page-scoped: any page change clears it.
  useEffect(() => { setSelected(new Set()); }, [page]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const open = (n: NotificationItem) => {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      notificationsService.markRead(n.id).catch(() => {});
    }
    if (n.subscription_id) router.push(`/dashboard/subscriptions?open=${n.subscription_id}`);
  };

  const markAll = async () => {
    try {
      await notificationsService.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
      setUnread(0);
      setPage(1);
      toast.success('All notifications marked as read');
    } catch { toast.error('Could not mark notifications as read'); }
  };

  const pageIds = pageItems.map((n) => n.id);
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length;
  const allPageSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;

  const toggleOne = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const togglePage = () => setSelected((prev) => {
    const next = new Set(prev);
    if (allPageSelected) pageIds.forEach((id) => next.delete(id));
    else pageIds.forEach((id) => next.add(id));
    return next;
  });

  const onDelete = async () => {
    if (!deleting) return;
    const single = deleting.ids.length === 1;
    setDelLoading(true);
    try {
      const r = await notificationsService.removeMany(deleting.ids);
      const n = r.deleted ?? deleting.ids.length;
      toast.success(single ? 'Notification deleted' : `${n} notification${n === 1 ? '' : 's'} deleted`);
      setDeleting(null);
      setSelected(new Set());
      await load(true);
    } catch { toast.error(single ? 'Could not delete notification' : 'Could not delete notifications'); }
    finally { setDelLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Workspace</p>
          <h2 className="mt-1.5 text-xl font-medium tracking-tight text-foreground">Notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">Renewal alerts and payment updates from your subscriptions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAll} disabled={unread === 0 || loading}><CheckCheck className="h-3.5 w-3.5" /> Mark all read</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card className="px-5 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground"><BellOff className="h-5 w-5" /></span>
          <p className="mt-3 text-sm font-medium text-foreground">You&apos;re all caught up</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">New renewal and payment alerts will appear here as they happen.</p>
        </Card>
      ) : (
        <>
        <Card className="overflow-hidden">
          <div className="flex h-11 items-center gap-3 border-b px-5">
            <label className="flex cursor-pointer select-none items-center gap-2 text-xs font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={allPageSelected}
                ref={(el) => { if (el) el.indeterminate = selectedOnPage > 0 && !allPageSelected; }}
                onChange={togglePage}
                aria-label="Select all notifications on this page"
                className="h-4 w-4 shrink-0 rounded accent-emerald-600"
              />
              Select all
            </label>
            {selected.size > 0 && (
              <span className="ml-auto flex items-center gap-1.5">
                <Button variant="destructive" size="sm" onClick={() => setDeleting({ ids: Array.from(selected) })}><Trash2 className="h-3.5 w-3.5" /> Delete selected ({selected.size})</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear selection</Button>
              </span>
            )}
          </div>
          <div className="divide-y divide-border">
            {pageItems.map((n) => {
              const meta = META[n.type] || { icon: Bell, cls: 'bg-secondary text-muted-foreground' };
              const Icon = meta.icon;
              return (
                <div key={n.id} className={cn('flex items-start gap-3 px-5 py-3.5 transition hover:bg-accent/40', !n.is_read && 'bg-emerald-50/40')}>
                  <input type="checkbox" checked={selected.has(n.id)} onChange={() => toggleOne(n.id)} aria-label={`Select "${n.title}"`} className="mt-2.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-emerald-600" />
                  <button onClick={() => open(n)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', meta.cls)}><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-[13px] text-foreground', n.is_read ? 'font-medium' : 'font-semibold')}>{n.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{n.message}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                    </span>
                    {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                  </button>
                  <button onClick={() => setDeleting({ ids: [n.id], title: n.title })} aria-label="Delete notification" className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              );
            })}
          </div>
        </Card>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        <ConfirmDialog
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={onDelete}
          loading={delLoading}
          title={deleting && deleting.ids.length > 1 ? `Delete ${deleting.ids.length} selected notifications?` : 'Delete notification?'}
          description={deleting && deleting.ids.length > 1 ? `Delete ${deleting.ids.length} selected notifications permanently? This cannot be undone.` : `Delete "${deleting?.title ?? 'this notification'}" permanently? This cannot be undone.`}
        />
        </>
      )}
    </div>
  );
}
