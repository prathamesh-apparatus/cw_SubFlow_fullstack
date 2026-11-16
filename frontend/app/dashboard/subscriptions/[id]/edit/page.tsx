'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SubscriptionForm } from '@/components/subscriptions/subscription-form';
import { subscriptionService } from '@/services/subscription.service';
import type { Subscription } from '@/types';
export const dynamic = 'force-dynamic';
export default function EditSubscriptionPage() {
  const params = useParams(); const [sub, setSub] = useState<Subscription | null>(null);
  useEffect(() => { subscriptionService.get(String(params.id)).then(setSub).catch(() => {}); }, [params.id]);
  if (!sub) return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  return <div className="space-y-5"><div><h2 className="text-3xl font-bold tracking-tight text-foreground">Edit Subscription</h2><p className="mt-1 text-sm text-muted-foreground">Update this plan&apos;s details, pricing or renewal.</p></div><SubscriptionForm initial={sub} /></div>;
}
