import { api } from '@/lib/api';
import type { Overview, Subscription } from '@/types';
export const dashboardService = { overview: () => api.get<Overview>('/dashboard/overview'), expenses: () => api.get<{month:string;label:string;total:number}[]>('/dashboard/expenses'), breakdown: () => api.get<{id:string;name:string;monthly_expense:number;subscription_count:number}[]>('/dashboard/category-breakdown'), recent: () => api.get<Subscription[]>('/dashboard/recent-subscriptions'), renewalsGrouped: () => api.get<any>('/renewals') };
