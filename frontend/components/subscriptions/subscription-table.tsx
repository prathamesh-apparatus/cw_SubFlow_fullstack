'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Subscription } from '@/types';
const cycleLabel: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', half_yearly: 'Half-Yearly', yearly: 'Yearly', custom: 'Custom' };
export function SubscriptionTable({ items, onDelete }: { items: Subscription[]; onDelete: (s: Subscription) => void }) {
  const router = useRouter();
  if (!items.length) return <p className="py-10 text-center text-sm text-muted-foreground">No subscriptions found.</p>;
  return <Table><THead><TR><TH>Name</TH><TH>Category</TH><TH>Account Email</TH><TH>Price</TH><TH>Cycle</TH><TH>Auto-Pay</TH><TH>Payment</TH><TH>Renewal</TH><TH>Status</TH><TH></TH></TR></THead><TBody>
    {items.map((s) => <TR key={s.id}><TD><Link href={`/dashboard/subscriptions/${s.id}`} className="font-medium hover:underline">{s.name}</Link></TD><TD>{s.category_name || '—'}</TD><TD>{s.account_email}</TD><TD className="font-medium">{formatCurrency(s.total_amount, s.currency)}</TD><TD>{cycleLabel[s.billing_cycle] || s.billing_cycle}{s.billing_cycle === 'custom' && s.custom_billing_days ? ` (${s.custom_billing_days}d)` : ''}</TD><TD>{s.auto_pay_enabled ? <Badge>Yes</Badge> : <span className="text-muted-foreground">No</span>}</TD><TD><Badge>{s.payment_status}</Badge></TD><TD>{formatDate(s.next_renewal_date)}</TD><TD><Badge>{s.status}</Badge></TD><TD><DropdownMenu><DropdownItem onClick={() => router.push(`/dashboard/subscriptions/${s.id}`)}><Eye className="h-4 w-4" /> View</DropdownItem><DropdownItem onClick={() => router.push(`/dashboard/subscriptions/${s.id}/edit`)}><Pencil className="h-4 w-4" /> Edit</DropdownItem><DropdownItem danger onClick={() => onDelete(s)}><Trash2 className="h-4 w-4" /> Delete</DropdownItem></DropdownMenu></TD></TR>)}
  </TBody></Table>;
}
