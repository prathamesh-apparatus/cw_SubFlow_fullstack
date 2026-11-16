'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubscriptionForm } from '@/components/subscriptions/subscription-form';
export const dynamic = 'force-dynamic';
function Inner() { const sp = useSearchParams(); return <div className="space-y-5"><h2 className="text-2xl font-bold">Add Subscription</h2><SubscriptionForm defaultCategoryId={sp.get('category') || undefined} /></div>; }
export default function NewSubscriptionPage() { return <Suspense fallback={<p>Loading…</p>}><Inner /></Suspense>; }
