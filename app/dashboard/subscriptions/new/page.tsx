'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubscriptionForm } from '@/components/subscriptions/subscription-form';
export const dynamic = 'force-dynamic';
function Inner() { const sp = useSearchParams(); return <div className="space-y-5"><div><h2 className="text-xl font-medium tracking-tight text-foreground">Add Subscription</h2><p className="mt-1 text-sm text-muted-foreground">Track a new plan, its cost and its renewal date.</p></div><SubscriptionForm defaultCategoryId={sp.get('category') || undefined} /></div>; }
export default function NewSubscriptionPage() { return <Suspense fallback={<p>Loading…</p>}><Inner /></Suspense>; }
