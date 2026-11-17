export interface Admin { id: string; email: string; }
export interface Category { id: string; name: string; description?: string | null; subscription_count?: number; total_monthly_expense?: string | number; created_at: string; updated_at: string; }
export type BillingCycle = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'custom';
export type SubStatus = 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial';
export type PaymentStatus = 'paid' | 'pending' | 'failed';
export interface SubscriptionMember { id?: string; name: string; email?: string | null; }
export interface Subscription {
  id: string; category_id: string; category_name?: string; name: string; description?: string | null;
  website_url?: string | null; account_email: string; account_username?: string | null;
  price: string | number; currency: string; billing_cycle: BillingCycle; custom_billing_days?: number | null;
  tax_amount: string | number; total_amount: string | number; payment_method?: string | null;
  auto_pay_enabled: boolean; payment_status: PaymentStatus; payment_notes?: string | null;
  start_date?: string | null; last_payment_date?: string | null; next_renewal_date?: string | null; end_date?: string | null;
  renewal_reminder: boolean; reminder_days_before: number; status: SubStatus; auto_renewal_enabled: boolean;
  notes?: string | null; created_at: string; updated_at: string;
  members?: SubscriptionMember[]; member_count?: number;
}
export interface Paginated<T> { items: T[]; total: number; page: number; limit: number; totalPages: number; }
export type DomainType = 'internal' | 'external';
export type DomainStatus = 'active' | 'inactive' | 'expired' | 'pending' | 'cancelled';
export type DomainBillingCycle = 'monthly' | 'yearly' | 'custom';
export interface Domain {
  id: string; domain_name: string; domain_type: DomainType; description?: string | null;
  project_id?: string | null; project_name?: string | null;
  purchased_from?: string | null; purchase_date?: string | null; purchase_cost?: string | number | null;
  currency: string; billing_cycle: DomainBillingCycle; custom_billing_days?: number | null;
  invoice_reference?: string | null; managed_by?: string | null; management_platform?: string | null;
  account_email?: string | null; responsible_person?: string | null; nameservers?: string | null;
  registration_date?: string | null; expiry_date?: string | null; next_renewal_date?: string | null;
  renewal_cost?: string | number | null; auto_renewal_enabled: boolean; renewal_reminder_enabled: boolean;
  reminder_days_before: number; status: DomainStatus; notes?: string | null;
  days_remaining?: number | null; created_at: string; updated_at: string;
}
export interface DomainCurrencyTotals { currency: string; totalPurchase: number; totalRenewal: number; yearlyCost: number; }
export interface DomainTypeTotals { domainType: DomainType; currency: string; count: number; totalPurchase: number; totalRenewal: number; }
export interface DomainProjectTotals { projectName: string; currency: string; count: number; totalPurchase: number; totalRenewal: number; }
export interface DomainStatistics {
  total: number; internal: number; external: number; active: number; expired: number; expiringSoon: number;
  costs: DomainCurrencyTotals[]; byType: DomainTypeTotals[]; byProject: DomainProjectTotals[];
  upcomingRenewals: Domain[];
}
export interface DomainFacets { projects: string[]; registrars: string[]; managers: string[]; }
export interface Overview { total_categories: number; total_subscriptions: number; active_subscriptions: number; inactive_subscriptions: number; monthly_recurring: string | number; yearly_recurring: string | number; auto_pay_enabled: number; upcoming_renewals: number; }
