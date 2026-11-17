import { api } from '@/lib/api';
export interface NotificationItem {
  id: string;
  subscription_id: string | null;
  type: 'renewal_overdue' | 'renewal_upcoming' | 'payment_failed' | string;
  title: string;
  message: string;
  dedupe_key: string;
  is_read: boolean;
  created_at: string;
}
export const notificationsService = {
  list: () => api.get<{ items: NotificationItem[]; unread: number }>('/notifications'),
  unreadCount: () => api.get<{ unread: number }>('/notifications/unread-count'),
  markRead: (id: string) => api.post<{ id: string; is_read: boolean }>(`/notifications/${id}/read`),
  markAllRead: () => api.post<{ updated: number }>('/notifications/read-all'),
};
