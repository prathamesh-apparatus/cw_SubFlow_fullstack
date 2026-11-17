import { api } from '@/lib/api';
import type { Paginated, Subscription } from '@/types';
export const subscriptionService = { list: (params: Record<string,string>) => api.get<Paginated<Subscription>>(`/subscriptions?${new URLSearchParams(params).toString()}`), get: (id: string) => api.get<Subscription>(`/subscriptions/${id}`), create: (d: unknown) => api.post<Subscription>('/subscriptions', d), update: (id: string, d: unknown) => api.patch<Subscription>(`/subscriptions/${id}`, d), remove: (id: string) => api.delete(`/subscriptions/${id}`) };
