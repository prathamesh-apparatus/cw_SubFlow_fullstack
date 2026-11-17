import { z } from 'zod';
export const loginSchema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(1, 'Password is required') });
export const profileEmailSchema = z.object({ email: z.string().email('Enter a valid email') });
export type ProfileEmailValues = z.infer<typeof profileEmailSchema>;
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export const categorySchema = z.object({ name: z.string().min(1, 'Category name is required').max(255), description: z.string().optional().or(z.literal('')) });
export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Subscription name is required'),
  category_id: z.string().uuid('Select a category'),
  description: z.string().optional().or(z.literal('')),
  website_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  account_email: z.string().email('Enter a valid email'),
  account_username: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  currency: z.string().min(1),
  billing_cycle: z.enum(['monthly','quarterly','half_yearly','yearly','custom']),
  custom_billing_days: z.coerce.number().int().positive().optional().nullable(),
  tax_amount: z.coerce.number().min(0),
  payment_method: z.string().optional().or(z.literal('')),
  auto_pay_enabled: z.boolean(),
  payment_status: z.enum(['paid','pending','failed']),
  payment_notes: z.string().optional().or(z.literal('')),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  status: z.enum(['active','inactive','cancelled','expired','trial']),
  notes: z.string().optional().or(z.literal('')),
}).refine((d) => d.billing_cycle !== 'custom' || (d.custom_billing_days && d.custom_billing_days > 0), { message: 'Custom billing days required for custom cycle', path: ['custom_billing_days'] });
export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
