export interface Admin { id: string; email: string; }
export interface Category { id: string; name: string; description?: string | null; subscription_count?: number; total_monthly_expense?: string | number; created_at: string; updated_at: string; }
export type BillingCycle = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'custom';
export type SubStatus = 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial';
export type PaymentStatus = 'paid' | 'pending' | 'failed';
export interface Subscription {
  id: string; category_id: string; category_name?: string; name: string; description?: string | null;
  website_url?: string | null; account_email: string; account_username?: string | null;
  price: string | number; currency: string; billing_cycle: BillingCycle; custom_billing_days?: number | null;
  tax_amount: string | number; total_amount: string | number; payment_method?: string | null;
  auto_pay_enabled: boolean; payment_status: PaymentStatus; payment_notes?: string | null;
  start_date?: string | null; last_payment_date?: string | null; next_renewal_date?: string | null; end_date?: string | null;
  renewal_reminder: boolean; reminder_days_before: number; status: SubStatus; auto_renewal_enabled: boolean;
  notes?: string | null; created_at: string; updated_at: string;
}
export interface Paginated<T> { items: T[]; total: number; page: number; limit: number; totalPages: number; }
export interface Overview { total_categories: number; total_subscriptions: number; active_subscriptions: number; inactive_subscriptions: number; monthly_recurring: string | number; yearly_recurring: string | number; auto_pay_enabled: number; upcoming_renewals: number; }
