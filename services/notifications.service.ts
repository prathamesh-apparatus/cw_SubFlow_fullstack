import { api } from '@/lib/api';
export interface NotificationItem {
  id: string;
  subscription_id: string | null;
  type:
    | 'renewal_overdue'
    | 'renewal_upcoming'
    | 'payment_failed'
    | 'subscription_created'
    | 'subscription_updated'
    | 'subscription_deleted'
    | 'category_created'
    | 'category_updated'
    | 'category_deleted'
    | 'settings_email_changed'
    | 'settings_password_changed'
    | 'domain_created'
    | 'domain_updated'
    | 'domain_deleted'
    | 'domain_expiry_upcoming'
    | 'domain_expired'
    | string;
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
